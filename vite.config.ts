import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Split Clerk into separate chunk (~150KB)
					"vendor-clerk": ["@clerk/clerk-react"],
					// Split Convex into separate chunk (~100KB)
					"vendor-convex": ["convex/react", "@convex-dev/react-query"],
					// Split React Query into separate chunk (~50KB)
					"vendor-query": ["@tanstack/react-query"],
				},
			},
		},
	},
});

export default config;
