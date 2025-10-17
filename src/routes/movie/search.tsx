import { useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { Film } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { SearchForm } from "../../components/movie/SearchForm";
import { SearchResults } from "../../components/movie/SearchResults";
import { useMergedResults } from "../../hooks/useMergedResults";
import { useMovieSearch } from "../../hooks/useMovieSearch";
import type { MovieInfo, SearchType } from "../../types/movie";

const movieAddSearchSchema = z.object({
	q: z.string().optional(),
	type: z.enum(["title", "director"]).optional().default("title"),
});

export const Route = createFileRoute("/movie/search")({
	component: SearchMoviePage,
	validateSearch: movieAddSearchSchema,
});

function SearchMoviePage() {
	const { isSignedIn } = useUser();
	const navigate = useNavigate();
	const { q, type } = Route.useSearch();

	const [searchQuery, setSearchQuery] = useState(q || "");
	const [searchType, setSearchType] = useState<SearchType>(type || "title");
	const [debouncedQuery, setDebouncedQuery] = useState(q || "");
	const [debouncedType, setDebouncedType] = useState<SearchType>(
		type || "title"
	);
	const [addingMovieId, setAddingMovieId] = useState<string | null>(null);

	const { kobisResults, isSearchingKobis, errorMessage, performSearch } =
		useMovieSearch();

	const addMovieFromKobis = useAction(api.movies.addMovieFromKobis);

	// Search our DB
	const dbResults = useQuery(
		api.movies.searchMovies,
		debouncedQuery
			? { searchQuery: debouncedQuery, searchType: debouncedType }
			: "skip"
	);

	// Trigger search on mount if query param exists
	useEffect(() => {
		if (q?.trim()) {
			setDebouncedQuery(q.trim());
			setDebouncedType(type);
			performSearch(q.trim(), type);
		}
	}, [q, type, performSearch]);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		const query = searchQuery.trim();

		if (!query) {
			return;
		}

		// Update URL with search query and type
		await navigate({
			to: "/movie/search",
			search: { q: query, type: searchType },
			replace: true,
		});

		setDebouncedQuery(query);
		setDebouncedType(searchType);
		await performSearch(query, searchType);
	};

	const handleClear = () => {
		setSearchQuery("");
		setDebouncedQuery("");
		navigate({
			to: "/movie/search",
			search: {},
			replace: true,
		});
	};

	const handleMovieClick = async (movie: MovieInfo) => {
		if (movie.shortId) {
			// Navigate to existing movie
			await navigate({
				to: "/movie/$shortId",
				params: { shortId: movie.shortId },
			});
		} else if (movie.movieCd && isSignedIn) {
			// Add movie to DB
			setAddingMovieId(movie.movieCd);
			try {
				const result = await addMovieFromKobis({
					movieCd: movie.movieCd,
				});
				await navigate({
					to: "/movie/$shortId",
					params: { shortId: result.shortId },
				});
			} catch (error) {
				console.error("Failed to add movie:", error);
			} finally {
				setAddingMovieId(null);
			}
		}
	};

	// Merge results from DB and KOBIS
	const mergedResults = useMergedResults(dbResults, kobisResults);
	const isLoading =
		isSearchingKobis || (Boolean(debouncedQuery) && dbResults === undefined);

	return (
		<div className="min-h-screen bg-base-100">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 flex justify-center">
						<Film className="h-12 w-12 text-primary" />
					</div>
					<h1 className="mb-2 font-bold text-4xl">영화 검색</h1>
				</div>

				{/* Search Form */}
				<div className="mb-8">
					<SearchForm
						isLoading={isLoading}
						onClear={handleClear}
						onSearchQueryChange={setSearchQuery}
						onSearchTypeChange={setSearchType}
						onSubmit={handleSearch}
						searchQuery={searchQuery}
						searchType={searchType}
					/>
				</div>

				{/* Search Results */}
				<SearchResults
					addingMovieId={addingMovieId}
					debouncedQuery={debouncedQuery}
					errorMessage={errorMessage}
					isLoading={isLoading}
					isSignedIn={Boolean(isSignedIn)}
					mergedResults={mergedResults}
					onMovieClick={handleMovieClick}
				/>
			</div>
		</div>
	);
}
