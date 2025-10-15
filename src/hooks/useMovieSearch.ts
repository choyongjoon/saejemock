import { useAction } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { KobisMovie, SearchType } from "../types/movie";

export function useMovieSearch() {
	const [kobisResults, setKobisResults] = useState<KobisMovie[]>([]);
	const [isSearchingKobis, setIsSearchingKobis] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const searchKobisByTitle = useAction(api.kobis.searchMoviesByTitle);
	const searchKobisByDirector = useAction(api.kobis.searchMoviesByDirector);

	const performSearch = useCallback(
		async (query: string, searchMode: SearchType) => {
			setIsSearchingKobis(true);
			setErrorMessage(null);

			try {
				const result =
					searchMode === "director"
						? await searchKobisByDirector({ directorNm: query })
						: await searchKobisByTitle({ movieNm: query });

				if (result?.movieListResult?.movieList) {
					const transformedResults = result.movieListResult.movieList.map(
						(movie: {
							movieCd: string;
							movieNm: string;
							movieNmEn: string;
							prdtYear: string;
							openDt: string;
							directors: Array<{ peopleNm: string }>;
							nationAlt: string;
							genreAlt: string;
						}) => ({
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
					setKobisResults(transformedResults);
				} else {
					setKobisResults([]);
					if (!result?.movieListResult) {
						setErrorMessage(
							"KOBIS API 응답 형식이 올바르지 않습니다. 데이터베이스 결과만 표시됩니다."
						);
					}
				}
			} catch (error) {
				setKobisResults([]);
				setErrorMessage(
					error instanceof Error
						? error.message
						: "KOBIS 검색 중 오류가 발생했습니다. 데이터베이스 결과만 표시됩니다."
				);
			} finally {
				setIsSearchingKobis(false);
			}
		},
		[searchKobisByTitle, searchKobisByDirector]
	);

	return {
		kobisResults,
		isSearchingKobis,
		errorMessage,
		performSearch,
	};
}
