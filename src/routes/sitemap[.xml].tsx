import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/sitemap.xml")({
	loader: async ({ context }) => {
		// Get all movies for dynamic URLs
		const movies = await context.queryClient.fetchQuery(
			convexQuery(api.movies.getMoviesByCreatedAt, { limit: 1000 })
		);
		return { movies: movies.movies };
	},
	component: () => null,
	beforeLoad: ({ loaderData }) => {
		const baseUrl = "https://saejemock.choyongjoon.workers.dev";
		const today = new Date().toISOString().split("T")[0];

		// Static pages
		const staticUrls = [
			{ loc: baseUrl, priority: "1.0", changefreq: "daily" },
			{ loc: `${baseUrl}/movie/search`, priority: "0.9", changefreq: "daily" },
			{
				loc: `${baseUrl}/movies/popular`,
				priority: "0.8",
				changefreq: "daily",
			},
			{
				loc: `${baseUrl}/movies/trending`,
				priority: "0.8",
				changefreq: "daily",
			},
			{ loc: `${baseUrl}/movies/recent`, priority: "0.8", changefreq: "daily" },
			{ loc: `${baseUrl}/privacy`, priority: "0.3", changefreq: "monthly" },
		];

		// Dynamic movie pages
		const movieUrls = loaderData.movies.map((movie: any) => ({
			loc: `${baseUrl}/movie/${movie.shortId}`,
			priority: "0.7",
			changefreq: "weekly",
			lastmod: new Date(movie._creationTime).toISOString().split("T")[0],
		}));

		const allUrls = [...staticUrls, ...movieUrls];

		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;

		// Return XML response
		throw new Response(xml, {
			status: 200,
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=3600",
			},
		});
	},
});
