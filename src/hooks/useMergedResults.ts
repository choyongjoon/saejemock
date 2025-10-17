import type { KobisMovie, Movie, SearchedMovieInfo } from "../types/movie";

export function useMergedResults(
	dbResults: Movie[] | undefined,
	kobisResults: KobisMovie[]
): SearchedMovieInfo[] {
	const mergedResults: SearchedMovieInfo[] = [];
	const addedMovieCodes = new Set<string>();

	// Add DB results first
	if (dbResults) {
		for (const movie of dbResults) {
			mergedResults.push({
				source: "db",
				inDB: true,
				shortId: movie.shortId,
				koreanTitle: movie.koreanTitle,
				englishTitle: movie.englishTitle,
				originalTitle: movie.originalTitle,
				year: movie.year,
				directors: movie.directors,
				additionalInfo: movie.additionalInfo,
			});
			// Track KOBIS codes if available
			if (movie.kobisMovieCode) {
				addedMovieCodes.add(movie.kobisMovieCode);
			}
		}
	}

	// Add KOBIS results that aren't in DB
	for (const movie of kobisResults) {
		if (!addedMovieCodes.has(movie.movieCd)) {
			mergedResults.push({
				source: "kobis",
				inDB: false,
				movieCd: movie.movieCd,
				koreanTitle: movie.movieNm,
				englishTitle: movie.movieNmEn,
				originalTitle: "",
				year: movie.prdtYear,
				directors: movie.directors,
				additionalInfo: [movie.nationAlt, movie.genreAlt]
					.filter(Boolean)
					.join(" • "),
			});
		}
	}

	return mergedResults;
}
