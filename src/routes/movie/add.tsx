import { SignInButton, useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { Film, Search } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/movie/add")({
	component: SearchMoviePage,
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

type MergedMovie = {
	source: "db" | "kobis";
	inDB: boolean;
	movieCd?: string;
	shortId?: string;
	koreanTitle: string;
	originalTitle: string;
	year?: string;
	directors?: string;
	posterUrl?: string;
	additionalInfo?: string;
};

function useMergedResults(
	dbResults:
		| Array<{
				_id: string;
				shortId: string;
				originalTitle: string;
				koreanTitle?: string;
				posterUrl?: string;
				imdbId?: string;
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
				posterUrl: movie.posterUrl,
			});
			// Track KOBIS codes if available (stored in imdbId field)
			if (movie.imdbId) {
				addedMovieCodes.add(movie.imdbId);
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
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [kobisResults, setKobisResults] = useState<KobisMovie[]>([]);
	const [isSearchingKobis, setIsSearchingKobis] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	const searchKobis = useAction(api.kobis.searchMoviesByTitle);
	const addMovieFromKobis = useAction(api.movies.addMovieFromKobis);
	const navigate = useNavigate();

	// Search our DB
	const dbResults = useQuery(
		api.movies.searchMovies,
		debouncedQuery ? { searchQuery: debouncedQuery } : "skip"
	);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		const query = searchQuery.trim();

		if (!query) {
			return;
		}

		setDebouncedQuery(query);
		setIsSearchingKobis(true);

		try {
			const result = await searchKobis({ movieNm: query });

			if (result.movieListResult.movieList) {
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
			}
		} catch {
			setKobisResults([]);
		} finally {
			setIsSearchingKobis(false);
		}
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
			} catch {
				// Error handled silently
			} finally {
				setIsAdding(false);
			}
		}
	};

	// Merge results from DB and KOBIS
	const mergedResults = useMergedResults(dbResults, kobisResults);
	const isLoading = isSearchingKobis || dbResults === undefined;

	return (
		<div className="min-h-screen bg-base-100">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 flex justify-center">
						<Film className="h-12 w-12 text-primary" />
					</div>
					<h1 className="mb-2 font-bold text-4xl">영화 검색</h1>
					<p className="text-base-content/70">
						데이터베이스와 영화진흥위원회(KOBIS)에서 영화를 검색하세요
					</p>
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
							<div className="flex gap-2 text-sm">
								<span className="badge badge-primary">
									DB: {dbResults?.length || 0}
								</span>
								<span className="badge badge-secondary">
									KOBIS: {kobisResults.length}
								</span>
							</div>
						</div>

						<div className="space-y-2">
							{mergedResults.map((movie, index) => (
								<button
									className={`card card-compact w-full bg-base-200 text-left transition-all hover:shadow-lg ${
										isAdding ? "cursor-wait opacity-50" : ""
									}`}
									disabled={isAdding || !(movie.inDB || isSignedIn)}
									key={`${movie.source}-${movie.shortId || movie.movieCd || index}`}
									onClick={() => handleMovieClick(movie)}
									type="button"
								>
									<div className="card-body">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="mb-1 flex items-center gap-2">
													<h3 className="card-title text-base">
														{movie.koreanTitle}
													</h3>
													{movie.inDB ? (
														<span className="badge badge-primary badge-sm">
															DB
														</span>
													) : (
														<span className="badge badge-secondary badge-sm">
															KOBIS
														</span>
													)}
												</div>
												{movie.originalTitle !== movie.koreanTitle && (
													<p className="mb-1 text-sm opacity-70">
														{movie.originalTitle}
													</p>
												)}
												<div className="flex flex-wrap gap-2 text-xs opacity-60">
													{movie.year && <span>{movie.year}년</span>}
													{movie.directors && <span>• {movie.directors}</span>}
													{movie.additionalInfo && (
														<span>• {movie.additionalInfo}</span>
													)}
												</div>
											</div>

											{!(movie.inDB || isSignedIn) && (
												<div className="flex items-center gap-2">
													<SignInButton mode="modal">
														<button
															className="btn btn-ghost btn-sm"
															onClick={(e) => e.stopPropagation()}
															type="button"
														>
															로그인 필요
														</button>
													</SignInButton>
												</div>
											)}
											{!movie.inDB && isSignedIn && (
												<div className="flex items-center">
													<span className="text-primary text-sm">
														클릭하여 추가 →
													</span>
												</div>
											)}
										</div>
									</div>
								</button>
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
								<p className="opacity-70">
									우리 데이터베이스와 KOBIS에서 영화를 찾아드립니다
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
