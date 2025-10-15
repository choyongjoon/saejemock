import { Link } from "@tanstack/react-router";

export default function Footer() {
	return (
		<footer className="footer footer-center bg-base-200 p-10 text-base-content">
			<nav className="grid grid-flow-col gap-4">
				<Link className="link-hover link" to="/privacy">
					개인정보처리방침
				</Link>
				<a className="link-hover link" href="mailto:saejemock@choyongjoon.com">
					의견 보내기
				</a>
				<a
					className="link-hover link"
					href="https://janjum.com"
					rel="noopener noreferrer"
					target="_blank"
				>
					잔점
				</a>
			</nav>
			<aside>
				<p>© {new Date().getFullYear()} 새 제목. All rights reserved.</p>
			</aside>
		</footer>
	);
}
