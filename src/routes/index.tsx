import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
	Route as RouteIcon,
	Server,
	Shield,
	Sparkles,
	Waves,
	Zap,
} from "lucide-react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const features = [
		{
			icon: <Zap className="h-12 w-12 text-cyan-400" />,
			title: "Powerful Server Functions",
			description:
				"Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.",
		},
		{
			icon: <Server className="h-12 w-12 text-cyan-400" />,
			title: "Flexible Server Side Rendering",
			description:
				"Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.",
		},
		{
			icon: <RouteIcon className="h-12 w-12 text-cyan-400" />,
			title: "API Routes",
			description:
				"Build type-safe API endpoints alongside your application. No separate backend needed.",
		},
		{
			icon: <Shield className="h-12 w-12 text-cyan-400" />,
			title: "Strongly Typed Everything",
			description:
				"End-to-end type safety from server to client. Catch errors before they reach production.",
		},
		{
			icon: <Waves className="h-12 w-12 text-cyan-400" />,
			title: "Full Streaming Support",
			description:
				"Stream data from server to client progressively. Perfect for AI applications and real-time updates.",
		},
		{
			icon: <Sparkles className="h-12 w-12 text-cyan-400" />,
			title: "Next Generation Ready",
			description:
				"Built from the ground up for modern web applications. Deploy anywhere JavaScript runs.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<section className="relative overflow-hidden px-6 py-20 text-center">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
				<div className="relative mx-auto max-w-5xl">
					<div className="mb-6 flex items-center justify-center gap-6">
						<h1 className="font-bold text-6xl text-white md:text-7xl">
							<span className="text-gray-300">TANSTACK</span>{" "}
							<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
								START
							</span>
						</h1>
					</div>
					<p className="mb-4 font-light text-2xl text-gray-300 md:text-3xl">
						The framework for next generation AI applications
					</p>
					<p className="mx-auto mb-8 max-w-3xl text-gray-400 text-lg">
						Full-stack framework powered by TanStack Router for React and Solid.
						Build modern applications with server functions, streaming, and type
						safety.
					</p>
					<div className="flex flex-col items-center gap-4">
						<a
							className="rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-white shadow-cyan-500/50 shadow-lg transition-colors hover:bg-cyan-600"
							href="https://tanstack.com/start"
							rel="noopener noreferrer"
							target="_blank"
						>
							Documentation
						</a>
						<p className="mt-2 text-gray-400 text-sm">
							Begin your TanStack Start journey by editing{" "}
							<code className="rounded bg-slate-700 px-2 py-1 text-cyan-400">
								/src/routes/index.tsx
							</code>
						</p>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-6 py-16">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<div
							className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg"
							key={feature.title}
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="mb-3 font-semibold text-white text-xl">
								{feature.title}
							</h3>
							<p className="text-gray-400 leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-6 py-16">
				<h2 className="mb-8 text-center font-bold text-3xl text-white">
					영화 제목 번역 제안
				</h2>
				<MoviesSection />
			</section>
		</div>
	);
}

function MoviesSection() {
	const moviesByViews = useQuery(api.movies.getMoviesByViewCount, { limit: 6 });
	const recentMovies = useQuery(api.movies.getMoviesByCreatedAt, { limit: 6 });
	const seedMovie = useMutation(api.seedMovies.seedOneBattleAfterAnother);

	const handleSeedMovie = async () => {
		try {
			const result = await seedMovie({});
			if (result.success) {
				alert("Sample movie added successfully!");
			} else {
				alert(result.message);
			}
		} catch (error) {
			console.error("Error seeding movie:", error);
			alert("Failed to add sample movie");
		}
	};

	if (moviesByViews === undefined || recentMovies === undefined) {
		return (
			<div className="text-center text-gray-400">
				영화 목록을 불러오는 중...
			</div>
		);
	}

	return (
		<div className="space-y-12">
			{/* Seed Button */}
			<div className="text-center">
				<button
					className="rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/50 transition-colors hover:bg-purple-600"
					onClick={handleSeedMovie}
					type="button"
				>
					샘플 영화 추가하기
				</button>
			</div>

			{/* Most Viewed */}
			<div>
				<h3 className="mb-4 font-semibold text-2xl text-white">
					조회수 순 영화
				</h3>
				{moviesByViews.length === 0 ? (
					<p className="text-center text-gray-400">아직 영화가 없습니다.</p>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{moviesByViews.map((movie) => (
							<Link
								className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg"
								key={movie._id}
								params={{ shortId: movie.shortId }}
								to="/movie/$shortId"
							>
								<h4 className="mb-2 font-semibold text-lg text-white">
									{movie.originalTitle}
								</h4>
								{movie.koreanTitle && (
									<p className="mb-2 text-gray-400 text-sm">
										{movie.koreanTitle}
									</p>
								)}
								<p className="text-gray-500 text-sm">
									조회수: {movie.viewCount.toLocaleString()}회
								</p>
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Recently Added */}
			<div>
				<h3 className="mb-4 font-semibold text-2xl text-white">
					신규 추가 영화
				</h3>
				{recentMovies.length === 0 ? (
					<p className="text-center text-gray-400">아직 영화가 없습니다.</p>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{recentMovies.map((movie) => (
							<Link
								className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg"
								key={movie._id}
								params={{ shortId: movie.shortId }}
								to="/movie/$shortId"
							>
								<h4 className="mb-2 font-semibold text-lg text-white">
									{movie.originalTitle}
								</h4>
								{movie.koreanTitle && (
									<p className="mb-2 text-gray-400 text-sm">
										{movie.koreanTitle}
									</p>
								)}
								<p className="text-gray-500 text-sm">
									{new Date(movie.createdAt).toLocaleDateString("ko-KR")}
								</p>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
