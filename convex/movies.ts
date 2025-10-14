import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

export const addMovie = mutation({
	args: {
		shortId: v.string(),
		originalTitle: v.string(),
		koreanTitle: v.optional(v.string()),
		releaseDate: v.optional(v.string()),
		kobisMovieCode: v.optional(v.string()),
		createdBy: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		const movieId = await ctx.db.insert("movies", {
			shortId: args.shortId,
			originalTitle: args.originalTitle,
			koreanTitle: args.koreanTitle,
			releaseDate: args.releaseDate,
			kobisMovieCode: args.kobisMovieCode,
			viewCount: 0,
			createdAt: Date.now(),
			createdBy: args.createdBy,
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

/**
 * Get movies sorted by total votes across all title suggestions
 */
export const getMoviesByTotalVotes = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;

		// Get all movies
		const movies = await ctx.db.query("movies").collect();

		// Calculate total votes for each movie
		const moviesWithVotes = await Promise.all(
			movies.map(async (movie) => {
				const suggestions = await ctx.db
					.query("titleSuggestions")
					.withIndex("by_movie", (q) => q.eq("movieId", movie._id))
					.collect();

				const totalVotes = suggestions.reduce(
					(sum, suggestion) => sum + suggestion.votesCount,
					0
				);

				return {
					...movie,
					totalVotes,
				};
			})
		);

		// Sort by total votes and return top N
		return moviesWithVotes
			.sort((a, b) => b.totalVotes - a.totalVotes)
			.slice(0, limit);
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

/**
 * Create a movie from KOBIS data with auto-generated shortId
 * Requires authentication
 */
export const addMovieFromKobis = action({
	args: {
		movieCd: v.string(),
	},
	handler: async (ctx, args): Promise<{ movieId: string; shortId: string }> => {
		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("You must be logged in to add movies");
		}

		// Get current user from database
		const user = await ctx.runQuery(api.users.current, {});

		if (!user) {
			throw new Error("User not found. Please make sure you are logged in.");
		}

		// Fetch movie data from KOBIS API
		const kobisData = await ctx.runAction(api.kobis.getMovieInfo, {
			movieCd: args.movieCd,
		});

		const movieInfo = kobisData.movieInfoResult.movieInfo;

		// Generate short ID
		const shortId: string = await ctx.runMutation(
			api.shortId.generateShortId,
			{}
		);

		// Check if movie already exists by KOBIS movie code
		const existingMovie = await ctx.runQuery(api.movies.getMovieByKobisCode, {
			movieCd: args.movieCd,
		});

		if (existingMovie) {
			throw new Error("Movie already exists in database");
		}

		// Create movie with KOBIS data
		const movieId = await ctx.runMutation(api.movies.addMovie, {
			shortId,
			originalTitle: movieInfo.movieNmEn || movieInfo.movieNmOg,
			koreanTitle: movieInfo.movieNm,
			releaseDate: movieInfo.openDt,
			kobisMovieCode: args.movieCd,
			createdBy: user._id,
		});

		// Create official title suggestion with Korean name
		if (movieInfo.movieNm) {
			await ctx.runMutation(api.titleSuggestions.addOfficialSuggestion, {
				movieId,
				title: movieInfo.movieNm,
			});
		}

		return { movieId: movieId.toString(), shortId };
	},
});

/**
 * Get movie by KOBIS movie code
 */
export const getMovieByKobisCode = query({
	args: { movieCd: v.string() },
	handler: async (ctx, args) => {
		const movie = await ctx.db
			.query("movies")
			.withIndex("by_kobisMovieCode", (q) =>
				q.eq("kobisMovieCode", args.movieCd)
			)
			.first();
		return movie;
	},
});

/**
 * Search movies in our database by title (Korean or original)
 */
export const searchMovies = query({
	args: { searchQuery: v.string() },
	handler: async (ctx, args) => {
		const searchTerm = args.searchQuery.toLowerCase().trim();

		if (!searchTerm) {
			return [];
		}

		// Get all movies and filter by title match
		const allMovies = await ctx.db.query("movies").collect();

		return allMovies.filter((movie) => {
			const koreanMatch = movie.koreanTitle?.toLowerCase().includes(searchTerm);
			const originalMatch = movie.originalTitle
				.toLowerCase()
				.includes(searchTerm);
			return koreanMatch || originalMatch;
		});
	},
});
