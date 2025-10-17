import { Link } from "@tanstack/react-router";
import type { MovieInfo } from "@/types/movie";

type MovieCardAsLinkProps = {
	mode: "link";
	movie: MovieInfo;
};

type MovieCardAsButtonProps = {
	mode: "button";
	movie: MovieInfo;
	onClick: () => void;
	disabled?: boolean;
	isLoading?: boolean;
};

type MovieCardProps = MovieCardAsLinkProps | MovieCardAsButtonProps;

function MovieCardContent({ movie }: { movie: MovieInfo }) {
	return (
		<div className="card-body">
			{/* Korean Title (Main) */}
			<h3 className="card-title line-clamp-2 text-base">{movie.koreanTitle}</h3>

			<p className="mb-1 line-clamp-2 text-sm opacity-70">
				{movie.originalTitle || movie.englishTitle}
			</p>

			{/* Movie Metadata */}
			<div className="flex flex-wrap gap-2 text-xs opacity-60">
				{movie.year && <span>{movie.year}년</span>}
				{movie.directors && <span>• {movie.directors}</span>}
				{movie.additionalInfo && <span>• {movie.additionalInfo}</span>}
			</div>
		</div>
	);
}

export default function MovieCard(props: MovieCardProps) {
	if (props.mode === "link") {
		return (
			<Link
				className="card bg-base-200 transition-all hover:shadow-xl"
				params={{ shortId: props.movie.shortId || "" }}
				to="/movie/$shortId"
			>
				<MovieCardContent movie={props.movie} />
			</Link>
		);
	}

	// Determine button state classes
	let stateClasses = "hover:shadow-lg";
	if (props.isLoading) {
		stateClasses = "cursor-wait opacity-50";
	} else if (props.disabled) {
		stateClasses = "cursor-not-allowed opacity-40";
	}

	return (
		<button
			className={`card w-full bg-base-200 text-left transition-all ${stateClasses}`}
			disabled={props.disabled || props.isLoading}
			onClick={props.onClick}
			type="button"
		>
			<div className="relative">
				<MovieCardContent movie={props.movie} />
				{props.isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-base-200/50">
						<span className="loading loading-spinner loading-lg" />
					</div>
				)}
			</div>
		</button>
	);
}
