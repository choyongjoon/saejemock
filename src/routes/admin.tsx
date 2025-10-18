import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
});

function AdminPage() {
	const { data: reports, refetch } = useQuery(
		convexQuery(api.reports.getPendingReports, {})
	);

	const approveMutation = useConvexMutation(
		api.moderation.approveReportAndRemove
	);
	const rejectMutation = useConvexMutation(api.moderation.rejectReport);

	const handleApprove = useMutation({
		mutationFn: async (reportId: Id<"reports">) => {
			await approveMutation({ reportId });
		},
		onSuccess: () => {
			refetch();
		},
	});

	const handleReject = useMutation({
		mutationFn: async (reportId: Id<"reports">) => {
			await rejectMutation({ reportId });
		},
		onSuccess: () => {
			refetch();
		},
	});

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-6 font-bold text-2xl">관리자 페이지</h1>

			<div className="overflow-x-auto">
				<table className="table">
					<thead>
						<tr>
							<th>영화</th>
							<th>신고된 제목</th>
							<th>신고 사유</th>
							<th>신고자</th>
							<th>신고 일시</th>
							<th>작업</th>
						</tr>
					</thead>
					<tbody>
						{reports?.map((report) => (
							<tr key={report._id}>
								<td>
									{report.movie && (
										<Link
											className="link"
											params={{ shortId: report.movie.shortId }}
											to="/movie/$shortId"
										>
											{report.movie.koreanTitle}
										</Link>
									)}
								</td>
								<td>{report.suggestion?.title}</td>
								<td className="max-w-xs truncate">{report.reason}</td>
								<td>{report.reporter?.name}</td>
								<td>{new Date(report.reportedAt).toLocaleDateString()}</td>
								<td>
									<div className="flex gap-2">
										<button
											className="btn btn-error btn-sm"
											disabled={
												handleApprove.isPending || handleReject.isPending
											}
											onClick={() => handleApprove.mutate(report._id)}
											type="button"
										>
											삭제
										</button>
										<button
											className="btn btn-ghost btn-sm"
											disabled={
												handleApprove.isPending || handleReject.isPending
											}
											onClick={() => handleReject.mutate(report._id)}
											type="button"
										>
											기각
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{!reports || reports.length === 0 ? (
					<div className="py-8 text-center text-base-content/60">
						대기 중인 신고가 없습니다.
					</div>
				) : null}
			</div>
		</div>
	);
}
