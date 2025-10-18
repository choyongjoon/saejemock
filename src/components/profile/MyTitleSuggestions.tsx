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
		<ul>
			{suggestions.map((item) => (
				<li className="list-row" key={item._id}>
					{item.movie && (
						<Link
							className="link link-hover text-sm underline opacity-70"
							params={{ shortId: item.movie.shortId }}
							to="/movie/$shortId"
						>
							{item.movie.koreanTitle}
							{item.movie.originalTitle && ` (${item.movie.originalTitle})`}
						</Link>
					)}
					<h3 className="font-bold text-lg">{item.title}</h3>
					{item.description && (
						<p className="text-sm opacity-70">{item.description}</p>
					)}
					<div className="flex justify-end">
						<span className="text-xs opacity-60">
							{new Date(item.createdAt).toLocaleDateString()}
						</span>
					</div>
				</li>
			))}
		</ul>
	);
}
