import { SignInButton, useUser } from "@clerk/clerk-react";
import { type ChangeEvent, useState } from "react";

type AddSuggestionFormProps = {
	onSubmit: (
		title: string,
		description?: string
	) => Promise<{ success: boolean; error?: string }>;
};

export function AddSuggestionForm({ onSubmit }: AddSuggestionFormProps) {
	const { isSignedIn } = useUser();
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim()) {
			return;
		}
		setErrorMessage(null);

		const result = await onSubmit(
			newTitle.trim(),
			newDescription.trim() || undefined
		);

		if (result.success) {
			setNewTitle("");
			setNewDescription("");
			setIsAddingNew(false);
		} else if (
			result.error?.includes("A suggestion with this title already exists")
		) {
			setErrorMessage("이미 같은 제안이 존재합니다.");
		} else {
			setErrorMessage("제안 추가에 실패했습니다.");
		}
	};

	const handleCancel = () => {
		setIsAddingNew(false);
		setNewTitle("");
		setNewDescription("");
		setErrorMessage(null);
	};

	const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
		setNewTitle(e.target.value);
		setErrorMessage(null);
	};

	if (!isSignedIn) {
		return (
			<SignInButton mode="modal">
				<button className="btn btn-dash w-full" type="button">
					+ 로그인하고 제목 제안
				</button>
			</SignInButton>
		);
	}

	if (isAddingNew) {
		return (
			<form className="card w-full py-2" onSubmit={handleSubmit}>
				<h4 className="font-semibold text-lg">새 제목 제안</h4>
				<fieldset className="fieldset">
					<legend className="fieldset-legend">제목</legend>
					<input
						autoFocus
						className="input w-full text-base"
						onChange={handleChangeTitle}
						required
						type="text"
						value={newTitle}
					/>
					<p className="label h-4.5">{errorMessage}</p>
				</fieldset>
				<fieldset className="fieldset">
					<legend className="fieldset-legend">설명 (선택)</legend>
					<textarea
						className="textarea w-full text-base"
						onChange={(e) => setNewDescription(e.target.value)}
						rows={3}
						value={newDescription}
					/>
				</fieldset>
				<div className="mt-2 flex gap-2">
					<button
						className="btn btn-warning"
						onClick={handleCancel}
						type="button"
					>
						취소
					</button>
					<button className="btn btn-primary flex-1" type="submit">
						제안하기
					</button>
				</div>
			</form>
		);
	}

	return (
		<li className="flex list-row px-0">
			<button
				className="btn btn-dash w-full"
				onClick={() => setIsAddingNew(true)}
				type="button"
			>
				새 제목 제안
			</button>
		</li>
	);
}
