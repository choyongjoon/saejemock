import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { FormModal } from "../common/FormModal";

interface ReportButtonProps {
	suggestionId: Id<"titleSuggestions">;
	suggestionTitle: string;
	onReportSuccess?: () => void;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 100;

export function ReportButton({
	suggestionId,
	suggestionTitle,
}: ReportButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");

	const report = useMutation(api.reports.reportSuggestion);

	const handleSubmit = () => {
		setError("");

		if (reason.length < MIN_REASON_LENGTH) {
			setError(`신고 사유는 최소 ${MIN_REASON_LENGTH}자 이상 입력해주세요.`);
			return;
		}

		if (reason.length > MAX_REASON_LENGTH) {
			setError(`신고 사유는 ${MAX_REASON_LENGTH}자를 초과할 수 없습니다.`);
			return;
		}

		report({ suggestionId, reason });
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setReason("");
		setError("");
	};

	return (
		<>
			<button onClick={() => setIsModalOpen(true)} type="button">
				신고하기
			</button>

			<FormModal
				cancelText="취소"
				confirmText="신고하기"
				isConfirmDisabled={reason.length < MIN_REASON_LENGTH}
				isOpen={isModalOpen}
				onCancel={closeModal}
				onConfirm={handleSubmit}
				title="부적절한 제목 신고"
			>
				<div className="space-y-4">
					<fieldset className="fieldset">
						<legend className="fieldset-legend">신고할 제목</legend>
						<input
							className="input w-full text-base"
							defaultValue={suggestionTitle}
							disabled
						/>
					</fieldset>

					<fieldset className="fieldset">
						<legend className="fieldset-legend">신고 사유</legend>
						<textarea
							className="textarea w-full text-base"
							onChange={(e) => setReason(e.target.value)}
							placeholder={`신고 사유를 구체적으로 작성해주세요 (최소 ${MIN_REASON_LENGTH}자)`}
							rows={4}
							value={reason}
						/>
						<p className="label flex h-4.5 justify-between">
							<span className="text-error">{error}</span>
							<span className="text-sm opacity-70">
								{reason.length}/{MAX_REASON_LENGTH}자
							</span>
						</p>
					</fieldset>
				</div>
			</FormModal>
		</>
	);
}
