import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Clock, Film, TrendingUp, Users } from "lucide-react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			{/* Hero Section */}
			<section className="relative overflow-hidden px-6 py-20 text-center">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
				<div className="relative mx-auto max-w-5xl">
					<div className="mb-6 inline-flex items-center justify-center rounded-full bg-cyan-500/10 p-6">
						<Film className="h-16 w-16 text-cyan-400" />
					</div>
					<h1 className="mb-4 font-bold text-5xl text-white md:text-6xl">
						영화 제목 번역 제안
					</h1>
					<p className="mx-auto mb-8 max-w-3xl text-gray-400 text-xl">
						당신의 센스있는 번역으로 영화 제목에 새로운 생명을 불어넣어 보세요
					</p>
					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
						<Link
							className="rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-white shadow-cyan-500/50 shadow-lg transition-colors hover:bg-cyan-600"
							to="/movie/add"
						>
							+ 영화 추가하기
						</Link>
					</div>
				</div>
			</section>

			{/* Movies Section */}
			<section className="mx-auto max-w-7xl px-6 py-16">
				<MoviesSection />
			</section>
		</div>
	);
}

type Movie = {
	_id: string;
	_creationTime: number;
	shortId: string;
	originalTitle: string;
	koreanTitle?: string;
	posterUrl?: string;
	imdbId?: string;
	imdbUrl?: string;
	viewCount: number;
	createdAt: number;
};

type MovieWithVotes = Movie & {
	totalVotes: number;
};

function MoviesSection() {
	const moviesByVotes = useQuery(api.movies.getMoviesByTotalVotes, {
		limit: 6,
	});
	const moviesByViews = useQuery(api.movies.getMoviesByViewCount, { limit: 6 });
	const recentMovies = useQuery(api.movies.getMoviesByCreatedAt, { limit: 6 });
	const seedMovie = useMutation(api.seedMovies.seedOneBattleAfterAnother);

	const handleSeedMovie = async () => {
		try {
			const result = await seedMovie({});
			if (result.success) {
				// Success - page will auto-refresh with new data
			}
		} catch {
			// Error handling - could add toast notification here
		}
	};

	const isLoading =
		moviesByVotes === undefined ||
		moviesByViews === undefined ||
		recentMovies === undefined;

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-gray-700 border-t-2 border-b-2" />
			</div>
		);
	}

	const hasAnyMovies =
		moviesByVotes.length > 0 ||
		moviesByViews.length > 0 ||
		recentMovies.length > 0;

	return (
		<div className="space-y-16">
			{!hasAnyMovies && (
				<div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center backdrop-blur-sm">
					<Film className="mx-auto mb-4 h-16 w-16 text-gray-600" />
					<h3 className="mb-2 font-semibold text-2xl text-white">
						아직 영화가 없습니다
					</h3>
					<p className="mb-6 text-gray-400">
						첫 번째 영화를 추가하고 제목 번역 제안을 시작해보세요!
					</p>
					<button
						className="rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/50 transition-colors hover:bg-purple-600"
						onClick={handleSeedMovie}
						type="button"
					>
						샘플 영화 추가하기
					</button>
				</div>
			)}

			{/* Movies by Total Votes */}
			{moviesByVotes.length > 0 && (
				<section>
					<div className="mb-6 flex items-center gap-3">
						<Users className="h-8 w-8 text-cyan-400" />
						<h2 className="font-bold text-3xl text-white">투표가 많은 영화</h2>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{moviesByVotes.map((movie: MovieWithVotes) => (
							<MovieCard
								badge={`${movie.totalVotes}표`}
								badgeColor="cyan"
								key={movie._id}
								movie={movie}
							/>
						))}
					</div>
				</section>
			)}

			{/* Movies by View Count */}
			{moviesByViews.length > 0 && (
				<section>
					<div className="mb-6 flex items-center gap-3">
						<TrendingUp className="h-8 w-8 text-green-400" />
						<h2 className="font-bold text-3xl text-white">
							조회수가 높은 영화
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{moviesByViews.map((movie: Movie) => (
							<MovieCard
								badge={`${movie.viewCount.toLocaleString()}회`}
								badgeColor="green"
								key={movie._id}
								movie={movie}
							/>
						))}
					</div>
				</section>
			)}

			{/* Recently Added Movies */}
			{recentMovies.length > 0 && (
				<section>
					<div className="mb-6 flex items-center gap-3">
						<Clock className="h-8 w-8 text-purple-400" />
						<h2 className="font-bold text-3xl text-white">신규 추가 영화</h2>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{recentMovies.map((movie: Movie) => (
							<MovieCard
								badge={new Date(movie.createdAt).toLocaleDateString("ko-KR")}
								badgeColor="purple"
								key={movie._id}
								movie={movie}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

type MovieCardProps = {
	movie: Movie | MovieWithVotes;
	badge: string;
	badgeColor: "cyan" | "green" | "purple";
};

function MovieCard({ movie, badge, badgeColor }: MovieCardProps) {
	const badgeClasses = {
		cyan: "bg-cyan-500/20 text-cyan-300",
		green: "bg-green-500/20 text-green-300",
		purple: "bg-purple-500/20 text-purple-300",
	};

	return (
		<Link
			className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-xl"
			params={{ shortId: movie.shortId }}
			to="/movie/$shortId"
		>
			{/* Poster */}
			<div className="aspect-[2/3] overflow-hidden bg-slate-900">
				{movie.posterUrl ? (
					<img
						alt={movie.originalTitle}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						height="450"
						src={movie.posterUrl}
						width="300"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<Film className="h-24 w-24 text-gray-700" />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4">
				<h3 className="mb-2 line-clamp-2 font-semibold text-lg text-white">
					{movie.originalTitle}
				</h3>
				{movie.koreanTitle && (
					<p className="mb-3 line-clamp-1 text-gray-400 text-sm">
						{movie.koreanTitle}
					</p>
				)}
				<div
					className={`inline-block rounded-full px-3 py-1 font-medium text-xs ${badgeClasses[badgeColor]}`}
				>
					{badge}
				</div>
			</div>
		</Link>
	);
}
