import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import MovieCard from "../../components/MovieCard";
import type { Movie } from "../../types/movie";

const searchSchema = z.object({
	page: z.number().int().positive().catch(1),
});

export const Route = createFileRoute("/movies/popular")({
	validateSearch: (search) => searchSchema.parse(search),
	component: PopularMoviesPageWithSuspense,
});

function PopularMoviesPageWithSuspense() {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<PopularMoviesPage />
		</Suspense>
	);
}

function PopularMoviesPage() {
	const { page } = Route.useSearch();
	const { data: moviesData } = useSuspenseQuery(
		convexQuery(api.movies.getMoviesByTotalVotes, { limit: 20, page })
	);

	const { movies, totalPages } = moviesData;

	return (
		<div className="container mx-auto min-h-screen px-4 py-8">
			<h1 className="mb-8 font-bold text-4xl">투표가 많은 영화</h1>

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
						basePath="/movies/popular"
						currentPage={page}
						totalPages={totalPages}
					/>
				</>
			)}
		</div>
	);
}
