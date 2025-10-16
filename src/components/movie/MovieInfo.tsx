import type { Movie } from "@/types/movie";

type MovieInfoProps = {
	movie: Movie;
};

export function MovieInfo({ movie }: MovieInfoProps) {
	return (
		<div>
			<h1 className="mb-2 font-bold text-3xl">{movie.koreanTitle}</h1>
			<h2 className="mb-2 text-xl opacity-80">
				{movie.originalTitle || movie.englishTitle}
			</h2>
			<div className="mb-6 flex flex-wrap gap-2 text-sm opacity-60">
				{movie.year && <span>{movie.year}년</span>}
				{movie.directors && <span>• {movie.directors}</span>}
				{movie.additionalInfo && <span>• {movie.additionalInfo}</span>}
			</div>
		</div>
	);
}
