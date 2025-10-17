import { internalMutation } from "./_generated/server";
import {
	moviesByViewCount,
	moviesByCreatedAt,
	moviesByTotalVotes,
} from "./aggregates";

/**
 * Backfill all movie aggregates with existing movies
 * Use this after restoring data or when aggregates are out of sync
 */
export const backfillAllAggregates = internalMutation({
	handler: async (ctx) => {
		const movies = await ctx.db.query("movies").collect();

		console.log(`Backfilling aggregates for ${movies.length} movies...`);

		let successCount = 0;
		let skipCount = 0;
		let errorCount = 0;

		for (const movie of movies) {
			try {
				// Insert into all three aggregates
				await moviesByViewCount.insert(ctx, movie);
				await moviesByCreatedAt.insert(ctx, movie);
				await moviesByTotalVotes.insert(ctx, movie);

				console.log(
					`✓ Added movie ${movie.shortId} (viewCount: ${movie.viewCount}, totalVotes: ${movie.totalVotes ?? 0})`
				);
				successCount++;
			} catch (error) {
				// Skip if already exists
				if (
					error instanceof Error &&
					error.message.includes("already exists")
				) {
					console.log(
						`→ Skipped movie ${movie.shortId} (already in aggregates)`
					);
					skipCount++;
				} else {
					// Log other errors but continue
					console.error(`✗ Error adding movie ${movie.shortId}:`, error);
					errorCount++;
				}
			}
		}

		console.log(
			`Backfill complete! Added: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`
		);
	},
});

/**
 * Clear all movie aggregates
 * Use this when you've deleted all movies from the database
 */
export const clearAggregates = internalMutation({
	handler: async (ctx) => {
		console.log("Clearing all movie aggregates...");

		// Clear each aggregate
		await moviesByViewCount.clear(ctx);
		await moviesByCreatedAt.clear(ctx);
		await moviesByTotalVotes.clear(ctx);

		console.log("All aggregates cleared successfully!");
	},
});

/**
 * Populate all aggregates with existing movies
 * This migration ensures all movies are in the aggregates for efficient pagination
 */
export const populateAggregates = internalMutation({
	handler: async (ctx) => {
		const movies = await ctx.db.query("movies").collect();

		console.log(`Populating aggregates for ${movies.length} movies...`);

		let successCount = 0;
		let skipCount = 0;

		for (const movie of movies) {
			try {
				// Insert into all three aggregates
				await moviesByViewCount.insert(ctx, movie);
				await moviesByCreatedAt.insert(ctx, movie);
				await moviesByTotalVotes.insert(ctx, movie);

				console.log(
					`✓ Added movie ${movie.shortId} (viewCount: ${movie.viewCount}, totalVotes: ${movie.totalVotes})`
				);
				successCount++;
			} catch (error) {
				// Skip if already exists
				if (
					error instanceof Error &&
					error.message.includes("already exists")
				) {
					console.log(
						`→ Skipped movie ${movie.shortId} (already in aggregates)`
					);
					skipCount++;
				} else {
					// Re-throw other errors
					throw error;
				}
			}
		}

		console.log(
			`Aggregate population complete! Added: ${successCount}, Skipped: ${skipCount}`
		);
	},
});

/**
 * Backfill totalVotes field for existing movies
 * This migration:
 * 1. Calculates totalVotes for each movie by summing all suggestion votes
 * 2. Updates the movie record with totalVotes
 * 3. Inserts the movie into the moviesByTotalVotes aggregate
 */
export const backfillTotalVotes = internalMutation({
	handler: async (ctx) => {
		const movies = await ctx.db.query("movies").collect();

		console.log(`Starting backfill for ${movies.length} movies...`);

		for (const movie of movies) {
			// Calculate total votes from all suggestions for this movie
			const suggestions = await ctx.db
				.query("titleSuggestions")
				.withIndex("by_movie", (q) => q.eq("movieId", movie._id))
				.collect();

			const totalVotes = suggestions.reduce((sum, s) => sum + s.votesCount, 0);

			// Update movie with totalVotes if it doesn't have it or if it's different
			if (movie.totalVotes !== totalVotes) {
				await ctx.db.patch(movie._id, { totalVotes });

				// Get updated movie for aggregate insertion
				const updatedMovie = await ctx.db.get(movie._id);
				if (updatedMovie) {
					// Insert into aggregate (this will handle duplicates gracefully)
					await moviesByTotalVotes.insert(ctx, updatedMovie);
				}

				console.log(
					`Updated movie ${movie.shortId}: ${movie.totalVotes ?? 0} -> ${totalVotes} votes`
				);
			}
		}

		console.log("Backfill complete!");
	},
});

/**
 * Refresh all aggregates after component instance changes
 * Use this when you've changed aggregate component instances
 * Clears all aggregates and repopulates with current movies
 */
export const refreshAggregates = internalMutation({
	handler: async (ctx) => {
		console.log("Starting aggregate refresh...");

		// Clear all aggregates first
		console.log("Clearing aggregates...");
		await moviesByViewCount.clear(ctx);
		await moviesByTotalVotes.clear(ctx);
		await moviesByCreatedAt.clear(ctx);
		console.log("Aggregates cleared!");

		// Get all movies
		const movies = await ctx.db.query("movies").collect();
		console.log(`Found ${movies.length} movies to populate`);

		let successCount = 0;
		let errorCount = 0;

		// Populate all aggregates
		for (const movie of movies) {
			try {
				await moviesByViewCount.insert(ctx, movie);
				await moviesByTotalVotes.insert(ctx, movie);
				await moviesByCreatedAt.insert(ctx, movie);
				console.log(
					`✓ Added ${movie.shortId} (views: ${movie.viewCount}, votes: ${movie.totalVotes})`
				);
				successCount++;
			} catch (error) {
				console.error(`✗ Error adding ${movie.shortId}:`, error);
				errorCount++;
			}
		}

		console.log(
			`Refresh complete! Success: ${successCount}, Errors: ${errorCount}`
		);
		console.log(
			`Final counts - viewCount: ${await moviesByViewCount.count(ctx)}, totalVotes: ${await moviesByTotalVotes.count(ctx)}, createdAt: ${await moviesByCreatedAt.count(ctx)}`
		);
	},
});
