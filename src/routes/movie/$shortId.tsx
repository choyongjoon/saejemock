import { SignInButton, useUser } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type TitleSuggestion = {
	_id: Id<"titleSuggestions">;
	_creationTime: number;
	movieId: Id<"movies">;
	title: string;
	description?: string;
	votesCount: number;
	createdAt: number;
	createdBy?: Id<"users">;
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
								height="450"
								src={movie.posterUrl}
								width="300"
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

						<div className="mb-6 flex flex-wrap gap-3">
							{movie.imdbUrl && (
								<a
									className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white shadow transition hover:bg-yellow-600"
									href={movie.imdbUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									IMDb
								</a>
							)}
							<a
								className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow transition hover:bg-blue-600"
								href="https://www.kobis.or.kr/kobis/business/mast/mvie/searchMovieList.do"
								rel="noopener noreferrer"
								target="_blank"
							>
								영화진흥위원회 (한국 공식 제목)
							</a>
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
	const { isSignedIn } = useUser();
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const voteForSuggestion = useMutation(api.titleSuggestions.voteForSuggestion);
	const addSuggestion = useMutation(api.titleSuggestions.addSuggestion);
	const { shortId } = Route.useParams();
	const movie = useQuery(api.movies.getMovieByShortId, { shortId });

	const handleVote = async (suggestionId: Id<"titleSuggestions">) => {
		if (!isSignedIn) {
			return;
		}
		try {
			await voteForSuggestion({ suggestionId });
		} catch {
			// Error handled silently
		}
	};

	const handleAddSuggestion = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(movie && newTitle.trim())) {
			return;
		}
		try {
			await addSuggestion({
				movieId: movie._id,
				title: newTitle.trim(),
				description: newDescription.trim() || undefined,
			});
			setNewTitle("");
			setNewDescription("");
			setIsAddingNew(false);
		} catch {
			// Error handled silently
		}
	};

	if (suggestions.length === 0) {
		return (
			<div className="rounded-lg bg-gray-50 p-6 text-center">
				<p className="mb-4 text-gray-600">아직 제목 제안이 없습니다.</p>
				{isSignedIn ? (
					<button
						className="rounded bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
						onClick={() => setIsAddingNew(true)}
						type="button"
					>
						첫 제목 제안하기
					</button>
				) : (
					<SignInButton mode="modal">
						<button
							className="flex items-center gap-2 rounded bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
							type="button"
						>
							<LogIn className="h-4 w-4" />
							로그인하고 제목 제안하기
						</button>
					</SignInButton>
				)}
			</div>
		);
	}

	// Show top 3 suggestions
	const TOP_SUGGESTIONS_COUNT = 3;
	const topSuggestions = suggestions.slice(0, TOP_SUGGESTIONS_COUNT);

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
							{isSignedIn ? (
								<button
									className="rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
									onClick={() => handleVote(suggestion._id)}
									type="button"
								>
									👍 투표
								</button>
							) : (
								<SignInButton mode="modal">
									<button
										className="rounded bg-gray-400 px-4 py-2 text-white transition hover:bg-gray-500"
										type="button"
									>
										👍 투표
									</button>
								</SignInButton>
							)}
							<span className="text-gray-500 text-sm">
								{suggestion.votesCount}표
							</span>
						</div>
					</div>
				</div>
			))}

			{isSignedIn ? (
				isAddingNew ? (
					<form
						className="rounded-lg border-2 border-blue-500 bg-white p-6"
						onSubmit={handleAddSuggestion}
					>
						<h4 className="mb-4 font-semibold text-lg">새로운 제목 제안</h4>
						<div className="mb-4">
							<label
								className="mb-2 block font-medium text-sm"
								htmlFor="newTitle"
							>
								제목 *
							</label>
							<input
								className="w-full rounded border border-gray-300 px-3 py-2"
								id="newTitle"
								onChange={(e) => setNewTitle(e.target.value)}
								placeholder="번역된 제목을 입력하세요"
								required
								type="text"
								value={newTitle}
							/>
						</div>
						<div className="mb-4">
							<label
								className="mb-2 block font-medium text-sm"
								htmlFor="newDescription"
							>
								설명 (선택)
							</label>
							<textarea
								className="w-full rounded border border-gray-300 px-3 py-2"
								id="newDescription"
								onChange={(e) => setNewDescription(e.target.value)}
								placeholder="제목 선택 이유를 설명해주세요"
								rows={3}
								value={newDescription}
							/>
						</div>
						<div className="flex gap-2">
							<button
								className="flex-1 rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
								type="submit"
							>
								제안하기
							</button>
							<button
								className="rounded bg-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-400"
								onClick={() => {
									setIsAddingNew(false);
									setNewTitle("");
									setNewDescription("");
								}}
								type="button"
							>
								취소
							</button>
						</div>
					</form>
				) : (
					<button
						className="w-full rounded-lg border-2 border-gray-300 border-dashed py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-500"
						onClick={() => setIsAddingNew(true)}
						type="button"
					>
						+ 새로운 제목 제안하기
					</button>
				)
			) : (
				<SignInButton mode="modal">
					<button
						className="w-full rounded-lg border-2 border-gray-300 border-dashed py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-500"
						type="button"
					>
						+ 로그인하고 제목 제안하기
					</button>
				</SignInButton>
			)}
		</div>
	);
}
