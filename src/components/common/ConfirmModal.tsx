type ConfirmModalProps = {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = "확인",
	cancelText = "취소",
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="modal modal-open">
			<div className="modal-box">
				<h3 className="font-bold text-lg">{title}</h3>
				<p className="py-4">{message}</p>
				<div className="modal-action">
					<button className="btn btn-ghost" onClick={onCancel} type="button">
						{cancelText}
					</button>
					<button className="btn btn-error" onClick={onConfirm} type="button">
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
