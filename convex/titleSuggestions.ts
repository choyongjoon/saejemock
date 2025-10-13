import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addSuggestion = mutation({
	args: {
		movieId: v.id("movies"),
		title: v.string(),
		description: v.optional(v.string()),
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		const suggestionId = await ctx.db.insert("titleSuggestions", {
			movieId: args.movieId,
			title: args.title,
			description: args.description,
			votesCount: 0,
			createdAt: Date.now(),
			createdBy: args.userId,
		});
		return suggestionId;
	},
});

export const getSuggestionsByMovie = query({
	args: { movieId: v.id("movies") },
	handler: async (ctx, args) => {
		const suggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
			.collect();
		return suggestions;
	},
});

export const getTopSuggestions = query({
	args: { movieId: v.id("movies"), limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = args.limit ?? 3;
		const suggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_votes", (q) => q.eq("movieId", args.movieId))
			.order("desc")
			.take(limit);
		return suggestions;
	},
});

export const voteForSuggestion = mutation({
	args: {
		suggestionId: v.id("titleSuggestions"),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		// Check if user already voted
		const existingVote = await ctx.db
			.query("votes")
			.withIndex("by_suggestion_and_user", (q) =>
				q.eq("suggestionId", args.suggestionId).eq("userId", args.userId)
			)
			.first();

		if (existingVote) {
			throw new Error("User already voted for this suggestion");
		}

		// Add vote
		await ctx.db.insert("votes", {
			suggestionId: args.suggestionId,
			userId: args.userId,
			createdAt: Date.now(),
		});

		// Increment vote count
		const suggestion = await ctx.db.get(args.suggestionId);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}
		await ctx.db.patch(args.suggestionId, {
			votesCount: suggestion.votesCount + 1,
		});
	},
});

export const addComment = mutation({
	args: {
		suggestionId: v.id("titleSuggestions"),
		userId: v.id("users"),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const commentId = await ctx.db.insert("comments", {
			suggestionId: args.suggestionId,
			userId: args.userId,
			content: args.content,
			createdAt: Date.now(),
		});
		return commentId;
	},
});

export const getCommentsBySuggestion = query({
	args: { suggestionId: v.id("titleSuggestions") },
	handler: async (ctx, args) => {
		const comments = await ctx.db
			.query("comments")
			.withIndex("by_suggestion", (q) =>
				q.eq("suggestionId", args.suggestionId)
			)
			.collect();
		return comments;
	},
});
