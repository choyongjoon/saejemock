/**
 * Test script to verify original title extraction for 화양연화 (In the Mood for Love)
 *
 * Run this with: npx convex run testMovieTitle:testMovieTitleExtraction
 */

import { api } from "./_generated/api";
import { action } from "./_generated/server";

type TestResult = {
	success: boolean;
	movieCode?: string;
	titles?: {
		korean: string;
		english: string;
		original: string;
	};
	savedAs?: {
		koreanTitle: string;
		englishTitle: string;
		originalTitle: string;
	};
	error?: string;
};

export const testMovieTitleExtraction = action({
	args: {},
	handler: async (ctx): Promise<TestResult> => {
		console.log("=".repeat(60));
		console.log("Testing Movie Title Extraction for 화양연화");
		console.log("=".repeat(60));

		try {
			// Step 1: Search for the movie - using "화양연화" with better filtering
			console.log("\n[Step 1] Searching for '화양연화'...");
			const searchResults = await ctx.runAction(api.kobis.searchMoviesByTitle, {
				movieNm: "화양연화",
				itemPerPage: 30, // Get more results to find the right movie
			});

			if (!searchResults.movieListResult.movieList.length) {
				console.error("❌ No movies found for '화양연화'");
				return {
					success: false,
					error: "No movies found",
				};
			}

			// Show search results and find the Wong Kar-wai movie
			console.log(
				`\n✅ Found ${searchResults.movieListResult.movieList.length} movies:`
			);

			// Filter to find the Wong Kar-wai film (2000 production year, Hong Kong film)
			const wongKarWaiMovie = searchResults.movieListResult.movieList.find(
				(movie) => {
					const isRightYear = movie.prdtYear === "2000";
					const hasEnglishTitle = movie.movieNmEn
						?.toLowerCase()
						.includes("mood");
					const isShortTitle = movie.movieNm === "화양연화";
					return isRightYear || hasEnglishTitle || isShortTitle;
				}
			);

			if (!wongKarWaiMovie) {
				console.log("\nShowing all results to find the right one:");
				for (const movie of searchResults.movieListResult.movieList) {
					console.log(
						`  - ${movie.movieNm} (${movie.prdtYear}) [${movie.movieCd}]`
					);
					console.log(`    English: ${movie.movieNmEn || "N/A"}`);
					console.log(
						`    Directors: ${movie.directors?.map((d: { peopleNm: string }) => d.peopleNm).join(", ") || "N/A"}`
					);
				}
				console.error("\n❌ Could not find 'In the Mood for Love' (2000)");
				return {
					success: false,
					error: "Could not find the specific movie",
				};
			}

			const targetMovie = wongKarWaiMovie;
			console.log(
				`\n✅ Found target movie: ${targetMovie.movieNm} (${targetMovie.prdtYear})`
			);
			console.log(
				`   English (from list API): ${targetMovie.movieNmEn || "N/A"}`
			);
			console.log(
				`\n[Step 2] Testing with: ${targetMovie.movieNm} (${targetMovie.movieCd})`
			);

			// Step 2: Get detailed movie info
			console.log("\n[Step 3] Fetching detailed movie info...");
			const movieInfo = await ctx.runAction(api.kobis.getMovieInfo, {
				movieCd: targetMovie.movieCd,
			});

			const info = movieInfo.movieInfoResult.movieInfo;

			// Step 3: Display extracted titles
			console.log("\n" + "=".repeat(60));
			console.log("Title Extraction Results:");
			console.log("=".repeat(60));
			console.log(`Korean Title (movieNm):     ${info.movieNm}`);
			console.log(`English Title (movieNmEn):  ${info.movieNmEn || "N/A"}`);
			console.log(`Original Title (movieNmOg): ${info.movieNmOg || "N/A"}`);
			console.log("\n" + "=".repeat(60));
			console.log("What will be saved to database:");
			console.log("=".repeat(60));
			console.log(`koreanTitle:   ${info.movieNm}`);
			console.log(`englishTitle:  ${info.movieNmEn || "N/A"}`);
			console.log(
				`originalTitle: ${info.movieNmOg || info.movieNmEn || info.movieNm}`
			);

			// Step 4: Show additional info
			console.log("\n" + "=".repeat(60));
			console.log("Additional Information:");
			console.log("=".repeat(60));
			console.log(`Production Year: ${info.prdtYear}`);
			console.log(`Release Date:    ${info.openDt}`);
			console.log(
				`Directors:       ${info.directors?.map((d: { peopleNm: string }) => d.peopleNm).join(", ")}`
			);
			console.log(
				`Nations:         ${info.nations?.map((n: { nationNm: string }) => n.nationNm).join(", ")}`
			);
			console.log(
				`Genres:          ${info.genres?.map((g: { genreNm: string }) => g.genreNm).join(", ")}`
			);

			// Step 5: Validation
			console.log("\n" + "=".repeat(60));
			console.log("Validation:");
			console.log("=".repeat(60));

			const hasOriginalTitle = Boolean(info.movieNmOg);
			const hasEnglishTitle = Boolean(info.movieNmEn);
			const hasKoreanTitle = Boolean(info.movieNm);

			console.log(`✅ Has Korean Title:   ${hasKoreanTitle ? "YES" : "NO"}`);
			console.log(`✅ Has English Title:  ${hasEnglishTitle ? "YES" : "NO"}`);
			console.log(`✅ Has Original Title: ${hasOriginalTitle ? "YES" : "NO"}`);

			if (hasOriginalTitle && hasEnglishTitle && hasKoreanTitle) {
				console.log("\n✅ SUCCESS: All title fields are properly extracted!");
			} else {
				console.log("\n⚠️  WARNING: Some title fields are missing");
			}

			return {
				success: true,
				movieCode: targetMovie.movieCd,
				titles: {
					korean: info.movieNm,
					english: info.movieNmEn,
					original: info.movieNmOg,
				},
				savedAs: {
					koreanTitle: info.movieNm,
					englishTitle: info.movieNmEn,
					originalTitle: info.movieNmOg || info.movieNmEn || info.movieNm,
				},
			};
		} catch (error) {
			console.error("\n❌ Error during test:");
			console.error(error);
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	},
});
