import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Suspense, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { MovieInfo } from "../../components/movie/MovieInfo";
import { TitleSuggestions } from "../../components/movie/TitleSuggestions";

export const Route = createFileRoute("/movie/$shortId")({
	component: MoviePageWithSuspense,
});

function MoviePageWithSuspense() {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<MoviePage />
		</Suspense>
	);
}

function MoviePage() {
	const { shortId } = Route.useParams();
	const { data: movie } = useSuspenseQuery(
		convexQuery(api.movies.getMovieByShortId, { shortId })
	);
	const incrementViewCount = useMutation(api.movies.incrementViewCount);

	// Increment view count when movie is loaded
	useEffect(() => {
		if (movie?._id) {
			incrementViewCount({ movieId: movie._id }).catch((error) => {
				console.error("Failed to increment view count:", error);
			});
		}
	}, [movie?._id, incrementViewCount]);

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
			<MovieInfo movie={movie} />

			<div className="mt-12">
				<h3 className="font-bold text-2xl">제목 제안</h3>
				<TitleSuggestions
					movieId={movie._id}
					suggestions={movie.titleSuggestions || []}
				/>
			</div>
		</div>
	);
}
