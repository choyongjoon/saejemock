import type { Doc } from "convex/_generated/dataModel";

export type Movie = Doc<"movies">;

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
