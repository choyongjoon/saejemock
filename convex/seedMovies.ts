import { mutation } from "./_generated/server";

export const seedOneBattleAfterAnother = mutation({
	args: {},
	handler: async (ctx) => {
		// Check if movie already exists
		const existingMovie = await ctx.db
			.query("movies")
			.withIndex("by_shortId", (q) =>
				q.eq("shortId", "one-battle-after-another")
			)
			.first();

		if (existingMovie) {
			return {
				success: false,
				message: "Movie already exists",
				movieId: existingMovie._id,
			};
		}

		// Add the movie
		const movieId = await ctx.db.insert("movies", {
			shortId: "one-battle-after-another",
			originalTitle: "One Battle After Another",
			koreanTitle: "연이은 전투",
			posterUrl:
				"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
			imdbId: "tt0000000",
			imdbUrl: "https://www.imdb.com/title/tt0000000/",
			viewCount: 42,
			createdAt: Date.now(),
		});

		// Add sample title suggestions
		const suggestion1 = await ctx.db.insert("titleSuggestions", {
			movieId,
			title: "끝없는 전투",
			description:
				"원제의 'One Battle After Another'를 직역하면 '하나의 전투 후 또 다른'이지만, 연속되는 전투의 느낌을 잘 살린 제목입니다.",
			votesCount: 15,
			createdAt: Date.now(),
		});

		const suggestion2 = await ctx.db.insert("titleSuggestions", {
			movieId,
			title: "연전연승",
			description:
				"한국어 사자성어를 활용해 간결하면서도 강렬한 느낌을 줍니다. 단, 원제의 의미와는 약간 다를 수 있습니다.",
			votesCount: 8,
			createdAt: Date.now(),
		});

		const suggestion3 = await ctx.db.insert("titleSuggestions", {
			movieId,
			title: "싸움의 연속",
			description:
				"직관적이고 이해하기 쉬운 제목입니다. 영화의 내용을 명확하게 전달합니다.",
			votesCount: 3,
			createdAt: Date.now(),
		});

		return {
			success: true,
			movieId,
			suggestionIds: [suggestion1, suggestion2, suggestion3],
		};
	},
});
