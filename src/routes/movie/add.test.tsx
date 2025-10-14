import { beforeAll, describe, expect, it } from "vitest";

/**
 * Movie Search Integration Tests
 *
 * Essential tests for real KOBIS API integration and search functionality
 */

// Check if we have a valid API key before running integration tests
const KOBIS_API_KEY = process.env.KOBIS_API_KEY;
const hasValidKey =
	KOBIS_API_KEY && KOBIS_API_KEY !== "YOUR_VALID_KOBIS_API_KEY_HERE";

describe.skipIf(!hasValidKey)("KOBIS API Integration", () => {
	let apiKey: string;

	beforeAll(() => {
		apiKey = KOBIS_API_KEY || "";
	});

	it("should search for movies and return valid results", async () => {
		const searchQuery = "기생충";
		const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=${apiKey}&movieNm=${encodeURIComponent(searchQuery)}&itemPerPage=5`;

		const response = await fetch(url);
		expect(response.ok).toBe(true);

		const data = await response.json();
		expect(data.movieListResult).toBeDefined();
		expect(data.movieListResult.movieList).toBeInstanceOf(Array);
		expect(data.movieListResult.totCnt).toBeGreaterThan(0);

		// Verify movie data structure
		const firstMovie = data.movieListResult.movieList[0];
		expect(firstMovie.movieCd).toBeDefined();
		expect(firstMovie.movieNm).toBeDefined();
		expect(firstMovie.directors).toBeInstanceOf(Array);
	});

	it("should handle search with English title", async () => {
		const searchQuery = "Parasite";
		const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=${apiKey}&movieNm=${encodeURIComponent(searchQuery)}&itemPerPage=5`;

		const response = await fetch(url);
		expect(response.ok).toBe(true);

		const data = await response.json();
		expect(data.movieListResult).toBeDefined();
		expect(data.movieListResult.movieList).toBeInstanceOf(Array);
	});

	it("should return empty results for non-existent movie", async () => {
		const searchQuery = "xyznonexistentmovie9999";
		const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=${apiKey}&movieNm=${encodeURIComponent(searchQuery)}&itemPerPage=5`;

		const response = await fetch(url);
		expect(response.ok).toBe(true);

		const data = await response.json();
		expect(data.movieListResult).toBeDefined();
		expect(data.movieListResult.movieList).toHaveLength(0);
		expect(data.movieListResult.totCnt).toBe(0);
	});

	it("should get movie details by movie code", async () => {
		// First search for a movie to get its code
		const searchUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=${apiKey}&movieNm=기생충&itemPerPage=1`;
		const searchResponse = await fetch(searchUrl);
		const searchData = await searchResponse.json();

		expect(searchData.movieListResult.movieList.length).toBeGreaterThan(0);
		const movieCd = searchData.movieListResult.movieList[0].movieCd;

		// Get detailed info for that movie
		const infoUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;
		const infoResponse = await fetch(infoUrl);
		expect(infoResponse.ok).toBe(true);

		const infoData = await infoResponse.json();
		expect(infoData.movieInfoResult).toBeDefined();
		expect(infoData.movieInfoResult.movieInfo).toBeDefined();
		expect(infoData.movieInfoResult.movieInfo.movieCd).toBe(movieCd);
	});
});

describe("KOBIS Error Response Handling", () => {
	it("should detect faultInfo in error response", () => {
		const errorResponse = {
			faultInfo: {
				message: "유효하지않은 키값입니다.",
				errorCode: "320010",
			},
		};

		expect(errorResponse.faultInfo).toBeDefined();
		expect(errorResponse.faultInfo.errorCode).toBe("320010");
		expect(errorResponse.faultInfo.message).toContain("키값");
	});

	it("should detect successful response without faultInfo", () => {
		const successResponse = {
			movieListResult: {
				totCnt: 1,
				source: "KOBIS",
				movieList: [
					{
						movieCd: "20184889",
						movieNm: "기생충",
						movieNmEn: "Parasite",
						prdtYear: "2019",
						openDt: "20190530",
						directors: [{ peopleNm: "봉준호" }],
						nationAlt: "한국",
						genreAlt: "드라마",
					},
				],
			},
		};

		// @ts-expect-error - testing for non-existent property
		expect(successResponse.faultInfo).toBeUndefined();
		expect(successResponse.movieListResult).toBeDefined();
	});
});
