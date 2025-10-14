import type { Id } from "../../../convex/_generated/dataModel";
import { TitleSuggestions } from "./TitleSuggestions";

type TitleSuggestion = {
	_id: Id<"titleSuggestions">;
	_creationTime: number;
	movieId: Id<"movies">;
	title: string;
	description?: string;
	votesCount: number;
	createdAt: number;
	createdBy?: Id<"users">;
	isOfficial?: boolean;
};

type MovieInfoProps = {
	originalTitle: string;
	koreanTitle?: string;
	releaseDate?: string;
	titleSuggestions: TitleSuggestion[];
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

export function MovieInfo({
	originalTitle,
	koreanTitle,
	releaseDate,
	titleSuggestions,
}: MovieInfoProps) {
	const formattedDate = formatReleaseDate(releaseDate);

	return (
		<div>
			<h1 className="mb-2 font-bold text-3xl">{originalTitle}</h1>
			{koreanTitle && (
				<h2 className="mb-2 text-gray-600 text-xl">{koreanTitle}</h2>
			)}
			{formattedDate && (
				<p className="mb-6 text-gray-500 text-sm">개봉일: {formattedDate}</p>
			)}

			{/* Title Suggestions Section */}
			<div>
				<h3 className="mb-4 font-bold text-2xl">제목 제안</h3>
				<TitleSuggestions suggestions={titleSuggestions} />
			</div>
		</div>
	);
}
