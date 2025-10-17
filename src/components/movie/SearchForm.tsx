import { Search, X } from "lucide-react";
import type { SearchType } from "../../types/movie";

type SearchFormProps = {
	searchQuery: string;
	searchType: SearchType;
	isLoading: boolean;
	onSearchQueryChange: (query: string) => void;
	onSearchTypeChange: (type: SearchType) => void;
	onClear: () => void;
	onSubmit: (e: React.FormEvent) => void;
};

export function SearchForm({
	searchQuery,
	searchType,
	isLoading,
	onSearchQueryChange,
	onSearchTypeChange,
	onClear,
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
				<div className="relative flex-1">
					<input
						autoFocus
						className="input input-bordered w-full pr-10"
						disabled={isLoading}
						onChange={(e) => onSearchQueryChange(e.target.value)}
						placeholder={
							searchType === "director"
								? "한국어 이름"
								: "한국어 제목 또는 원제목"
						}
						type="text"
						value={searchQuery}
					/>
					{searchQuery && (
						<button
							className="btn btn-circle btn-ghost absolute top-0 right-2"
							onClick={onClear}
							type="button"
						>
							<X className="h-6 w-6" />
						</button>
					)}
				</div>
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
