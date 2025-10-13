import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	products: defineTable({
		title: v.string(),
		imageId: v.string(),
		price: v.number(),
	}),
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
	movies: defineTable({
		shortId: v.string(),
		originalTitle: v.string(),
		koreanTitle: v.optional(v.string()),
		posterUrl: v.optional(v.string()),
		imdbId: v.optional(v.string()),
		imdbUrl: v.optional(v.string()),
		viewCount: v.number(),
		createdAt: v.number(),
	})
		.index("by_shortId", ["shortId"])
		.index("by_viewCount", ["viewCount"])
		.index("by_createdAt", ["createdAt"]),
	titleSuggestions: defineTable({
		movieId: v.id("movies"),
		title: v.string(),
		description: v.optional(v.string()),
		votesCount: v.number(),
		createdAt: v.number(),
		createdBy: v.optional(v.id("users")),
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
