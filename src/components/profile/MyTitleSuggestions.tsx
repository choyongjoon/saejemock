import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "../../../convex/_generated/api";

export function MyTitleSuggestions() {
	const { data: suggestions, isLoading } = useQuery(
		convexQuery(api.titleSuggestions.getMyTitleSuggestions, {})
	);

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	if (!suggestions || suggestions.length === 0) {
		return (
			<div className="py-8 text-center text-base-content/60">
				아직 제안한 제목이 없습니다.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{suggestions.map((item) => (
				<div className="card bg-base-200 shadow-sm" key={item._id}>
					<div className="card-body">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="card-title text-lg">{item.title}</h3>
								{item.movie && (
									<Link
										className="link link-hover text-sm opacity-70"
										params={{ shortId: item.movie.shortId }}
										to="/movie/$shortId"
									>
										{item.movie.koreanTitle}
										{item.movie.originalTitle &&
											` (${item.movie.originalTitle})`}
									</Link>
								)}
							</div>
							<div className="text-right">
								<div className="badge badge-primary">{item.votesCount}표</div>
								<div className="mt-1 text-xs opacity-60">
									{new Date(item.createdAt).toLocaleDateString()}
								</div>
							</div>
						</div>
						{item.description && (
							<p className="text-sm opacity-70">{item.description}</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
