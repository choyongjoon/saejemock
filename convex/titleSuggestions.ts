import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { moviesByTotalVotes } from "./aggregates";

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

		// Check for duplicate title
		const existingSuggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
			.collect();

		const duplicateExists = existingSuggestions.some(
			(s) => s.title.trim() === args.title.trim()
		);

		if (duplicateExists) {
			throw new Error("A suggestion with this title already exists");
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
			isOfficial: false,
		});
		return suggestionId;
	},
});

/**
 * Add an official title suggestion (internal use, no authentication required)
 */
export const addOfficialSuggestion = mutation({
	args: {
		movieId: v.id("movies"),
		title: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check for duplicate title
		const existingSuggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
			.collect();

		const duplicateExists = existingSuggestions.some(
			(s) => s.title.trim() === args.title.trim()
		);

		if (duplicateExists) {
			// Don't throw error for official suggestions, just skip
			return null;
		}

		const suggestionId = await ctx.db.insert("titleSuggestions", {
			movieId: args.movieId,
			title: args.title,
			description: args.description,
			votesCount: 0,
			createdAt: Date.now(),
			isOfficial: true,
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

/**
 * Get user's vote for a movie (returns the suggestion they voted for)
 */
export const getUserVoteForMovie = query({
	args: {
		movieId: v.id("movies"),
	},
	handler: async (ctx, args) => {
		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		// Get user
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		if (!user) {
			return null;
		}

		// Get all suggestions for this movie
		const suggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
			.collect();

		// Check if user voted for any suggestion in this movie
		for (const suggestion of suggestions) {
			const vote = await ctx.db
				.query("votes")
				.withIndex("by_suggestion_and_user", (q) =>
					q.eq("suggestionId", suggestion._id).eq("userId", user._id)
				)
				.first();

			if (vote) {
				return { suggestionId: suggestion._id, voteId: vote._id };
			}
		}

		return null;
	},
});

/**
 * Delete a suggestion (requires authentication and creator ownership)
 */
export const deleteSuggestion = mutation({
	args: {
		suggestionId: v.id("titleSuggestions"),
	},
	handler: async (ctx, args) => {
		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("You must be logged in to delete suggestions");
		}

		// Get user
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		// Get the suggestion
		const suggestion = await ctx.db.get(args.suggestionId);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}

		// Check if user is the creator
		if (suggestion.createdBy !== user._id) {
			throw new Error("You can only delete your own suggestions");
		}

		// Don't allow deleting official suggestions
		if (suggestion.isOfficial) {
			throw new Error("Cannot delete official suggestions");
		}

		// Delete all votes for this suggestion
		const votes = await ctx.db
			.query("votes")
			.withIndex("by_suggestion", (q) =>
				q.eq("suggestionId", args.suggestionId)
			)
			.collect();

		for (const vote of votes) {
			await ctx.db.delete(vote._id);
		}

		// Delete all comments for this suggestion
		const comments = await ctx.db
			.query("comments")
			.withIndex("by_suggestion", (q) =>
				q.eq("suggestionId", args.suggestionId)
			)
			.collect();

		for (const comment of comments) {
			await ctx.db.delete(comment._id);
		}

		// Update movie totalVotes before deleting suggestion
		const oldMovie = await ctx.db.get(suggestion.movieId);
		if (oldMovie) {
			await ctx.db.patch(suggestion.movieId, {
				totalVotes: Math.max(0, oldMovie.totalVotes - suggestion.votesCount),
			});

			// Update aggregate
			const updatedMovie = await ctx.db.get(suggestion.movieId);
			if (updatedMovie) {
				await moviesByTotalVotes.replace(ctx, oldMovie, updatedMovie);
			}
		}

		// Delete the suggestion
		await ctx.db.delete(args.suggestionId);
	},
});

/**
 * Cancel a vote (requires authentication)
 */
export const cancelVote = mutation({
	args: {
		suggestionId: v.id("titleSuggestions"),
	},
	handler: async (ctx, args) => {
		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("You must be logged in to cancel vote");
		}

		// Get user
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		// Find the vote
		const vote = await ctx.db
			.query("votes")
			.withIndex("by_suggestion_and_user", (q) =>
				q.eq("suggestionId", args.suggestionId).eq("userId", user._id)
			)
			.first();

		if (!vote) {
			throw new Error("Vote not found");
		}

		// Delete the vote
		await ctx.db.delete(vote._id);

		// Decrement vote count
		const suggestion = await ctx.db.get(args.suggestionId);
		if (suggestion) {
			await ctx.db.patch(args.suggestionId, {
				votesCount: Math.max(0, suggestion.votesCount - 1),
			});

			// Update movie totalVotes
			const oldMovie = await ctx.db.get(suggestion.movieId);
			if (oldMovie) {
				await ctx.db.patch(suggestion.movieId, {
					totalVotes: Math.max(0, oldMovie.totalVotes - 1),
				});

				// Update aggregate
				const updatedMovie = await ctx.db.get(suggestion.movieId);
				if (updatedMovie) {
					await moviesByTotalVotes.replace(ctx, oldMovie, updatedMovie);
				}
			}
		}
	},
});

/**
 * Vote for a suggestion (requires authentication)
 * Only one vote per movie is allowed
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

		// Get the suggestion to find the movie
		const suggestion = await ctx.db.get(args.suggestionId);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}

		// Check if user already voted for ANY suggestion in this movie
		const allSuggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_movie", (q) => q.eq("movieId", suggestion.movieId))
			.collect();

		for (const s of allSuggestions) {
			const existingVote = await ctx.db
				.query("votes")
				.withIndex("by_suggestion_and_user", (q) =>
					q.eq("suggestionId", s._id).eq("userId", userId)
				)
				.first();

			if (existingVote) {
				throw new Error("You can only vote for one suggestion per movie");
			}
		}

		// Add vote
		await ctx.db.insert("votes", {
			suggestionId: args.suggestionId,
			userId,
			createdAt: Date.now(),
		});

		// Increment vote count
		await ctx.db.patch(args.suggestionId, {
			votesCount: suggestion.votesCount + 1,
		});

		// Update movie totalVotes
		const oldMovie = await ctx.db.get(suggestion.movieId);
		if (oldMovie) {
			await ctx.db.patch(suggestion.movieId, {
				totalVotes: oldMovie.totalVotes + 1,
			});

			// Update aggregate
			const updatedMovie = await ctx.db.get(suggestion.movieId);
			if (updatedMovie) {
				await moviesByTotalVotes.replace(ctx, oldMovie, updatedMovie);
			}
		}
	},
});

/**
 * Get current user's title suggestions
 */
export const getMyTitleSuggestions = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		if (!user) {
			return [];
		}

		const suggestions = await ctx.db
			.query("titleSuggestions")
			.filter((q) => q.eq(q.field("createdBy"), user._id))
			.collect();

		// Enrich with movie data
		const enrichedSuggestions = await Promise.all(
			suggestions.map(async (suggestion) => {
				const movie = await ctx.db.get(suggestion.movieId);
				return {
					...suggestion,
					movie: movie
						? {
								_id: movie._id,
								koreanTitle: movie.koreanTitle,
								shortId: movie.shortId,
							}
						: null,
				};
			})
		);

		return enrichedSuggestions.sort((a, b) => b.createdAt - a.createdAt);
	},
});

/**
 * Get suggestions the current user has voted for
 */
export const getMyVotedSuggestions = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.first();

		if (!user) {
			return [];
		}

		const votes = await ctx.db
			.query("votes")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		// Enrich with suggestion and movie data
		const enrichedVotes = await Promise.all(
			votes.map(async (vote) => {
				const suggestion = await ctx.db.get(vote.suggestionId);
				if (!suggestion) {
					return null;
				}

				const movie = await ctx.db.get(suggestion.movieId);
				return {
					...vote,
					suggestion: {
						...suggestion,
						movie: movie
							? {
									_id: movie._id,
									koreanTitle: movie.koreanTitle,
									shortId: movie.shortId,
								}
							: null,
					},
				};
			})
		);

		return enrichedVotes
			.filter((vote) => vote !== null)
			.sort((a, b) => b.createdAt - a.createdAt);
	},
});
