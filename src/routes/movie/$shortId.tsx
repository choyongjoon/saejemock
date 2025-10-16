import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { MovieInfo } from "../../components/movie/MovieInfo";

export const Route = createFileRoute("/movie/$shortId")({
	component: MoviePage,
});

function MoviePage() {
	const { shortId } = Route.useParams();
	const movie = useQuery(api.movies.getMovieByShortId, { shortId });
	const incrementViewCount = useMutation(api.movies.incrementViewCount);

	// Increment view count when movie is loaded
	useEffect(() => {
		if (movie?._id) {
			incrementViewCount({ movieId: movie._id }).catch((error) => {
				console.error("Failed to increment view count:", error);
			});
		}
	}, [movie?._id, incrementViewCount]);

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
