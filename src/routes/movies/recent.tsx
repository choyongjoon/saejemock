import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { MovieListPageWithSuspense } from "../../components/movie/MovieListPage";

const searchSchema = z.object({
	page: z.number().int().positive().catch(1),
});

export const Route = createFileRoute("/movies/recent")({
	validateSearch: (search) => searchSchema.parse(search),
	component: RecentMoviesPage,
});

function RecentMoviesPage() {
	const { page } = Route.useSearch();

	return (
		<MovieListPageWithSuspense
			basePath="/movies/recent"
			page={page}
			queryFn={api.movies.getMoviesByCreatedAt}
			title="신규 추가 영화"
		/>
	);
}
