type LoadingSpinnerProps = {
	fullScreen?: boolean;
	size?: "sm" | "md" | "lg";
};

export default function LoadingSpinner({
	fullScreen = true,
	size = "lg",
}: LoadingSpinnerProps) {
	const sizeClass = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12",
	}[size];

	const containerClass = fullScreen
		? "flex min-h-screen items-center justify-center"
		: "flex min-h-[400px] items-center justify-center";

	return (
		<div className={containerClass}>
			<div
				className={`${sizeClass} animate-spin rounded-full border-gray-900 border-b-2`}
			/>
		</div>
	);
}
