import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { MovieListPageWithSuspense } from "../../components/movie/MovieListPage";

const searchSchema = z.object({
	page: z.number().int().positive().catch(1),
});

export const Route = createFileRoute("/movies/popular")({
	validateSearch: (search) => searchSchema.parse(search),
	component: PopularMoviesPage,
});

function PopularMoviesPage() {
	const { page } = Route.useSearch();

	return (
		<MovieListPageWithSuspense
			basePath="/movies/popular"
			page={page}
			queryFn={api.movies.getMoviesByTotalVotes}
			title="투표가 많은 영화"
		/>
	);
}
