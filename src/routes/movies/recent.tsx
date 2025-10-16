import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import Pagination from "../../components/common/Pagination";
import MovieCard from "../../components/MovieCard";
import type { Movie } from "../../types/movie";

const searchSchema = z.object({
	page: z.number().int().positive().catch(1),
});

export const Route = createFileRoute("/movies/recent")({
	validateSearch: (search) => searchSchema.parse(search),
	component: RecentMoviesPage,
});

function RecentMoviesPage() {
	const { page } = Route.useSearch();
	const moviesData = useQuery(api.movies.getMoviesByCreatedAt, {
		limit: 20,
		page,
	});

	const isLoading = moviesData === undefined;

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	const { movies, totalPages } = moviesData;

	return (
		<div className="container mx-auto min-h-screen px-4 py-8">
			<h1 className="mb-8 font-bold text-4xl">신규 추가 영화</h1>

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
						basePath="/movies/recent"
						currentPage={page}
						totalPages={totalPages}
					/>
				</>
			)}
		</div>
	);
}
