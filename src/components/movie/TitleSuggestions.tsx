import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useViewTransition } from "../../hooks/useViewTransition";
import { AddSuggestionForm } from "./AddSuggestionForm";
import { TitleSuggestionCard } from "./TitleSuggestionCard";

type TitleSuggestion = {
	_id: Id<"titleSuggestions">;
	_creationTime: number;
	movieId: Id<"movies">;
	title: string;
	description?: string;
	votesCount: number;
	createdAt: number;
	createdBy?: Id<"users">;
	isOfficial?: boolean;
};

type TitleSuggestionsProps = {
	suggestions: TitleSuggestion[];
};

const TOP_SUGGESTIONS_COUNT = 3;

export function TitleSuggestions({ suggestions }: TitleSuggestionsProps) {
	const voteForSuggestion = useMutation(api.titleSuggestions.voteForSuggestion);
	const cancelVote = useMutation(api.titleSuggestions.cancelVote);
	const addSuggestion = useMutation(api.titleSuggestions.addSuggestion);
	const deleteSuggestion = useMutation(api.titleSuggestions.deleteSuggestion);
	const { startTransition } = useViewTransition();

	// Get movie ID from the first suggestion
	const movieId = suggestions[0]?.movieId;

	// Get current user
	const currentUser = useQuery(api.users.current);

	// Get user's vote for this movie
	const userVote = useQuery(
		api.titleSuggestions.getUserVoteForMovie,
		movieId ? { movieId } : "skip"
	);

	const handleVote = (suggestionId: Id<"titleSuggestions">) => {
		startTransition(async () => {
			try {
				await voteForSuggestion({ suggestionId });
			} catch (error) {
				console.error("Vote failed:", error);
			}
		});
	};

	const handleCancelVote = (suggestionId: Id<"titleSuggestions">) => {
		startTransition(async () => {
			try {
				await cancelVote({ suggestionId });
			} catch (error) {
				console.error("Cancel vote failed:", error);
			}
		});
	};

	const handleDelete = (suggestionId: Id<"titleSuggestions">) => {
		startTransition(async () => {
			try {
				await deleteSuggestion({ suggestionId });
			} catch (error) {
				console.error("Delete failed:", error);
			}
		});
	};

	const handleAddSuggestion = async (title: string, description?: string) => {
		if (!movieId) {
			return;
		}
		await addSuggestion({
			movieId,
			title,
			description,
		});
	};

	const topSuggestions = suggestions.slice(0, TOP_SUGGESTIONS_COUNT);

	return (
		<ul className="list">
			{topSuggestions.map((suggestion, index) => (
				<TitleSuggestionCard
					currentUserId={currentUser?._id}
					hasVoted={userVote?.suggestionId === suggestion._id}
					index={index}
					key={suggestion._id}
					onCancelVote={handleCancelVote}
					onDelete={handleDelete}
					onVote={handleVote}
					suggestion={suggestion}
					userHasVotedInMovie={userVote !== null && userVote !== undefined}
				/>
			))}

			<AddSuggestionForm onSubmit={handleAddSuggestion} />
		</ul>
	);
}
