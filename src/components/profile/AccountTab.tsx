import { SignOutButton, UserProfile } from "@clerk/clerk-react";
import { LogOut } from "lucide-react";

export function AccountTab() {
	return (
		<div className="space-y-6">
			{/* 로그아웃 버튼 */}
			<SignOutButton>
				<button className="btn btn-outline" type="button">
					<LogOut className="h-4 w-4" />
					로그아웃
				</button>
			</SignOutButton>

			{/* UserProfile */}
			<UserProfile />
		</div>
	);
}
