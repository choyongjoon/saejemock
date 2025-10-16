import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";

export default function Header() {
	return (
		<div className="navbar bg-base-200 shadow-lg">
			<div className="navbar-start">
				<Link className="btn btn-ghost text-xl" to="/">
					<Clapperboard className="h-6 w-6" />새 제목
				</Link>
			</div>

			<div className="navbar-end gap-2">
				<Link className="btn btn-primary btn-sm" to="/movie/search">
					영화 찾기
				</Link>

				<SignedIn>
					<UserButton
						appearance={{
							elements: {
								avatarBox: "w-10 h-10",
							},
						}}
					/>
				</SignedIn>
				<SignedOut>
					<SignInButton mode="modal">
						<button className="btn btn-ghost btn-sm" type="button">
							로그인
						</button>
					</SignInButton>
				</SignedOut>
			</div>
		</div>
	);
}
