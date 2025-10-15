import { Search } from "lucide-react";
import type { SearchType } from "../../types/movie";

type SearchFormProps = {
	searchQuery: string;
	searchType: SearchType;
	isLoading: boolean;
	onSearchQueryChange: (query: string) => void;
	onSearchTypeChange: (type: SearchType) => void;
	onSubmit: (e: React.FormEvent) => void;
};

export function SearchForm({
	searchQuery,
	searchType,
	isLoading,
	onSearchQueryChange,
	onSearchTypeChange,
	onSubmit,
}: SearchFormProps) {
	return (
		<form className="mx-auto max-w-2xl" onSubmit={onSubmit}>
			{/* Search Type Selector */}
			<div className="mb-4 flex justify-center gap-2">
				<button
					className={`btn btn-sm ${searchType === "title" ? "btn-primary" : "btn-ghost"}`}
					onClick={() => onSearchTypeChange("title")}
					type="button"
				>
					제목
				</button>
				<button
					className={`btn btn-sm ${searchType === "director" ? "btn-primary" : "btn-ghost"}`}
					onClick={() => onSearchTypeChange("director")}
					type="button"
				>
					감독
				</button>
			</div>

			{/* Search Input */}
			<div className="join w-full">
				<input
					className="input input-bordered join-item flex-1"
					disabled={isLoading}
					onChange={(e) => onSearchQueryChange(e.target.value)}
					placeholder={
						searchType === "director"
							? "감독 이름을 입력하세요"
							: "영화 제목을 입력하세요 (한글 또는 영어)"
					}
					type="text"
					value={searchQuery}
				/>
				<button
					className="btn btn-primary join-item"
					disabled={isLoading}
					type="submit"
				>
					<Search className="h-4 w-4" />
					검색
				</button>
			</div>
		</form>
	);
}
