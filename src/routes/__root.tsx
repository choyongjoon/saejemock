import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";
import PosthogProvider from "../integrations/posthog/provider";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "새 제목",
			},
			{
				name: "description",
				content:
					"맘에 안 드는 영화 제목을 고쳐보세요. 영화 제목을 투표하고 새로운 제목을 제안할 수 있습니다.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<script
					async
					crossOrigin="anonymous"
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8760826937840724"
				/>
			</head>
			<body>
				<PosthogProvider>
					<ClerkProvider>
						<ConvexProvider>
							<Header />
							<div className="mx-auto max-w-4xl">{children}</div>
							<Footer />
							{/*<TanStackDevtools
								config={{
									position: "bottom-right",
								}}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
								]}
							/>*/}
						</ConvexProvider>
					</ClerkProvider>
				</PosthogProvider>
				<Scripts />
			</body>
		</html>
	);
}
