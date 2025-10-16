import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
	const modalRoot = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Create modal root if it doesn't exist
		if (!modalRoot.current) {
			const existingRoot = document.getElementById("modal-root");
			if (existingRoot) {
				modalRoot.current = existingRoot as HTMLDivElement;
			} else {
				const div = document.createElement("div");
				div.id = "modal-root";
				document.body.appendChild(div);
				modalRoot.current = div;
			}
		}
	}, []);

	if (!(isOpen && modalRoot.current)) {
		return null;
	}

	return createPortal(
		<div className="modal modal-open z-[9999]">
			<div className="modal-box relative z-[10000]">
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
			<button
				aria-label="Close modal"
				className="modal-backdrop fixed inset-0 z-[9998] bg-black/50"
				onClick={onCancel}
				type="button"
			/>
		</div>,
		modalRoot.current
	);
}
