import { Link } from "@tanstack/react-router";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	basePath: string;
};

export default function Pagination({
	currentPage,
	totalPages,
	basePath,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const getPageNumbers = () => {
		const pages: number[] = [];
		const showPages = 5; // Show 5 page numbers at a time
		const halfShow = Math.floor(showPages / 2);

		let startPage = Math.max(1, currentPage - halfShow);
		const endPage = Math.min(totalPages, startPage + showPages - 1);

		// Adjust start if we're near the end
		if (endPage - startPage < showPages - 1) {
			startPage = Math.max(1, endPage - showPages + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className="flex justify-center gap-2">
			<div className="join">
				{/* Previous Button */}
				{currentPage > 1 ? (
					<Link
						className="btn btn-sm join-item"
						search={{ page: currentPage - 1 }}
						to={basePath}
					>
						«
					</Link>
				) : (
					<button className="btn btn-disabled btn-sm join-item" type="button">
						«
					</button>
				)}

				{/* First page if not visible */}
				{pageNumbers[0] > 1 && (
					<>
						<Link
							className="btn btn-sm join-item"
							search={{ page: 1 }}
							to={basePath}
						>
							1
						</Link>
						{pageNumbers[0] > 2 && (
							<button
								className="btn btn-disabled btn-sm join-item"
								type="button"
							>
								...
							</button>
						)}
					</>
				)}

				{/* Page Numbers */}
				{pageNumbers.map((pageNum) => (
					<Link
						className={`btn btn-sm join-item ${
							pageNum === currentPage ? "btn-active" : ""
						}`}
						key={pageNum}
						search={{ page: pageNum }}
						to={basePath}
					>
						{pageNum}
					</Link>
				))}

				{/* Last page if not visible */}
				{pageNumbers.at(-1) < totalPages && (
					<>
						{pageNumbers.at(-1) < totalPages - 1 && (
							<button
								className="btn btn-disabled btn-sm join-item"
								type="button"
							>
								...
							</button>
						)}
						<Link
							className="btn btn-sm join-item"
							search={{ page: totalPages }}
							to={basePath}
						>
							{totalPages}
						</Link>
					</>
				)}

				{/* Next Button */}
				{currentPage < totalPages ? (
					<Link
						className="btn btn-sm join-item"
						search={{ page: currentPage + 1 }}
						to={basePath}
					>
						»
					</Link>
				) : (
					<button className="btn btn-disabled btn-sm join-item" type="button">
						»
					</button>
				)}
			</div>
		</div>
	);
}
