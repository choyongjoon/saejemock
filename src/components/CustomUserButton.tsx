import { useUser } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";

export function CustomUserButton() {
	const { user } = useUser();

	if (!user) {
		return null;
	}

	return (
		<Link
			aria-label="프로필"
			className="btn btn-circle btn-ghost"
			to="/profile"
		>
			{user.imageUrl ? (
				<img
					alt={user.fullName || "사용자"}
					className="h-8 w-8 rounded-full"
					height={32}
					src={user.imageUrl}
					width={32}
				/>
			) : (
				<User className="h-8 w-8" />
			)}
		</Link>
	);
}
