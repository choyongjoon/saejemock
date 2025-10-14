import { SignInButton, useUser } from "@clerk/clerk-react";
import { ThumbsUp, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { ConfirmModal } from "../common/ConfirmModal";

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
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// Check if current user is the creator
	const isCreator =
		currentUserId &&
		suggestion.createdBy &&
		currentUserId === suggestion.createdBy;

	const handleDeleteClick = () => {
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		onDelete(suggestion._id);
		setIsDeleteModalOpen(false);
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
	};

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
			className={`min-h-22 list-row items-center ${
				suggestion.isOfficial ? "border-amber-400" : "border-gray-200"
			}`}
			style={{
				viewTransitionName: `suggestion-${suggestion._id}`,
			}}
		>
			<div>
				<span className="text-2xl tabular-nums">#{index + 1}</span>
				{suggestion.isOfficial ? (
					<div className="text-center text-xs">공식</div>
				) : null}
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2">
					<h4 className="font-semibold text-2xl">{suggestion.title}</h4>
					{isCreator && !suggestion.isOfficial ? (
						<button
							className="btn btn-ghost btn-xs opacity-40 hover:opacity-100"
							onClick={handleDeleteClick}
							title="삭제"
							type="button"
						>
							<Trash2 size={14} />
						</button>
					) : null}
				</div>
				<p className="line-clamp-1 opacity-80">{suggestion.description}</p>
			</div>
			<div className="text-sm tabular-nums">{suggestion.votesCount}</div>
			<div>{renderVoteButton()}</div>
			<ConfirmModal
				cancelText="취소"
				confirmText="삭제"
				isOpen={isDeleteModalOpen}
				message="이 제목 제안을 삭제하시겠습니까? 삭제된 제안은 복구할 수 없습니다."
				onCancel={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title="제목 제안 삭제"
			/>
		</li>
	);
}
