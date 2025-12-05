import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import { withClerk } from "./decorators";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	decorators: [withClerk],
};

export default preview;
