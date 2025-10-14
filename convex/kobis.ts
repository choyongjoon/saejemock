import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * KOBIS (Korean Film Council) Open API Integration
 * API Documentation: https://www.kobis.or.kr/kobisopenapi/
 */

type KobisMovieListItem = {
	movieCd: string; // Movie code
	movieNm: string; // Korean movie name
	movieNmEn: string; // English movie name
	prdtYear: string; // Production year
	openDt: string; // Release date
	typeNm: string; // Movie type
	prdtStatNm: string; // Production status
	nationAlt: string; // Nationality
	genreAlt: string; // Genres
	repNationNm: string; // Representative nationality
	repGenreNm: string; // Representative genre
	directors: Array<{ peopleNm: string }>; // Directors
	companys: Array<{ companyCd: string; companyNm: string }>; // Companies
};

type KobisMovieListResponse = {
	movieListResult: {
		totCnt: number;
		source: string;
		movieList: KobisMovieListItem[];
	};
};

type KobisMovieInfo = {
	movieCd: string;
	movieNm: string;
	movieNmEn: string;
	movieNmOg: string; // Original name
	prdtYear: string;
	showTm: string; // Running time
	openDt: string;
	prdtStatNm: string;
	typeNm: string;
	nations: Array<{ nationNm: string }>;
	genres: Array<{ genreNm: string }>;
	directors: Array<{ peopleNm: string; peopleNmEn: string }>;
	actors: Array<{ peopleNm: string; peopleNmEn: string; cast: string }>;
	showTypes: Array<{ showTypeGroupNm: string; showTypeNm: string }>;
	companys: Array<{
		companyCd: string;
		companyNm: string;
		companyNmEn: string;
		companyPartNm: string;
	}>;
	audits: Array<{ auditNo: string; watchGradeNm: string }>;
	staffs: Array<{ peopleNm: string; peopleNmEn: string; staffRoleNm: string }>;
};

type KobisMovieInfoResponse = {
	movieInfoResult: {
		movieInfo: KobisMovieInfo;
		source: string;
	};
};

/**
 * Search for movies by title in KOBIS
 */
export const searchMoviesByTitle = action({
	args: {
		movieNm: v.string(),
		curPage: v.optional(v.number()),
		itemPerPage: v.optional(v.number()),
	},
	handler: async (_, args): Promise<KobisMovieListResponse> => {
		const apiKey = process.env.KOBIS_API_KEY;
		if (!apiKey) {
			throw new Error(
				"KOBIS_API_KEY not configured. Get your API key at https://www.kobis.or.kr/kobisopenapi/"
			);
		}

		const curPage = args.curPage ?? 1;
		const itemPerPage = args.itemPerPage ?? 10;

		// KOBIS Movie List API endpoint
		const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=${apiKey}&movieNm=${encodeURIComponent(args.movieNm)}&curPage=${curPage}&itemPerPage=${itemPerPage}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`KOBIS API request failed: ${response.statusText}`);
		}

		const data = await response.json();

		// Check for KOBIS API error response
		if (data.faultInfo) {
			throw new Error(
				`KOBIS API error: ${data.faultInfo.message} (${data.faultInfo.errorCode})`
			);
		}

		// Validate response structure
		if (!data.movieListResult) {
			throw new Error("Invalid KOBIS API response: missing movieListResult");
		}

		return data as KobisMovieListResponse;
	},
});

/**
 * Get movie details by movie code
 */
export const getMovieInfo = action({
	args: {
		movieCd: v.string(),
	},
	handler: async (_, args): Promise<KobisMovieInfoResponse> => {
		const apiKey = process.env.KOBIS_API_KEY;
		if (!apiKey) {
			throw new Error(
				"KOBIS_API_KEY not configured. Get your API key at https://www.kobis.or.kr/kobisopenapi/"
			);
		}

		// KOBIS Movie Info API endpoint
		const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${args.movieCd}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`KOBIS API request failed: ${response.statusText}`);
		}

		const data = await response.json();

		// Check for KOBIS API error response
		if (data.faultInfo) {
			throw new Error(
				`KOBIS API error: ${data.faultInfo.message} (${data.faultInfo.errorCode})`
			);
		}

		// Validate response structure
		if (!data.movieInfoResult) {
			throw new Error("Invalid KOBIS API response: missing movieInfoResult");
		}

		return data as KobisMovieInfoResponse;
	},
});

/**
 * Search for movies and get detailed info
 */
export const searchAndGetMovieDetails = action({
	args: {
		movieNm: v.string(),
	},
	handler: async (ctx, args) => {
		// Search for movies
		const searchResults = await ctx.runAction(
			// @ts-expect-error - Internal API reference
			ctx.runAction.api.kobis.searchMoviesByTitle,
			{
				movieNm: args.movieNm,
				itemPerPage: 20,
			}
		);

		// Return simplified search results
		return searchResults.movieListResult.movieList.map(
			(movie: KobisMovieListItem) => ({
				movieCd: movie.movieCd,
				movieNm: movie.movieNm,
				movieNmEn: movie.movieNmEn,
				prdtYear: movie.prdtYear,
				openDt: movie.openDt,
				directors: movie.directors
					.map((d: { peopleNm: string }) => d.peopleNm)
					.join(", "),
				nationAlt: movie.nationAlt,
				genreAlt: movie.genreAlt,
			})
		);
	},
});
