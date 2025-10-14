type MoviePosterProps = {
	posterUrl?: string;
	title: string;
};

export function MoviePoster({ posterUrl, title }: MoviePosterProps) {
	return (
		<div className="md:col-span-1">
			{posterUrl ? (
				<img
					alt={title}
					className="w-full rounded-lg shadow-lg"
					height="450"
					src={posterUrl}
					width="300"
				/>
			) : (
				<div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-gray-200">
					<span className="text-gray-400">No poster available</span>
				</div>
			)}
		</div>
	);
}
