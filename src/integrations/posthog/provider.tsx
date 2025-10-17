import { PostHogProvider as RawPostHogProvider } from "posthog-js/react";
import type React from "react";

interface PosthogProviderProps {
	children: React.ReactNode;
}

const PosthogProvider: React.FC<PosthogProviderProps> = ({ children }) => (
	<RawPostHogProvider
		apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
		options={{
			api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
			defaults: "2025-05-24",
			capture_exceptions: true,
			debug: import.meta.env.MODE === "development",
		}}
	>
		{children}
	</RawPostHogProvider>
);

export default PosthogProvider;
