import { useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { Film, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import {
	type MergedMovie,
	MovieResultCard,
} from "../../components/movie/MovieResultCard";

const movieAddSearchSchema = z.object({
	q: z.string().optional(),
});

export const Route = createFileRoute("/movie/search")({
	component: SearchMoviePage,
	validateSearch: movieAddSearchSchema,
});

type KobisMovie = {
	movieCd: string;
	movieNm: string;
	movieNmEn: string;
	prdtYear: string;
	openDt: string;
	directors: string;
	nationAlt: string;
	genreAlt: string;
};

function useMergedResults(
	dbResults:
		| Array<{
				_id: string;
				shortId: string;
				originalTitle: string;
				koreanTitle?: string;
				releaseDate?: string;
				kobisMovieCode?: string;
				year?: string;
				directors?: string;
				additionalInfo?: string;
		  }>
		| undefined,
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

function SearchMoviePage() {
	const { isSignedIn } = useUser();
	const navigate = useNavigate();
	const { q } = Route.useSearch();

	const [searchQuery, setSearchQuery] = useState(q || "");
	const [debouncedQuery, setDebouncedQuery] = useState(q || "");
	const [kobisResults, setKobisResults] = useState<KobisMovie[]>([]);
	const [isSearchingKobis, setIsSearchingKobis] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const searchKobis = useAction(api.kobis.searchMoviesByTitle);
	const addMovieFromKobis = useAction(api.movies.addMovieFromKobis);

	// Search our DB
	const dbResults = useQuery(
		api.movies.searchMovies,
		debouncedQuery ? { searchQuery: debouncedQuery } : "skip"
	);

	const performSearch = useCallback(
		async (query: string) => {
			setDebouncedQuery(query);
			setIsSearchingKobis(true);
			setErrorMessage(null);

			try {
				const result = await searchKobis({ movieNm: query });

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
		[searchKobis]
	);

	// Trigger search on mount if query param exists
	useEffect(() => {
		if (q?.trim()) {
			performSearch(q.trim());
		}
	}, [q, performSearch]);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		const query = searchQuery.trim();

		if (!query) {
			return;
		}

		// Update URL with search query
		await navigate({
			to: "/movie/search",
			search: { q: query },
		});

		await performSearch(query);
	};

	const handleMovieClick = async (movie: MergedMovie) => {
		if (movie.inDB && movie.shortId) {
			// Navigate to existing movie
			await navigate({
				to: "/movie/$shortId",
				params: { shortId: movie.shortId },
			});
		} else if (!movie.inDB && movie.movieCd && isSignedIn) {
			// Add movie to DB
			setIsAdding(true);
			try {
				const result = await addMovieFromKobis({
					movieCd: movie.movieCd,
				});
				await navigate({
					to: "/movie/$shortId",
					params: { shortId: result.shortId },
				});
			} catch (error) {
				console.error("Failed to add movie:", error);
				setErrorMessage(
					error instanceof Error
						? `영화 추가 실패: ${error.message}`
						: "영화를 추가하는 중 오류가 발생했습니다."
				);
			} finally {
				setIsAdding(false);
			}
		}
	};

	// Merge results from DB and KOBIS
	const mergedResults = useMergedResults(dbResults, kobisResults);
	const isLoading =
		isSearchingKobis || (Boolean(debouncedQuery) && dbResults === undefined);

	return (
		<div className="min-h-screen bg-base-100">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 flex justify-center">
						<Film className="h-12 w-12 text-primary" />
					</div>
					<h1 className="mb-2 font-bold text-4xl">영화 검색</h1>
				</div>

				{/* Search Form */}
				<div className="mb-8">
					<form className="mx-auto max-w-2xl" onSubmit={handleSearch}>
						<div className="join w-full">
							<input
								className="input input-bordered join-item flex-1"
								disabled={isLoading}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="영화 제목을 입력하세요 (한글 또는 영어)"
								type="text"
								value={searchQuery}
							/>
							<button
								className="btn btn-primary join-item"
								disabled={isLoading}
								type="submit"
							>
								<Search className="h-4 w-4" />
								검색
							</button>
						</div>
					</form>
				</div>

				{/* Error Message */}
				{errorMessage && (
					<div className="mx-auto mb-4 max-w-4xl">
						<div className="alert alert-warning">
							<svg
								className="h-6 w-6 flex-shrink-0 stroke-current"
								fill="none"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>Warning</title>
								<path
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
								/>
							</svg>
							<span>{errorMessage}</span>
						</div>
					</div>
				)}

				{/* Loading State */}
				{isLoading && debouncedQuery && (
					<div className="flex justify-center py-12">
						<span className="loading loading-spinner loading-lg" />
					</div>
				)}

				{/* Results */}
				{!isLoading && mergedResults.length > 0 && (
					<div className="mx-auto max-w-4xl">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-bold text-2xl">
								검색 결과 ({mergedResults.length}개)
							</h2>
						</div>

						<div className="space-y-2">
							{mergedResults.map((movie, index) => (
								<MovieResultCard
									index={index}
									isAdding={isAdding}
									isSignedIn={Boolean(isSignedIn)}
									key={`${movie.source}-${movie.shortId || movie.movieCd || index}`}
									movie={movie}
									onMovieClick={handleMovieClick}
								/>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && debouncedQuery && mergedResults.length === 0 && (
					<div className="mx-auto max-w-2xl text-center">
						<div className="card bg-base-200">
							<div className="card-body">
								<Film className="mx-auto h-16 w-16 opacity-20" />
								<h3 className="card-title justify-center">
									검색 결과가 없습니다
								</h3>
								<p className="opacity-70">다른 검색어로 다시 시도해보세요</p>
							</div>
						</div>
					</div>
				)}

				{/* Initial State */}
				{!debouncedQuery && (
					<div className="mx-auto max-w-2xl text-center">
						<div className="card bg-base-200">
							<div className="card-body">
								<Search className="mx-auto h-16 w-16 opacity-20" />
								<h3 className="card-title justify-center">영화를 검색하세요</h3>
								<p className="break-keep opacity-70">
									영화관입장권통합전산망 오픈 API를 사용하여 검색합니다.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
