import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		createdAt: v.number(),
		isAdmin: v.optional(v.boolean()),
	}).index("by_clerkId", ["clerkId"]),
	movies: defineTable({
		shortId: v.string(),
		originalTitle: v.optional(v.string()),
		englishTitle: v.optional(v.string()),
		koreanTitle: v.string(),
		releaseDate: v.optional(v.string()),
		kobisMovieCode: v.string(),
		year: v.optional(v.string()),
		directors: v.optional(v.string()),
		additionalInfo: v.optional(v.string()),
		viewCount: v.number(),
		totalVotes: v.number(),
		createdAt: v.number(),
		createdBy: v.optional(v.id("users")),
	})
		.index("by_shortId", ["shortId"])
		.index("by_viewCount", ["viewCount"])
		.index("by_totalVotes", ["totalVotes"])
		.index("by_createdAt", ["createdAt"])
		.index("by_kobisMovieCode", ["kobisMovieCode"]),
	titleSuggestions: defineTable({
		movieId: v.id("movies"),
		title: v.string(),
		description: v.optional(v.string()),
		votesCount: v.number(),
		createdAt: v.number(),
		createdBy: v.optional(v.id("users")),
		isOfficial: v.optional(v.boolean()),
	})
		.index("by_movie", ["movieId"])
		.index("by_votes", ["movieId", "votesCount"]),
	votes: defineTable({
		suggestionId: v.id("titleSuggestions"),
		userId: v.id("users"),
		createdAt: v.number(),
	})
		.index("by_suggestion", ["suggestionId"])
		.index("by_user", ["userId"])
		.index("by_suggestion_and_user", ["suggestionId", "userId"]),
	comments: defineTable({
		suggestionId: v.id("titleSuggestions"),
		userId: v.id("users"),
		content: v.string(),
		createdAt: v.number(),
	})
		.index("by_suggestion", ["suggestionId"])
		.index("by_user", ["userId"]),
	// Reports for inappropriate suggestions
	reports: defineTable({
		suggestionId: v.id("titleSuggestions"),
		reportedBy: v.id("users"),
		reason: v.string(), // User's explanation of why it's inappropriate
		status: v.union(
			v.literal("pending"),
			v.literal("approved"),
			v.literal("rejected")
		),
		reportedAt: v.number(),
		reviewedAt: v.optional(v.number()),
		reviewedBy: v.optional(v.id("users")),
		adminNote: v.optional(v.string()),
	})
		.index("by_suggestion", ["suggestionId"])
		.index("by_reporter", ["reportedBy"])
		.index("by_suggestion_reporter", ["suggestionId", "reportedBy"])
		.index("by_status", ["status"]),
	// Removed suggestions archive
	removedSuggestions: defineTable({
		// Original suggestion data
		originalSuggestionId: v.id("titleSuggestions"),
		movieId: v.id("movies"),
		userId: v.id("users"),
		title: v.string(),
		votes: v.number(),
		createdAt: v.number(),
		// Removal metadata
		removedAt: v.number(),
		removedBy: v.id("users"), // Admin who removed it
		removalReason: v.string(),
		reportId: v.id("reports"), // Link to the report that caused removal
	})
		.index("by_original_suggestion", ["originalSuggestionId"])
		.index("by_user", ["userId"])
		.index("by_removed_at", ["removedAt"]),
	// User bans
	userBans: defineTable({
		userId: v.id("users"),
		bannedBy: v.id("users"), // Admin who issued the ban
		reason: v.string(),
		bannedAt: v.number(),
		expiresAt: v.optional(v.number()), // undefined = permanent ban
		isActive: v.boolean(),
		// Statistics at time of ban
		removedSuggestionsCount: v.number(),
		adminNote: v.optional(v.string()),
	})
		.index("by_user", ["userId"])
		.index("by_user_active", ["userId", "isActive"]),
});
