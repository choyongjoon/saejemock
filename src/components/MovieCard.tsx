import { Link } from "@tanstack/react-router";

type BaseMovie = {
	koreanTitle?: string;
	originalTitle: string;
	year?: string;
	directors?: string;
	additionalInfo?: string;
};

type MovieCardAsLinkProps = {
	mode: "link";
	movie: BaseMovie & {
		shortId: string;
	};
};

type MovieCardAsButtonProps = {
	mode: "button";
	movie: BaseMovie;
	onClick: () => void;
	disabled?: boolean;
	isLoading?: boolean;
};

type MovieCardProps = MovieCardAsLinkProps | MovieCardAsButtonProps;

function MovieCardContent({ movie }: { movie: BaseMovie }) {
	return (
		<div className="card-body">
			{/* Korean Title (Main) */}
			<h3 className="card-title line-clamp-2 text-base">
				{movie.koreanTitle || movie.originalTitle}
			</h3>

			{/* Original Title (Subtitle) - only show if different from Korean title */}
			{movie.koreanTitle && movie.originalTitle !== movie.koreanTitle && (
				<p className="mb-1 line-clamp-2 text-sm opacity-70">
					{movie.originalTitle}
				</p>
			)}

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
				params={{ shortId: props.movie.shortId }}
				to="/movie/$shortId"
			>
				<MovieCardContent movie={props.movie} />
			</Link>
		);
	}

	return (
		<button
			className={`card w-full bg-base-200 text-left transition-all hover:shadow-lg ${
				props.isLoading ? "cursor-wait opacity-50" : ""
			}`}
			disabled={props.disabled || props.isLoading}
			onClick={props.onClick}
			type="button"
		>
			<MovieCardContent movie={props.movie} />
		</button>
	);
}
