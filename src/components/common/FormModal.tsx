import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type FormModalProps = {
	isOpen: boolean;
	title: string;
	children: ReactNode;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isConfirmDisabled?: boolean;
};

export function FormModal({
	isOpen,
	title,
	children,
	confirmText = "확인",
	cancelText = "취소",
	onConfirm,
	onCancel,
	isConfirmDisabled = false,
}: FormModalProps) {
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
				<h3 className="mb-4 font-bold text-lg">{title}</h3>
				<div className="py-2">{children}</div>
				<div className="modal-action">
					<button className="btn btn-ghost" onClick={onCancel} type="button">
						{cancelText}
					</button>
					<button
						className="btn btn-primary"
						disabled={isConfirmDisabled}
						onClick={onConfirm}
						type="button"
					>
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
