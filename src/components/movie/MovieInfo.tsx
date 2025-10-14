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
	year?: string;
	directors?: string;
	additionalInfo?: string;
	titleSuggestions: TitleSuggestion[];
};

export function MovieInfo({
	originalTitle,
	koreanTitle,
	year,
	directors,
	additionalInfo,
	titleSuggestions,
}: MovieInfoProps) {
	return (
		<div>
			<h1 className="mb-2 font-bold text-3xl">{koreanTitle}</h1>
			{koreanTitle && (
				<h2 className="mb-2 text-xl opacity-80">{originalTitle}</h2>
			)}
			<div className="mb-6 flex flex-wrap gap-2 text-sm opacity-60">
				{year && <span>{year}년</span>}
				{directors && <span>• {directors}</span>}
				{additionalInfo && <span>• {additionalInfo}</span>}
			</div>

			{/* Title Suggestions Section */}
			<div className="mt-12">
				<h3 className="font-bold text-2xl">제목 제안</h3>
				<TitleSuggestions suggestions={titleSuggestions} />
			</div>
		</div>
	);
}
