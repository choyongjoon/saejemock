import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { Film, Search } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/movie/add")({
	component: AddMoviePage,
});

type KobisMovieResult = {
	movieCd: string;
	movieNm: string;
	movieNmEn: string;
	prdtYear: string;
	openDt: string;
	directors: string;
	nationAlt: string;
	genreAlt: string;
};

function AddMoviePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<KobisMovieResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [selectedMovie, setSelectedMovie] = useState<KobisMovieResult | null>(
		null
	);
	const [posterUrl, setPosterUrl] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const searchMovies = useAction(api.kobis.searchMoviesByTitle);
	const addMovieFromKobis = useAction(api.movies.addMovieFromKobis);
	const navigate = useNavigate();

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!searchQuery.trim()) {
			setError("검색어를 입력해주세요");
			return;
		}

		setIsSearching(true);
		try {
			const result = await searchMovies({ movieNm: searchQuery });

			if (
				!result.movieListResult.movieList ||
				result.movieListResult.movieList.length === 0
			) {
				setError("검색 결과가 없습니다");
				setSearchResults([]);
			} else {
				// Transform KOBIS results to our format
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
				setSearchResults(transformedResults);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "검색 중 오류가 발생했습니다"
			);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	const handleSelectMovie = (movie: KobisMovieResult) => {
		setSelectedMovie(movie);
		setPosterUrl("");
		setError(null);
	};

	const handleAddMovie = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedMovie) {
			return;
		}

		setIsAdding(true);
		setError(null);

		try {
			const result = await addMovieFromKobis({
				movieCd: selectedMovie.movieCd,
				posterUrl: posterUrl.trim() || undefined,
			});

			// Navigate to the newly created movie page
			await navigate({
				to: "/movie/$shortId",
				params: { shortId: result.shortId },
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "영화 추가 중 오류가 발생했습니다"
			);
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 inline-flex items-center justify-center rounded-full bg-cyan-500/10 p-4">
						<Film className="h-12 w-12 text-cyan-400" />
					</div>
					<h1 className="mb-2 font-bold text-4xl text-white">영화 추가하기</h1>
					<p className="text-gray-400">
						영화진흥위원회(KOBIS)에서 영화를 검색하여 추가하세요
					</p>
				</div>

				{/* Search Form */}
				<div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
					<form className="flex gap-3" onSubmit={handleSearch}>
						<div className="relative flex-1">
							<Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
							<input
								className="w-full rounded-lg border border-slate-600 bg-slate-900 py-3 pr-4 pl-11 text-white placeholder-gray-400 transition focus:border-cyan-500 focus:outline-none"
								disabled={isSearching}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="영화 제목을 입력하세요 (한글 또는 영어)"
								type="text"
								value={searchQuery}
							/>
						</div>
						<button
							className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isSearching}
							type="submit"
						>
							{isSearching ? "검색중..." : "검색"}
						</button>
					</form>

					{error && (
						<div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
							<p className="text-red-400">{error}</p>
						</div>
					)}
				</div>

				{/* Search Results */}
				{searchResults.length > 0 && !selectedMovie && (
					<div className="mb-8">
						<h2 className="mb-4 font-semibold text-2xl text-white">
							검색 결과 ({searchResults.length}개)
						</h2>
						<div className="space-y-3">
							{searchResults.map((movie) => (
								<button
									className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-left backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg"
									key={movie.movieCd}
									onClick={() => handleSelectMovie(movie)}
									type="button"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="mb-1 font-semibold text-lg text-white">
												{movie.movieNm}
											</h3>
											{movie.movieNmEn && (
												<p className="mb-2 text-gray-400 text-sm">
													{movie.movieNmEn}
												</p>
											)}
											<div className="flex flex-wrap gap-2 text-gray-500 text-xs">
												{movie.prdtYear && (
													<span className="rounded bg-slate-700 px-2 py-1">
														{movie.prdtYear}년
													</span>
												)}
												{movie.openDt && (
													<span className="rounded bg-slate-700 px-2 py-1">
														개봉: {movie.openDt}
													</span>
												)}
												{movie.directors && (
													<span className="rounded bg-slate-700 px-2 py-1">
														감독: {movie.directors}
													</span>
												)}
												{movie.nationAlt && (
													<span className="rounded bg-slate-700 px-2 py-1">
														{movie.nationAlt}
													</span>
												)}
												{movie.genreAlt && (
													<span className="rounded bg-slate-700 px-2 py-1">
														{movie.genreAlt}
													</span>
												)}
											</div>
										</div>
										<div className="ml-4">
											<span className="text-cyan-400 text-xs">
												{movie.movieCd}
											</span>
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{/* Selected Movie Form */}
				{selectedMovie && (
					<div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
						<div className="mb-6">
							<h3 className="mb-2 font-bold text-2xl text-white">
								{selectedMovie.movieNm}
							</h3>
							{selectedMovie.movieNmEn && (
								<p className="mb-2 text-gray-400 text-lg">
									{selectedMovie.movieNmEn}
								</p>
							)}
							<div className="mb-4 flex flex-wrap gap-2 text-gray-400 text-sm">
								{selectedMovie.prdtYear && (
									<span>{selectedMovie.prdtYear}년</span>
								)}
								{selectedMovie.openDt && (
									<span>• 개봉: {selectedMovie.openDt}</span>
								)}
								{selectedMovie.directors && (
									<span>• 감독: {selectedMovie.directors}</span>
								)}
							</div>
							<p className="mb-4 text-cyan-400 text-sm">
								영화 코드: {selectedMovie.movieCd}
							</p>
							<button
								className="text-gray-400 text-sm transition hover:text-white"
								onClick={() => {
									setSelectedMovie(null);
									setPosterUrl("");
									setError(null);
								}}
								type="button"
							>
								← 다른 영화 선택
							</button>
						</div>

						<form onSubmit={handleAddMovie}>
							<div className="mb-6">
								<label
									className="mb-2 block font-medium text-white"
									htmlFor="posterUrl"
								>
									포스터 URL (선택사항)
								</label>
								<input
									className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-500 focus:outline-none"
									id="posterUrl"
									onChange={(e) => setPosterUrl(e.target.value)}
									placeholder="예: https://example.com/poster.jpg"
									type="url"
									value={posterUrl}
								/>
								<p className="mt-2 text-gray-400 text-sm">
									포스터 이미지 URL을 입력하면 더 보기 좋은 카드로 표시됩니다
								</p>
							</div>

							<div className="flex gap-3">
								<button
									className="flex-1 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isAdding}
									type="submit"
								>
									{isAdding ? "추가중..." : "영화 추가하기"}
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Empty State */}
				{searchResults.length === 0 && !selectedMovie && !error && (
					<div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center backdrop-blur-sm">
						<Film className="mx-auto mb-4 h-16 w-16 text-gray-600" />
						<p className="mb-2 text-gray-400">
							영화 제목을 검색하여 데이터베이스에 추가하세요
						</p>
						<p className="text-gray-500 text-sm">
							영화진흥위원회(KOBIS) 데이터를 사용합니다
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
