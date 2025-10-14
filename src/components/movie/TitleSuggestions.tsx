import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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
	const addSuggestion = useMutation(api.titleSuggestions.addSuggestion);

	// Get movie ID from the first suggestion
	const movieId = suggestions[0]?.movieId;

	const handleVote = async (suggestionId: Id<"titleSuggestions">) => {
		try {
			await voteForSuggestion({ suggestionId });
		} catch {
			// Error handled silently
		}
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
		<div className="space-y-4">
			{topSuggestions.map((suggestion, index) => (
				<TitleSuggestionCard
					index={index}
					key={suggestion._id}
					onVote={handleVote}
					suggestion={suggestion}
				/>
			))}

			<AddSuggestionForm onSubmit={handleAddSuggestion} />
		</div>
	);
}
