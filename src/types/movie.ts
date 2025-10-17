import type { Doc } from "convex/_generated/dataModel";

export type Movie = Doc<"movies">;

export type MovieInfo = {
	movieCd?: string;
	shortId?: string;
	koreanTitle: string;
	englishTitle?: string;
	originalTitle?: string;
	year?: string;
	directors?: string;
	additionalInfo?: string;
};

export type SearchedMovieInfo = MovieInfo & {
	source: "db" | "kobis";
	inDB: boolean;
};

export type KobisMovie = {
	movieCd: string;
	movieNm: string;
	movieNmEn: string;
	prdtYear: string;
	openDt: string;
	directors: string;
	nationAlt: string;
	genreAlt: string;
};

export type SearchType = "title" | "director";
