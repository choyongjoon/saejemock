import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Clapperboard, Settings } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "system" | "lofi" | "black";

export default function Header() {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === "undefined") {
			return "black";
		}
		const saved = localStorage.getItem("theme");
		return (saved as Theme) || "black";
	});

	useEffect(() => {
		const root = document.documentElement;

		if (theme === "system") {
			const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
			root.setAttribute("data-theme", prefersDark ? "black" : "lofi");
		} else {
			root.setAttribute("data-theme", theme);
		}

		localStorage.setItem("theme", theme);
	}, [theme]);

	const handleThemeChange = (newTheme: Theme) => {
		setTheme(newTheme);
	};

	return (
		<div className="navbar bg-base-200 px-4 shadow-lg">
			<div className="navbar-start">
				<Link className="btn btn-ghost px-0 text-xl" to="/">
					<Clapperboard className="h-6 w-6" />새 제목
				</Link>
			</div>

			<div className="navbar-end gap-2">
				<div className="dropdown dropdown-end">
					<button
						aria-label="설정"
						className="btn btn-ghost btn-sm"
						tabIndex={0}
						type="button"
					>
						<Settings className="h-5 w-5" />
					</button>
					<ul className="menu dropdown-content z-10 w-52 rounded-box bg-base-100 p-2 shadow">
						<li className="menu-title">테마</li>
						<li>
							<button
								className={theme === "system" ? "menu-active" : ""}
								onClick={() => handleThemeChange("system")}
								type="button"
							>
								기기 테마
							</button>
						</li>
						<li>
							<button
								className={theme === "lofi" ? "menu-active" : ""}
								onClick={() => handleThemeChange("lofi")}
								type="button"
							>
								밝은 테마
							</button>
						</li>
						<li>
							<button
								className={theme === "black" ? "menu-active" : ""}
								onClick={() => handleThemeChange("black")}
								type="button"
							>
								어두운 테마
							</button>
						</li>
					</ul>
				</div>

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
