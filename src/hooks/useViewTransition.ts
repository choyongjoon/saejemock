import { useCallback } from "react";

/**
 * Hook to use the View Transitions API
 * Falls back to immediate execution if not supported
 */
export function useViewTransition() {
	const startTransition = useCallback((callback: () => void) => {
		// Check if View Transitions API is supported
		if (
			"startViewTransition" in document &&
			typeof document.startViewTransition === "function"
		) {
			document.startViewTransition(callback);
		} else {
			// Fallback: execute immediately without transition
			callback();
		}
	}, []);

	return { startTransition };
}
