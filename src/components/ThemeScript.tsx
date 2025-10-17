/**
 * Theme initialization script that runs before page render to prevent FOUC (Flash of Unstyled Content)
 * This must be a blocking script in the <head> to ensure theme is applied before first paint
 */
export function ThemeScript() {
	return (
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: This is a safe inline script for theme initialization that must run before React hydration to prevent flash of unstyled content
			dangerouslySetInnerHTML={{
				__html: `
					(function() {
						try {
							var theme = localStorage.getItem('theme') || 'black';
							if (theme === 'system') {
								var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
								document.documentElement.setAttribute('data-theme', prefersDark ? 'black' : 'lofi');
							} else {
								document.documentElement.setAttribute('data-theme', theme);
							}
						} catch (e) {
							document.documentElement.setAttribute('data-theme', 'black');
						}
					})();
				`,
			}}
		/>
	);
}
