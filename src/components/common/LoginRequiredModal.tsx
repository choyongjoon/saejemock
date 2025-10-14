import { SignInButton } from "@clerk/clerk-react";

type LoginRequiredModalProps = {
	isOpen: boolean;
	onClose: () => void;
	message?: string;
};

export function LoginRequiredModal({
	isOpen,
	onClose,
	message = "이 기능을 사용하려면 로그인이 필요합니다.",
}: LoginRequiredModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="modal modal-open">
			<div className="modal-box">
				<h3 className="font-bold text-lg">로그인 필요</h3>
				<p className="py-4">{message}</p>
				<div className="modal-action">
					<button className="btn btn-ghost" onClick={onClose} type="button">
						취소
					</button>
					<SignInButton mode="modal">
						<button className="btn btn-primary" type="button">
							로그인
						</button>
					</SignInButton>
				</div>
			</div>
		</div>
	);
}
