import { useAuth } from "@clerk/clerk-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const convexQueryClient = new ConvexQueryClient(CONVEX_URL);
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});

convexQueryClient.connect(queryClient);

export default function AppConvexProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ConvexProviderWithClerk
			client={convexQueryClient.convexClient}
			useAuth={useAuth}
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ConvexProviderWithClerk>
	);
}
