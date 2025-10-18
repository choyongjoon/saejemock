import { useState } from "react";
import { MyTitleSuggestions } from "./MyTitleSuggestions";
import { MyVotedSuggestions } from "./MyVotedSuggestions";

type HistorySubTab = "suggestions" | "votes";

export function HistoryTab() {
	const [activeSubTab, setActiveSubTab] =
		useState<HistorySubTab>("suggestions");

	return (
		<div>
			<div className="mb-6">
				<div className="tabs tabs-boxed">
					<button
						className={`tab ${activeSubTab === "suggestions" ? "tab-active" : ""}`}
						onClick={() => setActiveSubTab("suggestions")}
						type="button"
					>
						제안
					</button>
					<button
						className={`tab ${activeSubTab === "votes" ? "tab-active" : ""}`}
						onClick={() => setActiveSubTab("votes")}
						type="button"
					>
						투표
					</button>
				</div>
			</div>

			<div>
				{activeSubTab === "suggestions" && <MyTitleSuggestions />}
				{activeSubTab === "votes" && <MyVotedSuggestions />}
			</div>
		</div>
	);
}
