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
				<button className="btn btn-dash w-full" type="button">
					+ 로그인하고 제목 제안
				</button>
			</SignInButton>
		);
	}

	if (isAddingNew) {
		return (
			<li className="flex list-row">
				<form className="card w-full" onSubmit={handleSubmit}>
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
							rows={3}
							value={newDescription}
						/>
					</div>
					<div className="flex gap-2">
						<button className="btn btn-primary flex-1" type="submit">
							제안하기
						</button>
						<button
							className="btn btn-warning"
							onClick={handleCancel}
							type="button"
						>
							취소
						</button>
					</div>
				</form>
			</li>
		);
	}

	return (
		<li className="flex list-row">
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
