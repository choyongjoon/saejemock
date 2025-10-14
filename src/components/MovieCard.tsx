import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";

type Movie = {
	_id: string;
	_creationTime: number;
	shortId: string;
	originalTitle: string;
	koreanTitle?: string;
	releaseDate?: string;
	viewCount: number;
	createdAt: number;
};

type MovieCardProps = {
	movie: Movie;
};

const KOBIS_DATE_LENGTH = 8;
const YEAR_START = 0;
const YEAR_END = 4;
const MONTH_START = 4;
const MONTH_END = 6;
const DAY_START = 6;

function formatReleaseDate(dateStr?: string): string | null {
	if (!dateStr) {
		return null;
	}

	// KOBIS format: YYYYMMDD (e.g., "20191030")
	if (dateStr.length === KOBIS_DATE_LENGTH) {
		const year = dateStr.slice(YEAR_START, YEAR_END);
		const month = dateStr.slice(MONTH_START, MONTH_END);
		const day = dateStr.slice(DAY_START);
		return `${year}.${month}.${day}`;
	}

	return dateStr;
}

export default function MovieCard({ movie }: MovieCardProps) {
	const formattedDate = formatReleaseDate(movie.releaseDate);

	return (
		<Link
			className="card bg-base-200 transition-all hover:shadow-xl"
			params={{ shortId: movie.shortId }}
			to="/movie/$shortId"
		>
			{/* Content */}
			<div className="card-body">
				{/* Korean Title (Main) */}
				<h3 className="card-title line-clamp-2 text-base">
					{movie.koreanTitle || movie.originalTitle}
				</h3>

				{/* Original Title (Subtitle) - only show if different from Korean title */}
				{movie.koreanTitle && (
					<p className="line-clamp-2 text-sm opacity-60">
						{movie.originalTitle}
					</p>
				)}

				{/* Release Date */}
				{formattedDate && (
					<div className="flex items-center gap-1 text-sm opacity-50">
						<Calendar className="h-4 w-4" />
						<span>{formattedDate}</span>
					</div>
				)}
			</div>
		</Link>
	);
}
