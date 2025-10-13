import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addMovie = mutation({
	args: {
		shortId: v.string(),
		originalTitle: v.string(),
		koreanTitle: v.optional(v.string()),
		posterUrl: v.optional(v.string()),
		imdbId: v.optional(v.string()),
		imdbUrl: v.optional(v.string()),
		watchaPediaUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const movieId = await ctx.db.insert("movies", {
			shortId: args.shortId,
			originalTitle: args.originalTitle,
			koreanTitle: args.koreanTitle,
			posterUrl: args.posterUrl,
			imdbId: args.imdbId,
			imdbUrl: args.imdbUrl,
			watchaPediaUrl: args.watchaPediaUrl,
			viewCount: 0,
			createdAt: Date.now(),
		});
		return movieId;
	},
});

export const getMovieByShortId = query({
	args: { shortId: v.string() },
	handler: async (ctx, args) => {
		const movie = await ctx.db
			.query("movies")
			.withIndex("by_shortId", (q) => q.eq("shortId", args.shortId))
			.first();

		if (!movie) {
			return null;
		}

		// Get all title suggestions for this movie, ordered by votes
		const titleSuggestions = await ctx.db
			.query("titleSuggestions")
			.withIndex("by_votes", (q) => q.eq("movieId", movie._id))
			.order("desc")
			.collect();

		return {
			...movie,
			titleSuggestions,
		};
	},
});

export const getMoviesByViewCount = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const movies = await ctx.db
			.query("movies")
			.withIndex("by_viewCount")
			.order("desc")
			.take(limit);
		return movies;
	},
});

export const getMoviesByCreatedAt = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const movies = await ctx.db
			.query("movies")
			.withIndex("by_createdAt")
			.order("desc")
			.take(limit);
		return movies;
	},
});

export const incrementViewCount = mutation({
	args: { movieId: v.id("movies") },
	handler: async (ctx, args) => {
		const movie = await ctx.db.get(args.movieId);
		if (!movie) {
			throw new Error("Movie not found");
		}
		await ctx.db.patch(args.movieId, {
			viewCount: movie.viewCount + 1,
		});
	},
});
