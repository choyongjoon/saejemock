import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type TitleSuggestion = {
	_id: string;
	_creationTime: number;
	movieId: string;
	title: string;
	description?: string;
	votesCount: number;
	createdAt: number;
	createdBy?: string;
};

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
			<div className="mx-auto max-w-4xl">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{/* Movie Poster */}
					<div className="md:col-span-1">
						{movie.posterUrl ? (
							<img
								alt={movie.originalTitle}
								className="w-full rounded-lg shadow-lg"
								src={movie.posterUrl}
							/>
						) : (
							<div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-gray-200">
								<span className="text-gray-400">No poster available</span>
							</div>
						)}
					</div>

					{/* Movie Info */}
					<div className="md:col-span-2">
						<h1 className="mb-2 font-bold text-3xl">{movie.originalTitle}</h1>
						{movie.koreanTitle && (
							<h2 className="mb-4 text-gray-600 text-xl">
								{movie.koreanTitle}
							</h2>
						)}

						<div className="mb-6 flex gap-4">
							{movie.imdbUrl && (
								<a
									className="rounded bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600"
									href={movie.imdbUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									IMDb
								</a>
							)}
							{movie.watchaPediaUrl && (
								<a
									className="rounded bg-purple-500 px-4 py-2 text-white transition hover:bg-purple-600"
									href={movie.watchaPediaUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									왓챠피디아
								</a>
							)}
						</div>

						{/* Title Suggestions Section */}
						<div>
							<h3 className="mb-4 font-bold text-2xl">제목 제안</h3>
							<TitleSuggestions suggestions={movie.titleSuggestions || []} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TitleSuggestions({ suggestions }: { suggestions: TitleSuggestion[] }) {
	if (suggestions.length === 0) {
		return (
			<div className="rounded-lg bg-gray-50 p-6 text-center">
				<p className="mb-4 text-gray-600">아직 제목 제안이 없습니다.</p>
				<button
					className="rounded bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
					type="button"
				>
					첫 제목 제안하기
				</button>
			</div>
		);
	}

	// Show top 3 suggestions
	const topSuggestions = suggestions.slice(0, 3);

	return (
		<div className="space-y-4">
			{topSuggestions.map((suggestion, index) => (
				<div
					className="rounded-lg border border-gray-200 bg-white p-6 transition hover:shadow-md"
					key={suggestion._id}
				>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-2 flex items-center gap-3">
								<span className="font-bold text-2xl text-gray-400">
									#{index + 1}
								</span>
								<h4 className="font-semibold text-xl">{suggestion.title}</h4>
							</div>
							{suggestion.description && (
								<p className="mb-4 text-gray-600">{suggestion.description}</p>
							)}
						</div>
						<div className="flex flex-col items-center gap-2">
							<button
								className="rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
								type="button"
							>
								👍 투표
							</button>
							<span className="text-gray-500 text-sm">
								{suggestion.votesCount}표
							</span>
						</div>
					</div>
				</div>
			))}

			<button
				className="w-full rounded-lg border-2 border-gray-300 border-dashed py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-500"
				type="button"
			>
				+ 새로운 제목 제안하기
			</button>
		</div>
	);
}
