type LoadingSpinnerProps = {
	fullScreen?: boolean;
	size?: "sm" | "md" | "lg";
};

export default function LoadingSpinner({
	fullScreen = true,
	size = "lg",
}: LoadingSpinnerProps) {
	const sizeClass = {
		sm: "loading-sm",
		md: "loading-md",
		lg: "loading-lg",
	}[size];

	const containerClass = fullScreen
		? "flex min-h-screen items-center justify-center"
		: "flex min-h-[400px] items-center justify-center";

	return (
		<div className={containerClass}>
			<div className={`loading loading-spinner ${sizeClass}`} />
		</div>
	);
}
