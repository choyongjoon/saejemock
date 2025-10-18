import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AccountTab } from "../components/profile/AccountTab";
import { HistoryTab } from "../components/profile/HistoryTab";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

type Tab = "history" | "account";

function ProfilePage() {
	const [activeTab, setActiveTab] = useState<Tab>("history");

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<div className="mb-6">
				<h1 className="font-bold text-2xl">프로필</h1>
			</div>

			<div className="mb-6">
				<div className="tabs tabs-boxed">
					<button
						className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
						onClick={() => setActiveTab("history")}
						type="button"
					>
						기록
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
				{activeTab === "history" && <HistoryTab />}
				{activeTab === "account" && <AccountTab />}
			</div>
		</div>
	);
}
