/**
 * Test script to verify director search functionality with 왕가위 (Wong Kar-wai)
 *
 * Run this with: pnpm convex run testDirectorSearch:testWongKarWaiSearch
 */

import { api } from "./_generated/api";
import { action } from "./_generated/server";

type TestResult = {
	success: boolean;
	kobisResults?: {
		totalCount: number;
		movies: Array<{
			title: string;
			year: string;
			directors: string;
		}>;
	};
	error?: string;
};

export const testWongKarWaiSearch = action({
	args: {},
	handler: async (ctx): Promise<TestResult> => {
		console.log("=".repeat(60));
		console.log("Testing Director Search for 왕가위 (Wong Kar-wai)");
		console.log("=".repeat(60));

		try {
			// Search for movies by director name
			console.log("\n[Step 1] Searching KOBIS for director '왕가위'...");
			const searchResults = await ctx.runAction(
				api.kobis.searchMoviesByDirector,
				{
					directorNm: "왕가위",
					itemPerPage: 20,
				}
			);

			if (!searchResults.movieListResult.movieList.length) {
				console.error("❌ No movies found for director '왕가위'");
				return {
					success: false,
					error: "No movies found",
				};
			}

			// Show search results
			console.log(
				`\n✅ Found ${searchResults.movieListResult.movieList.length} movies directed by 왕가위:`
			);
			console.log("\n" + "=".repeat(60));
			console.log("Movies List:");
			console.log("=".repeat(60));

			const movieList = searchResults.movieListResult.movieList.map((movie) => {
				const directors = movie.directors
					.map((d: { peopleNm: string }) => d.peopleNm)
					.join(", ");

				console.log(`\n${movie.movieNm} (${movie.prdtYear})`);
				console.log(`  코드: ${movie.movieCd}`);
				console.log(`  감독: ${directors}`);
				console.log(`  개봉일: ${movie.openDt}`);
				if (movie.movieNmEn) {
					console.log(`  영문 제목: ${movie.movieNmEn}`);
				}

				return {
					title: movie.movieNm,
					year: movie.prdtYear,
					directors,
				};
			});

			// Validation
			console.log("\n" + "=".repeat(60));
			console.log("Validation:");
			console.log("=".repeat(60));

			const allHaveWongKarWai = searchResults.movieListResult.movieList.every(
				(movie) =>
					movie.directors.some(
						(d: { peopleNm: string }) =>
							d.peopleNm.includes("왕가위") || d.peopleNm.includes("Wong")
					)
			);

			console.log(
				`✅ All movies directed by 왕가위: ${allHaveWongKarWai ? "YES" : "NO"}`
			);
			console.log(
				`✅ Total movies found: ${searchResults.movieListResult.movieList.length}`
			);

			// Check for famous movies
			const famousMovies = ["화양연화", "중경삼림", "아비정전", "타락천사"];
			const foundFamousMovies = searchResults.movieListResult.movieList.filter(
				(movie) => famousMovies.some((famous) => movie.movieNm.includes(famous))
			);

			if (foundFamousMovies.length > 0) {
				console.log("\n✅ Found famous Wong Kar-wai movies:");
				for (const movie of foundFamousMovies) {
					console.log(`   - ${movie.movieNm} (${movie.prdtYear})`);
				}
			}

			if (allHaveWongKarWai) {
				console.log("\n✅ SUCCESS: Director search is working correctly!");
			} else {
				console.log("\n⚠️  WARNING: Some movies may not be directed by 왕가위");
			}

			return {
				success: true,
				kobisResults: {
					totalCount: searchResults.movieListResult.movieList.length,
					movies: movieList,
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
