import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { MovieListPageWithSuspense } from "../../components/movie/MovieListPage";

const searchSchema = z.object({
	page: z.number().int().positive().catch(1),
});

export const Route = createFileRoute("/movies/trending")({
	validateSearch: (search) => searchSchema.parse(search),
	component: TrendingMoviesPage,
});

function TrendingMoviesPage() {
	const { page } = Route.useSearch();

	return (
		<MovieListPageWithSuspense
			basePath="/movies/trending"
			page={page}
			queryFn={api.movies.getMoviesByViewCount}
			title="조회수가 높은 영화"
		/>
	);
}
