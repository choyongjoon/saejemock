import { SignInButton, useUser } from "@clerk/clerk-react";
import { useState } from "react";

type AddSuggestionFormProps = {
	onSubmit: (title: string, description?: string) => Promise<void>;
};

export function AddSuggestionForm({ onSubmit }: AddSuggestionFormProps) {
	const { isSignedIn } = useUser();
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim()) {
			return;
		}
		try {
			await onSubmit(newTitle.trim(), newDescription.trim() || undefined);
			setNewTitle("");
			setNewDescription("");
			setIsAddingNew(false);
		} catch {
			// Error handled silently
		}
	};

	const handleCancel = () => {
		setIsAddingNew(false);
		setNewTitle("");
		setNewDescription("");
	};

	if (!isSignedIn) {
		return (
			<SignInButton mode="modal">
				<button
					className="w-full rounded-lg border-2 border-gray-300 border-dashed py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-500"
					type="button"
				>
					+ 로그인하고 제목 제안하기
				</button>
			</SignInButton>
		);
	}

	if (isAddingNew) {
		return (
			<form
				className="rounded-lg border-2 border-blue-500 bg-white p-6"
				onSubmit={handleSubmit}
			>
				<h4 className="mb-4 font-semibold text-lg">새로운 제목 제안</h4>
				<div className="mb-4">
					<label className="mb-2 block font-medium text-sm" htmlFor="newTitle">
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
						onClick={handleCancel}
						type="button"
					>
						취소
					</button>
				</div>
			</form>
		);
	}

	return (
		<button
			className="w-full rounded-lg border-2 border-gray-300 border-dashed py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-500"
			onClick={() => setIsAddingNew(true)}
			type="button"
		>
			+ 새로운 제목 제안하기
		</button>
	);
}
