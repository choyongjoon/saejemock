import type { MergedMovie } from "../components/movie/MovieResultCard";
import type { KobisMovie } from "../types/movie";

type DbMovie = {
	_id: string;
	shortId: string;
	originalTitle: string;
	koreanTitle?: string;
	releaseDate?: string;
	kobisMovieCode?: string;
	year?: string;
	directors?: string;
	additionalInfo?: string;
};

export function useMergedResults(
	dbResults: DbMovie[] | undefined,
	kobisResults: KobisMovie[]
): MergedMovie[] {
	const mergedResults: MergedMovie[] = [];
	const addedMovieCodes = new Set<string>();

	// Add DB results first
	if (dbResults) {
		for (const movie of dbResults) {
			mergedResults.push({
				source: "db",
				inDB: true,
				shortId: movie.shortId,
				koreanTitle: movie.koreanTitle || movie.originalTitle,
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
				originalTitle: movie.movieNmEn || movie.movieNm,
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
