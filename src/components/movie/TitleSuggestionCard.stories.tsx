import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { TitleSuggestionCard } from "./TitleSuggestionCard";

const meta = {
	title: "Components/Movie/TitleSuggestionCard",
	component: TitleSuggestionCard,
	parameters: {
		layout: "padded",
		mockData: [
			{
				url: "@clerk/clerk-react",
				method: "useUser",
				response: {
					isSignedIn: true,
					user: { id: "user123" },
					isLoaded: true,
				},
			},
		],
	},
	tags: ["autodocs"],
	args: {
		onVote: fn(),
		onCancelVote: fn(),
		onDelete: fn(),
	},
	decorators: [
		(StoryComponent) => (
			<div className="max-w-2xl">
				<ul className="list">
					<StoryComponent />
				</ul>
			</div>
		),
	],
} satisfies Meta<typeof TitleSuggestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base suggestion data
const baseSuggestion = {
	_id: "suggestion123" as const,
	title: "The Dark Knight",
	votesCount: 42,
};

export const Default: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			description: "A thrilling superhero movie about Batman facing the Joker",
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: "user123" as const,
	},
};

export const WithLongDescription: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			title: "Inception",
			description:
				"A skilled thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO. This complex narrative explores layers of dreams within dreams, questioning the nature of reality itself and the power of ideas. Christopher Nolan's masterpiece blends action with philosophical depth.",
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: "user123" as const,
	},
};

export const HasVoted: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			description: "User has voted for this suggestion",
		},
		index: 0,
		hasVoted: true,
		userHasVotedInMovie: true,
		currentUserId: "user123" as const,
	},
};

export const VotedForOther: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			description: "User has voted for another suggestion",
		},
		index: 1,
		hasVoted: false,
		userHasVotedInMovie: true,
		currentUserId: "user123" as const,
	},
};

export const OfficialSuggestion: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			title: "Official Title",
			description: "This is an official suggestion from the platform",
			isOfficial: true,
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: "user123" as const,
	},
};

export const CreatedByCurrentUser: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			description: "This suggestion was created by the current user",
			createdBy: "user123" as const,
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: "user123" as const,
	},
};

export const NotSignedIn: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			description: "User is not signed in",
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: undefined,
	},
};

export const HighVoteCount: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			votesCount: 1337,
			description: "This suggestion has many votes",
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: "user123" as const,
	},
};

export const WithoutDescription: Story = {
	args: {
		suggestion: {
			...baseSuggestion,
			description: undefined,
		},
		index: 0,
		hasVoted: false,
		userHasVotedInMovie: false,
		currentUserId: "user123" as const,
	},
};
