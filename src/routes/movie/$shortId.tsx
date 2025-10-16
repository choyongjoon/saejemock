import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MovieInfo } from "../../components/movie/MovieInfo";

export const Route = createFileRoute("/movie/$shortId")({
	component: MoviePage,
});

function MoviePage() {
	const { shortId } = Route.useParams();
	const movie = useQuery(api.movies.getMovieByShortId, { shortId });

	if (movie === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-gray-900 border-b-2" />
			</div>
		);
	}

	if (movie === null) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="font-bold text-2xl text-red-600">Movie not found</h1>
				<p className="mt-4">
					The movie with ID "{shortId}" could not be found.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<MovieInfo
				additionalInfo={movie.additionalInfo}
				directors={movie.directors}
				koreanTitle={movie.koreanTitle}
				originalTitle={movie.originalTitle}
				releaseDate={movie.releaseDate}
				titleSuggestions={movie.titleSuggestions || []}
				year={movie.year}
			/>
		</div>
	);
}
