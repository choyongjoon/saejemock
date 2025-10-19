import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { FunctionReference } from "convex/server";
import { Suspense } from "react";
import type { Movie } from "../../types/movie";
import LoadingSpinner from "../common/LoadingSpinner";
import Pagination from "../common/Pagination";
import MovieCard from "../MovieCard";

type MovieListPageProps = {
	title: string;
	queryFn: FunctionReference<
		"query",
		"public",
		{ limit: number; page: number }
	>;
	basePath: string;
	page: number;
};

export function MovieListPageWithSuspense(props: MovieListPageProps) {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<MovieListPage {...props} />
		</Suspense>
	);
}

function MovieListPage({ title, queryFn, basePath, page }: MovieListPageProps) {
	const { data: moviesData } = useSuspenseQuery(
		convexQuery(queryFn, { limit: 20, page })
	);

	const { movies, totalPages } = moviesData;

	return (
		<div className="container mx-auto min-h-screen px-4 py-8">
			<h1 className="mb-8 font-bold text-4xl">{title}</h1>

			{movies.length === 0 ? (
				<div className="flex min-h-[400px] items-center justify-center">
					<p className="text-base-content/60">아직 영화가 없습니다.</p>
				</div>
			) : (
				<>
					<div className="mb-8 grid grid-cols-1 gap-2">
						{movies.map((movie: Movie) => (
							<MovieCard key={movie._id} mode="link" movie={movie} />
						))}
					</div>

					<Pagination
						basePath={basePath}
						currentPage={page}
						totalPages={totalPages}
					/>
				</>
			)}
		</div>
	);
}
