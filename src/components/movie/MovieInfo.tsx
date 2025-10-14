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
	titleSuggestions: TitleSuggestion[];
};

export function MovieInfo({
	originalTitle,
	koreanTitle,
	titleSuggestions,
}: MovieInfoProps) {
	return (
		<div className="md:col-span-2">
			<h1 className="mb-2 font-bold text-3xl">{originalTitle}</h1>
			{koreanTitle && (
				<h2 className="mb-6 text-gray-600 text-xl">{koreanTitle}</h2>
			)}

			{/* Title Suggestions Section */}
			<div>
				<h3 className="mb-4 font-bold text-2xl">제목 제안</h3>
				<TitleSuggestions suggestions={titleSuggestions} />
			</div>
		</div>
	);
}
