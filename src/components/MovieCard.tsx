import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";

type Movie = {
	_id: string;
	_creationTime: number;
	shortId: string;
	originalTitle: string;
	koreanTitle?: string;
	posterUrl?: string;
	releasedYear?: number;
	viewCount: number;
	createdAt: number;
};

type MovieCardProps = {
	movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
	return (
		<Link
			className="card bg-base-200 transition-all hover:shadow-xl"
			params={{ shortId: movie.shortId }}
			to="/movie/$shortId"
		>
			{/* Poster */}
			<figure className="aspect-[2/3]">
				{movie.posterUrl ? (
					<img
						alt={movie.koreanTitle || movie.originalTitle}
						className="h-full w-full object-cover"
						height="450"
						src={movie.posterUrl}
						width="300"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-base-300">
						<Film className="h-24 w-24 text-base-content opacity-20" />
					</div>
				)}
			</figure>

			{/* Content */}
			<div className="card-body p-2">
				{/* Korean Title (Main) */}
				<h3 className="card-title line-clamp-2 text-sm">
					{movie.koreanTitle || movie.originalTitle}
				</h3>

				{/* Original Title (Subtitle) - only show if different from Korean title */}
				{movie.koreanTitle && (
					<p className="line-clamp-2 text-xs opacity-xs60">
						{movie.originalTitle}
					</p>
				)}

				{/* Released Year */}
				{movie.releasedYear && (
					<p className="text-xs opacity-xs50">{movie.releasedYear}</p>
				)}
			</div>
		</Link>
	);
}
