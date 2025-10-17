import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { api } from "../../convex/_generated/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import MovieCard from "../components/MovieCard";
import type { Movie } from "../types/movie";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-screen bg-base-100">
			{/* Hero Section */}
			<div className="hero min-h-[40vh]">
				<div className="hero-content text-center">
					<div className="max-w-3xl">
						<h1 className="mb-4 font-bold text-5xl">새 제목</h1>
						<p className="mb-8 break-keep text-xl">
							맘에 안 드는 영화 제목을 고쳐보세요.
						</p>
						<Link className="btn btn-primary btn-lg" to="/movie/search">
							영화 찾기
						</Link>
					</div>
				</div>
			</div>

			{/* Movies Section */}
			<div className="container mx-auto px-4 py-16">
				<Suspense fallback={<LoadingSpinner fullScreen={false} />}>
					<MoviesSection />
				</Suspense>
			</div>
		</div>
	);
}

function MoviesSection() {
	const { data: moviesByVotesData } = useSuspenseQuery(
		convexQuery(api.movies.getMoviesByTotalVotes, { limit: 5 })
	);
	const { data: moviesByViewsData } = useSuspenseQuery(
		convexQuery(api.movies.getMoviesByViewCount, { limit: 5 })
	);
	const { data: recentMoviesData } = useSuspenseQuery(
		convexQuery(api.movies.getMoviesByCreatedAt, { limit: 5 })
	);

	const moviesByVotes = moviesByVotesData.movies;
	const moviesByViews = moviesByViewsData.movies;
	const recentMovies = recentMoviesData.movies;

	return (
		<div className="space-y-16">
			{/* Movies by Total Votes */}
			{moviesByVotes.length > 0 && (
				<section>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="font-bold text-3xl">투표가 많은 영화</h2>
						<Link
							className="link-hover link text-sm"
							search={{ page: 1 }}
							to="/movies/popular"
						>
							더보기 →
						</Link>
					</div>
					<div className="grid grid-cols-1 gap-2">
						{moviesByVotes.map((movie: Movie) => (
							<MovieCard key={movie._id} mode="link" movie={movie} />
						))}
					</div>
				</section>
			)}

			{/* Movies by View Count */}
			{moviesByViews.length > 0 && (
				<section>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="font-bold text-3xl">조회수가 높은 영화</h2>
						<Link
							className="link-hover link text-sm"
							search={{ page: 1 }}
							to="/movies/trending"
						>
							더보기 →
						</Link>
					</div>
					<div className="grid grid-cols-1 gap-2">
						{moviesByViews.map((movie: Movie) => (
							<MovieCard key={movie._id} mode="link" movie={movie} />
						))}
					</div>
				</section>
			)}

			{/* Recently Added Movies */}
			{recentMovies.length > 0 && (
				<section>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="font-bold text-3xl">신규 추가 영화</h2>
						<Link
							className="link-hover link text-sm"
							search={{ page: 1 }}
							to="/movies/recent"
						>
							더보기 →
						</Link>
					</div>
					<div className="grid grid-cols-1 gap-2">
						{recentMovies.map((movie: Movie) => (
							<MovieCard key={movie._id} mode="link" movie={movie} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
