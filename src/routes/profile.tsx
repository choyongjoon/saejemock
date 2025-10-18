import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AccountTab } from "../components/profile/AccountTab";
import { MyTitleSuggestions } from "../components/profile/MyTitleSuggestions";
import { MyVotedSuggestions } from "../components/profile/MyVotedSuggestions";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

type Tab = "suggestions" | "votes" | "account";

function ProfilePage() {
	const [activeTab, setActiveTab] = useState<Tab>("suggestions");

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<div className="mb-6">
				<h1 className="font-bold text-2xl">프로필</h1>
			</div>

			<div className="mb-6">
				<div className="tabs tabs-border">
					<button
						className={`tab ${activeTab === "suggestions" ? "tab-active" : ""}`}
						onClick={() => setActiveTab("suggestions")}
						type="button"
					>
						제안
					</button>
					<button
						className={`tab ${activeTab === "votes" ? "tab-active" : ""}`}
						onClick={() => setActiveTab("votes")}
						type="button"
					>
						투표
					</button>
					<button
						className={`tab ${activeTab === "account" ? "tab-active" : ""}`}
						onClick={() => setActiveTab("account")}
						type="button"
					>
						계정
					</button>
				</div>
			</div>

			<div>
				{activeTab === "suggestions" && <MyTitleSuggestions />}
				{activeTab === "votes" && <MyVotedSuggestions />}
				{activeTab === "account" && <AccountTab />}
			</div>
		</div>
	);
}
