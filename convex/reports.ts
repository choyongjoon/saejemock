import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Report a title suggestion as inappropriate
 * Users must provide a reason (10-500 characters)
 * Prevents duplicate reports from the same user
 */
export const reportSuggestion = mutation({
	args: {
		suggestionId: v.id("titleSuggestions"),
		reason: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("User must be authenticated to report");
		}

		// Get user from Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Validate reason length
		const MIN_REASON_LENGTH = 10;
		const MAX_REASON_LENGTH = 500;
		if (
			args.reason.length < MIN_REASON_LENGTH ||
			args.reason.length > MAX_REASON_LENGTH
		) {
			throw new Error(
				`Reason must be between ${MIN_REASON_LENGTH} and ${MAX_REASON_LENGTH} characters`
			);
		}

		// Check if suggestion exists
		const suggestion = await ctx.db.get(args.suggestionId);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}

		// Prevent duplicate reports
		const existingReport = await ctx.db
			.query("reports")
			.withIndex("by_suggestion_reporter", (q) =>
				q.eq("suggestionId", args.suggestionId).eq("reportedBy", user._id)
			)
			.first();

		if (existingReport) {
			throw new Error("You have already reported this suggestion");
		}

		// Create report
		const reportId = await ctx.db.insert("reports", {
			suggestionId: args.suggestionId,
			reportedBy: user._id,
			reason: args.reason,
			status: "pending",
			reportedAt: Date.now(),
		});

		return reportId;
	},
});

/**
 * Get all pending reports for admin review
 * Returns enriched data with suggestion details, reporter info, and movie info
 */
export const getPendingReports = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		// Get user from Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			return [];
		}

		// Check if user is admin
		if (!user.isAdmin) {
			throw new Error("Only admins can view reports");
		}

		// Get all pending reports
		const reports = await ctx.db
			.query("reports")
			.withIndex("by_status", (q) => q.eq("status", "pending"))
			.order("desc")
			.collect();

		// Enrich with suggestion, reporter, and movie data
		const enrichedReports = await Promise.all(
			reports.map(async (report) => {
				const suggestion = await ctx.db.get(report.suggestionId);
				const reporter = await ctx.db.get(report.reportedBy);
				const movie = suggestion ? await ctx.db.get(suggestion.movieId) : null;

				return {
					...report,
					suggestion,
					reporter: reporter
						? {
								_id: reporter._id,
								name: reporter.name,
								email: reporter.email,
							}
						: null,
					movie: movie
						? {
								_id: movie._id,
								koreanTitle: movie.koreanTitle,
								originalTitle: movie.originalTitle,
								shortId: movie.shortId,
							}
						: null,
				};
			})
		);

		return enrichedReports;
	},
});

/**
 * Get report count for a specific suggestion
 */
export const getSuggestionReportCount = query({
	args: {
		suggestionId: v.id("titleSuggestions"),
	},
	handler: async (ctx, args) => {
		const reports = await ctx.db
			.query("reports")
			.withIndex("by_suggestion", (q) =>
				q.eq("suggestionId", args.suggestionId)
			)
			.collect();

		return {
			total: reports.length,
			pending: reports.filter((r) => r.status === "pending").length,
			approved: reports.filter((r) => r.status === "approved").length,
			rejected: reports.filter((r) => r.status === "rejected").length,
		};
	},
});

/**
 * Check if current user has reported a suggestion
 */
export const hasUserReported = query({
	args: {
		suggestionId: v.id("titleSuggestions"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return false;
		}

		// Get user from Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			return false;
		}

		const report = await ctx.db
			.query("reports")
			.withIndex("by_suggestion_reporter", (q) =>
				q.eq("suggestionId", args.suggestionId).eq("reportedBy", user._id)
			)
			.first();

		return !!report;
	},
});
