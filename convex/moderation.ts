import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

/**
 * Approve a report and remove the suggestion
 * - Archives suggestion to removedSuggestions table
 * - Updates movie totalVotes count
 * - Deletes the suggestion and all its votes
 * - Marks report as approved
 */
export const approveReportAndRemove = mutation({
	args: {
		reportId: v.id("reports"),
		adminNote: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User must be authenticated");
		}

		// Get user from Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Check admin permission
		if (!user.isAdmin) {
			throw new Error("Only admins can approve reports");
		}

		// Get report
		const report = await ctx.db.get(args.reportId);
		if (!report) {
			throw new Error("Report not found");
		}

		if (report.status !== "pending") {
			throw new Error("Report has already been processed");
		}

		// Get suggestion
		const suggestion = await ctx.db.get(report.suggestionId);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}

		// Archive suggestion to removedSuggestions
		await ctx.db.insert("removedSuggestions", {
			originalSuggestionId: suggestion._id,
			movieId: suggestion.movieId,
			userId: suggestion.createdBy as Id<"users">,
			title: suggestion.title,
			votes: suggestion.votesCount,
			createdAt: suggestion.createdAt,
			removedAt: Date.now(),
			removedBy: user._id,
			removalReason: report.reason,
			reportId: args.reportId,
		});

		// Get movie to update totalVotes
		const movie = await ctx.db.get(suggestion.movieId);
		if (movie) {
			await ctx.db.patch(suggestion.movieId, {
				totalVotes: Math.max(0, movie.totalVotes - suggestion.votesCount),
			});
		}

		// Delete all votes for this suggestion
		const votes = await ctx.db
			.query("votes")
			.withIndex("by_suggestion", (q) => q.eq("suggestionId", suggestion._id))
			.collect();

		for (const vote of votes) {
			await ctx.db.delete(vote._id);
		}

		// Delete the suggestion
		await ctx.db.delete(suggestion._id);

		// Update report status
		await ctx.db.patch(args.reportId, {
			status: "approved",
			reviewedBy: user._id,
			reviewedAt: Date.now(),
			adminNote: args.adminNote,
		});

		return { success: true };
	},
});

/**
 * Reject a report (keep the suggestion)
 */
export const rejectReport = mutation({
	args: {
		reportId: v.id("reports"),
		adminNote: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User must be authenticated");
		}

		// Get user from Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Check admin permission
		if (!user.isAdmin) {
			throw new Error("Only admins can reject reports");
		}

		// Get report
		const report = await ctx.db.get(args.reportId);
		if (!report) {
			throw new Error("Report not found");
		}

		if (report.status !== "pending") {
			throw new Error("Report has already been processed");
		}

		// Update report status
		await ctx.db.patch(args.reportId, {
			status: "rejected",
			reviewedBy: user._id,
			reviewedAt: Date.now(),
			adminNote: args.adminNote,
		});

		return { success: true };
	},
});

/**
 * Get moderation statistics for a user
 * Used to determine if a user should be banned
 */
export const getUserModerationStats = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User must be authenticated");
		}

		// Get user from Clerk ID
		const requester = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!requester) {
			throw new Error("User not found");
		}

		// Check admin permission
		if (!requester.isAdmin) {
			throw new Error("Only admins can view user moderation stats");
		}

		// Get all removed suggestions by this user
		const removedSuggestions = await ctx.db
			.query("removedSuggestions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		// Get all title suggestions created by this user
		const userSuggestions = await ctx.db
			.query("titleSuggestions")
			.filter((q) => q.eq(q.field("createdBy"), args.userId))
			.collect();

		const suggestionIds = userSuggestions.map((s) => s._id);
		const allReports = await Promise.all(
			suggestionIds.map((id) =>
				ctx.db
					.query("reports")
					.withIndex("by_suggestion", (q) => q.eq("suggestionId", id))
					.collect()
			)
		);

		const reports = allReports.flat();

		// Get current ban status
		const activeBan = await ctx.db
			.query("userBans")
			.withIndex("by_user_active", (q) =>
				q.eq("userId", args.userId).eq("isActive", true)
			)
			.first();

		return {
			removedCount: removedSuggestions.length,
			pendingReportsCount: reports.filter((r) => r.status === "pending").length,
			approvedReportsCount: reports.filter((r) => r.status === "approved")
				.length,
			totalReportsCount: reports.length,
			isBanned: !!activeBan,
			banExpiresAt: activeBan?.expiresAt,
		};
	},
});

/**
 * Ban a user
 * Creates a ban record and optionally sets expiration
 */
export const banUser = mutation({
	args: {
		userId: v.id("users"),
		reason: v.string(),
		durationDays: v.optional(v.number()), // undefined = permanent ban
		adminNote: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User must be authenticated");
		}

		// Get user from Clerk ID
		const admin = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!admin) {
			throw new Error("User not found");
		}

		// Check admin permission
		if (!admin.isAdmin) {
			throw new Error("Only admins can ban users");
		}

		// Deactivate any existing active bans
		const existingBans = await ctx.db
			.query("userBans")
			.withIndex("by_user_active", (q) =>
				q.eq("userId", args.userId).eq("isActive", true)
			)
			.collect();

		for (const ban of existingBans) {
			await ctx.db.patch(ban._id, { isActive: false });
		}

		// Get removed suggestions count
		const removedSuggestions = await ctx.db
			.query("removedSuggestions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		// Create new ban
		const HOURS_PER_DAY = 24;
		const MINUTES_PER_HOUR = 60;
		const SECONDS_PER_MINUTE = 60;
		const MILLISECONDS_PER_SECOND = 1000;
		const MILLISECONDS_PER_DAY =
			HOURS_PER_DAY *
			MINUTES_PER_HOUR *
			SECONDS_PER_MINUTE *
			MILLISECONDS_PER_SECOND;
		const expiresAt = args.durationDays
			? Date.now() + args.durationDays * MILLISECONDS_PER_DAY
			: undefined;

		await ctx.db.insert("userBans", {
			userId: args.userId,
			bannedBy: admin._id,
			bannedAt: Date.now(),
			reason: args.reason,
			expiresAt,
			isActive: true,
			removedSuggestionsCount: removedSuggestions.length,
			adminNote: args.adminNote,
		});

		return { success: true };
	},
});

/**
 * Unban a user
 */
export const unbanUser = mutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User must be authenticated");
		}

		// Get user from Clerk ID
		const admin = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!admin) {
			throw new Error("User not found");
		}

		// Check admin permission
		if (!admin.isAdmin) {
			throw new Error("Only admins can unban users");
		}

		// Deactivate all active bans
		const activeBans = await ctx.db
			.query("userBans")
			.withIndex("by_user_active", (q) =>
				q.eq("userId", args.userId).eq("isActive", true)
			)
			.collect();

		for (const ban of activeBans) {
			await ctx.db.patch(ban._id, { isActive: false });
		}

		return { success: true };
	},
});

/**
 * Check if a user is currently banned
 */
export const isUserBanned = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const activeBan = await ctx.db
			.query("userBans")
			.withIndex("by_user_active", (q) =>
				q.eq("userId", args.userId).eq("isActive", true)
			)
			.first();

		if (!activeBan) {
			return { isBanned: false };
		}

		// Check if ban has expired (note: expiration cleanup should be done via a cron job or mutation)
		if (activeBan.expiresAt && activeBan.expiresAt < Date.now()) {
			return { isBanned: false };
		}

		return {
			isBanned: true,
			reason: activeBan.reason,
			expiresAt: activeBan.expiresAt,
		};
	},
});
