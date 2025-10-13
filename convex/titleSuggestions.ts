import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add a title suggestion (requires authentication)
 */
export const addSuggestion = mutation({
	args: {
		movieId: v.id("movies"),
		title: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("You must be logged in to add title suggestions");
		}

		// Get or create user
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		const userId = user
			? user._id
			: await ctx.db.insert("users", {
					clerkId: identity.subject,
					email: identity.email,
					name: identity.name,
					createdAt: Date.now(),
				});

		const suggestionId = await ctx.db.insert("titleSuggestions", {
			movieId: args.movieId,
			title: args.title,
			description: args.description,
			votesCount: 0,
			createdAt: Date.now(),
			createdBy: userId,
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

const DEFAULT_TOP_SUGGESTIONS_LIMIT = 3;

export const getTopSuggestions = query({
	args: { movieId: v.id("movies"), limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = args.limit ?? DEFAULT_TOP_SUGGESTIONS_LIMIT;
		const suggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_votes", (q) => q.eq("movieId", args.movieId))
			.order("desc")
			.take(limit);
		return suggestions;
	},
});

/**
 * Vote for a suggestion (requires authentication)
 */
export const voteForSuggestion = mutation({
	args: {
		suggestionId: v.id("titleSuggestions"),
	},
	handler: async (ctx, args) => {
		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("You must be logged in to vote");
		}

		// Get or create user
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		const userId = user
			? user._id
			: await ctx.db.insert("users", {
					clerkId: identity.subject,
					email: identity.email,
					name: identity.name,
					createdAt: Date.now(),
				});

		// Check if user already voted
		const existingVote = await ctx.db
			.query("votes")
			.withIndex("by_suggestion_and_user", (q) =>
				q.eq("suggestionId", args.suggestionId).eq("userId", userId)
			)
			.first();

		if (existingVote) {
			throw new Error("You have already voted for this suggestion");
		}

		// Add vote
		await ctx.db.insert("votes", {
			suggestionId: args.suggestionId,
			userId,
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
