import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import {
	moviesByCreatedAt,
	moviesByTotalVotes,
	moviesByViewCount,
} from "./aggregates";

export const addMovie = mutation({
	args: {
		shortId: v.string(),
		originalTitle: v.optional(v.string()),
		englishTitle: v.optional(v.string()),
		koreanTitle: v.string(),
		releaseDate: v.string(),
		kobisMovieCode: v.string(),
		year: v.optional(v.string()),
		directors: v.optional(v.string()),
		additionalInfo: v.optional(v.string()),
		createdBy: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		// Check if movie already exists to prevent double insertion
		const existingMovie = await ctx.db
			.query("movies")
			.withIndex("by_kobisMovieCode", (q) =>
				q.eq("kobisMovieCode", args.kobisMovieCode)
			)
			.first();

		if (existingMovie) {
			return existingMovie._id;
		}

		const movie = {
			shortId: args.shortId,
			originalTitle: args.originalTitle,
			englishTitle: args.englishTitle,
			koreanTitle: args.koreanTitle,
			releaseDate: args.releaseDate,
			kobisMovieCode: args.kobisMovieCode,
			year: args.year,
			directors: args.directors,
			additionalInfo: args.additionalInfo,
			viewCount: 0,
			totalVotes: 0,
			createdAt: Date.now(),
			createdBy: args.createdBy,
		};

		const movieId = await ctx.db.insert("movies", movie);

		// Update aggregates
		const insertedMovie = await ctx.db.get(movieId);
		if (insertedMovie) {
			await moviesByViewCount.insert(ctx, insertedMovie);
			await moviesByTotalVotes.insert(ctx, insertedMovie);
			await moviesByCreatedAt.insert(ctx, insertedMovie);
		}

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
	args: {
		limit: v.optional(v.number()),
		page: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const page = args.page ?? 1;
		const offset = (page - 1) * limit;

		// Get total count efficiently
		const totalCount = await moviesByViewCount.count(ctx);

		// If offset is beyond the data, return empty
		if (offset >= totalCount) {
			return {
				movies: [],
				totalCount,
				page,
				totalPages: Math.ceil(totalCount / limit),
			};
		}

		// Get the key at the offset position (negative key for descending order)
		const { key } = await moviesByViewCount.at(ctx, offset);

		// Query from that key (remember key is negative)
		const movies = await ctx.db
			.query("movies")
			.withIndex("by_viewCount", (q) => q.gte("viewCount", -key))
			.order("desc")
			.take(limit);

		return {
			movies,
			totalCount,
			page,
			totalPages: Math.ceil(totalCount / limit),
		};
	},
});

export const getMoviesByCreatedAt = query({
	args: {
		limit: v.optional(v.number()),
		page: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const page = args.page ?? 1;
		const offset = (page - 1) * limit;

		// Get total count efficiently
		const totalCount = await moviesByCreatedAt.count(ctx);

		// If offset is beyond the data, return empty
		if (offset >= totalCount) {
			return {
				movies: [],
				totalCount,
				page,
				totalPages: Math.ceil(totalCount / limit),
			};
		}

		// Get the key at the offset position (negative key for descending order)
		const { key } = await moviesByCreatedAt.at(ctx, offset);

		// Query from that key (remember key is negative)
		const movies = await ctx.db
			.query("movies")
			.withIndex("by_createdAt", (q) => q.gte("createdAt", -key))
			.order("desc")
			.take(limit);

		return {
			movies,
			totalCount,
			page,
			totalPages: Math.ceil(totalCount / limit),
		};
	},
});

/**
 * Get movies sorted by total votes
 * Uses denormalized totalVotes field for O(log n) performance
 */
export const getMoviesByTotalVotes = query({
	args: {
		limit: v.optional(v.number()),
		page: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const page = args.page ?? 1;
		const offset = (page - 1) * limit;

		// Get total count efficiently
		const totalCount = await moviesByTotalVotes.count(ctx);

		// If offset is beyond the data, return empty
		if (offset >= totalCount) {
			return {
				movies: [],
				totalCount,
				page,
				totalPages: Math.ceil(totalCount / limit),
			};
		}

		// Get the key at the offset position (negative key for descending order)
		const { key } = await moviesByTotalVotes.at(ctx, offset);

		// Query from that key (remember key is negative)
		const movies = await ctx.db
			.query("movies")
			.withIndex("by_totalVotes", (q) => q.gte("totalVotes", -key))
			.order("desc")
			.take(limit);

		return {
			movies,
			totalCount,
			page,
			totalPages: Math.ceil(totalCount / limit),
		};
	},
});

export const incrementViewCount = mutation({
	args: { movieId: v.id("movies") },
	handler: async (ctx, args) => {
		const oldMovie = await ctx.db.get(args.movieId);
		if (!oldMovie) {
			throw new Error("Movie not found");
		}

		const newViewCount = oldMovie.viewCount + 1;
		await ctx.db.patch(args.movieId, {
			viewCount: newViewCount,
		});

		// Update aggregate with new view count
		const updatedMovie = await ctx.db.get(args.movieId);
		if (updatedMovie) {
			await moviesByViewCount.replace(ctx, oldMovie, updatedMovie);
		}
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

		// Extract directors
		const directors = movieInfo.directors
			?.map((d: { peopleNm: string }) => d.peopleNm)
			.join(", ");

		// Extract additional info (nation and genres)
		const nationAlt = movieInfo.nations
			?.map((n: { nationNm: string }) => n.nationNm)
			.join(", ");
		const genreAlt = movieInfo.genres
			?.map((g: { genreNm: string }) => g.genreNm)
			.join(", ");
		const additionalInfo = [nationAlt, genreAlt].filter(Boolean).join(" • ");

		// Create movie with KOBIS data
		const movieId = await ctx.runMutation(api.movies.addMovie, {
			shortId,
			originalTitle: movieInfo.movieNmOg,
			englishTitle: movieInfo.movieNmEn,
			koreanTitle: movieInfo.movieNm,
			releaseDate: movieInfo.openDt,
			kobisMovieCode: args.movieCd,
			year: movieInfo.prdtYear,
			directors,
			additionalInfo,
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
	args: {
		searchQuery: v.string(),
		searchType: v.optional(v.union(v.literal("title"), v.literal("director"))),
	},
	handler: async (ctx, args) => {
		const searchTerm = args.searchQuery.toLowerCase().trim();
		const searchType = args.searchType ?? "title";

		if (!searchTerm) {
			return [];
		}

		// Get all movies and filter by search type
		const allMovies = await ctx.db.query("movies").collect();

		return allMovies.filter((movie) => {
			if (searchType === "director") {
				// Search by director name
				const directorMatch = movie.directors
					?.toLowerCase()
					.includes(searchTerm);
				return directorMatch;
			}

			// Default: search by title
			const koreanMatch = movie.koreanTitle?.toLowerCase().includes(searchTerm);
			const originalMatch = movie.originalTitle
				?.toLowerCase()
				.includes(searchTerm);
			return koreanMatch || originalMatch;
		});
	},
});
