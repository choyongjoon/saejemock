import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "../../../convex/_generated/api";

export function MyVotedSuggestions() {
	const { data: votes, isLoading } = useQuery(
		convexQuery(api.titleSuggestions.getMyVotedSuggestions, {})
	);

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	if (!votes || votes.length === 0) {
		return (
			<div className="py-8 text-center text-base-content/60">
				아직 투표한 제목이 없습니다.
			</div>
		);
	}

	return (
		<ul>
			{votes.map((vote) => (
				<li className="list-row" key={vote._id}>
					{vote.suggestion.movie && (
						<Link
							className="link link-hover text-sm underline opacity-70"
							params={{ shortId: vote.suggestion.movie.shortId }}
							to="/movie/$shortId"
						>
							{vote.suggestion.movie.koreanTitle}
							{vote.suggestion.movie.originalTitle &&
								` (${vote.suggestion.movie.originalTitle})`}
						</Link>
					)}
					<h3 className="font-bold text-lg">{vote.suggestion.title}</h3>
					{vote.suggestion.description && (
						<p className="text-sm opacity-70">{vote.suggestion.description}</p>
					)}
					<div className="flex justify-end">
						<span className="text-xs opacity-60">
							{new Date(vote.createdAt).toLocaleDateString()}
						</span>
					</div>
				</li>
			))}
		</ul>
	);
}
