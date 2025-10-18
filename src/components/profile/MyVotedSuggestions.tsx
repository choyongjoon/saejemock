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
		<div className="space-y-4">
			{votes.map((vote) => (
				<div className="card bg-base-200 shadow-sm" key={vote._id}>
					<div className="card-body">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="card-title text-lg">{vote.suggestion.title}</h3>
								{vote.suggestion.movie && (
									<Link
										className="link link-hover text-sm opacity-70"
										params={{ shortId: vote.suggestion.movie.shortId }}
										to="/movie/$shortId"
									>
										{vote.suggestion.movie.koreanTitle}
										{vote.suggestion.movie.originalTitle &&
											` (${vote.suggestion.movie.originalTitle})`}
									</Link>
								)}
							</div>
							<div className="text-right">
								<div className="badge badge-primary">
									{vote.suggestion.votesCount}표
								</div>
								<div className="mt-1 text-xs opacity-60">
									{new Date(vote.createdAt).toLocaleDateString()}
								</div>
							</div>
						</div>
						{vote.suggestion.description && (
							<p className="text-sm opacity-70">
								{vote.suggestion.description}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
