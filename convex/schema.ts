import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		createdAt: v.number(),
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
		createdAt: v.number(),
		createdBy: v.optional(v.id("users")),
	})
		.index("by_shortId", ["shortId"])
		.index("by_viewCount", ["viewCount"])
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
});
