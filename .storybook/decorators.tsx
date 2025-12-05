import { ClerkProvider } from "@clerk/clerk-react";
import type { Decorator } from "@storybook/react";

export const withClerk: Decorator = (Story) => (
	<ClerkProvider
		afterSignOutUrl="/"
		publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ""}
	>
		<Story />
	</ClerkProvider>
);
