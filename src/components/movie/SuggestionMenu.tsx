import { Ellipsis } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { ConfirmModal } from "../common/ConfirmModal";
import { ReportButton } from "./ReportButton";

interface SuggestionMenuProps {
	suggestionId: Id<"titleSuggestions">;
	suggestionTitle: string;
	isCreator: boolean;
	onDelete: (suggestionId: Id<"titleSuggestions">) => void;
}

export function SuggestionMenu({
	suggestionId,
	suggestionTitle,
	isCreator,
	onDelete,
}: SuggestionMenuProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const handleMenuToggle = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleDeleteClick = () => {
		setIsMenuOpen(false);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		onDelete(suggestionId);
		setIsDeleteModalOpen(false);
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
	};

	const handleReportSuccess = () => {
		setIsMenuOpen(false);
	};

	return (
		<>
			<div className="dropdown">
				<button
					className="btn btn-ghost btn-xs px-0 opacity-40 hover:opacity-100"
					onClick={handleMenuToggle}
					title="메뉴"
					type="button"
				>
					<Ellipsis />
				</button>
				{isMenuOpen && (
					<ul className="dropdown-content menu z-[1] min-w-max rounded-box bg-base-100 p-2 shadow">
						{isCreator ? (
							<li>
								<button onClick={handleDeleteClick} type="button">
									삭제하기
								</button>
							</li>
						) : (
							<li>
								<ReportButton
									onReportSuccess={handleReportSuccess}
									suggestionId={suggestionId}
									suggestionTitle={suggestionTitle}
								/>
							</li>
						)}
					</ul>
				)}
			</div>
			<ConfirmModal
				cancelText="취소"
				confirmText="삭제"
				isOpen={isDeleteModalOpen}
				message="이 제목 제안을 삭제하시겠습니까? 삭제된 제안은 복구할 수 없습니다."
				onCancel={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title="제목 제안 삭제"
			/>
		</>
	);
}
