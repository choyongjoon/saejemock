import { Film, Search } from "lucide-react";
import type { MergedMovie } from "./MovieResultCard";
import { MovieResultCard } from "./MovieResultCard";

type SearchResultsProps = {
	isLoading: boolean;
	debouncedQuery: string;
	mergedResults: MergedMovie[];
	isAdding: boolean;
	isSignedIn: boolean;
	errorMessage: string | null;
	onMovieClick: (movie: MergedMovie) => void;
};

export function SearchResults({
	isLoading,
	debouncedQuery,
	mergedResults,
	isAdding,
	isSignedIn,
	errorMessage,
	onMovieClick,
}: SearchResultsProps) {
	// Error Message
	if (errorMessage) {
		return (
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
		);
	}

	// Loading State
	if (isLoading && debouncedQuery) {
		return (
			<div className="flex justify-center py-12">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	// Results
	if (!isLoading && mergedResults.length > 0) {
		return (
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
							isSignedIn={isSignedIn}
							key={`${movie.source}-${movie.shortId || movie.movieCd || index}`}
							movie={movie}
							onMovieClick={onMovieClick}
						/>
					))}
				</div>
			</div>
		);
	}

	// Empty State
	if (!isLoading && debouncedQuery && mergedResults.length === 0) {
		return (
			<div className="mx-auto max-w-2xl text-center">
				<div className="card bg-base-200">
					<div className="card-body">
						<Film className="mx-auto h-16 w-16 opacity-20" />
						<h3 className="card-title justify-center">검색 결과가 없습니다</h3>
						<p className="opacity-70">다른 검색어로 다시 시도해보세요</p>
					</div>
				</div>
			</div>
		);
	}

	// Initial State
	return (
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
	);
}
