import { MyTitleSuggestions } from "./MyTitleSuggestions";
import { MyVotedSuggestions } from "./MyVotedSuggestions";

export function HistoryTab() {
	return (
		<div className="space-y-8">
			<section>
				<h2 className="mb-4 font-bold text-xl">제안한 제목</h2>
				<MyTitleSuggestions />
			</section>
			<section>
				<h2 className="mb-4 font-bold text-xl">투표한 제목</h2>
				<MyVotedSuggestions />
			</section>
		</div>
	);
}
