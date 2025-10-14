import { ClerkProvider } from "@clerk/clerk-react";
import { koKR } from "@clerk/localizations";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env.local file");
}

export default function AppClerkProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider
			afterSignOutUrl="/"
			localization={koKR}
			publishableKey={PUBLISHABLE_KEY}
		>
			{children}
		</ClerkProvider>
	);
}
