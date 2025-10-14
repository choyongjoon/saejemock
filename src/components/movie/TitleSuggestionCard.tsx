import { SignInButton, useUser } from "@clerk/clerk-react";
import type { Id } from "../../../convex/_generated/dataModel";

type TitleSuggestionCardProps = {
	suggestion: {
		_id: Id<"titleSuggestions">;
		title: string;
		description?: string;
		votesCount: number;
		isOfficial?: boolean;
	};
	index: number;
	onVote: (suggestionId: Id<"titleSuggestions">) => void;
};

export function TitleSuggestionCard({
	suggestion,
	index,
	onVote,
}: TitleSuggestionCardProps) {
	const { isSignedIn } = useUser();

	return (
		<div
			className={`rounded-lg border p-6 transition hover:shadow-md ${
				suggestion.isOfficial
					? "border-amber-400 bg-amber-50"
					: "border-gray-200 bg-white"
			}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="mb-2 flex items-center gap-3">
						{suggestion.isOfficial ? (
							<span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 font-bold text-sm text-white">
								⭐ 공식
							</span>
						) : (
							<span className="font-bold text-2xl text-gray-400">
								#{index + 1}
							</span>
						)}
						<h4 className="font-semibold text-xl">{suggestion.title}</h4>
					</div>
					{suggestion.description && (
						<p
							className={`mb-4 ${suggestion.isOfficial ? "text-amber-800" : "text-gray-600"}`}
						>
							{suggestion.description}
						</p>
					)}
				</div>
				<div className="flex flex-col items-center gap-2">
					{isSignedIn ? (
						<button
							className="rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
							onClick={() => onVote(suggestion._id)}
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
	);
}
