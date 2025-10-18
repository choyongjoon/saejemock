import { SignInButton, useUser } from "@clerk/clerk-react";
import { ThumbsUp } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { SuggestionMenu } from "./SuggestionMenu";

type TitleSuggestionCardProps = {
	suggestion: {
		_id: Id<"titleSuggestions">;
		title: string;
		description?: string;
		votesCount: number;
		isOfficial?: boolean;
		createdBy?: Id<"users">;
	};
	index: number;
	hasVoted: boolean;
	userHasVotedInMovie: boolean;
	currentUserId?: Id<"users">;
	onVote: (suggestionId: Id<"titleSuggestions">) => void;
	onCancelVote: (suggestionId: Id<"titleSuggestions">) => void;
	onDelete: (suggestionId: Id<"titleSuggestions">) => void;
};

export function TitleSuggestionCard({
	suggestion,
	index,
	hasVoted,
	userHasVotedInMovie,
	currentUserId,
	onVote,
	onCancelVote,
	onDelete,
}: TitleSuggestionCardProps) {
	const { isSignedIn } = useUser();

	// Check if current user is the creator
	const isCreator =
		currentUserId &&
		suggestion.createdBy &&
		currentUserId === suggestion.createdBy;

	const renderVoteButton = () => {
		if (!isSignedIn) {
			return (
				<SignInButton mode="modal">
					<button className="btn btn-primary" type="button">
						<ThumbsUp />
					</button>
				</SignInButton>
			);
		}

		if (hasVoted) {
			// User voted for this suggestion - show cancel button
			return (
				<button
					className="btn btn-neutral"
					onClick={() => onCancelVote(suggestion._id)}
					type="button"
				>
					취소
				</button>
			);
		}

		// User has voted for another suggestion - disable button
		if (userHasVotedInMovie) {
			return (
				<button className="btn btn-disabled" disabled type="button">
					<ThumbsUp />
				</button>
			);
		}

		// User hasn't voted - show normal vote button
		return (
			<button
				className="btn btn-primary"
				onClick={() => onVote(suggestion._id)}
				type="button"
			>
				<ThumbsUp />
			</button>
		);
	};

	return (
		<li
			className={`min-h-21 list-row items-center px-0 ${
				suggestion.isOfficial ? "border-amber-400" : "border-gray-200"
			}`}
			style={{
				viewTransitionName: `suggestion-${suggestion._id}`,
			}}
		>
			<div className="flex h-full flex-col">
				<span className="text-xl tabular-nums">#{index + 1}</span>
				{suggestion.isOfficial && (
					<div className="text-center text-xs">공식</div>
				)}
				{!suggestion.isOfficial && isSignedIn && (
					<SuggestionMenu
						isCreator={!!isCreator}
						onDelete={onDelete}
						suggestionId={suggestion._id}
						suggestionTitle={suggestion.title}
					/>
				)}
			</div>
			<div className="h-full flex-1 items-start">
				<h4 className="font-semibold text-xl">{suggestion.title}</h4>
				<p className="line-clamp-1 opacity-80">{suggestion.description}</p>
			</div>
			<div className="text-sm tabular-nums">{suggestion.votesCount}</div>
			{renderVoteButton()}
		</li>
	);
}
