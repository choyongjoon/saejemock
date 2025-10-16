export type Movie = {
	_id: string;
	_creationTime: number;
	shortId: string;
	originalTitle: string;
	koreanTitle?: string;
	releaseDate?: string;
	kobisMovieCode?: string;
	viewCount: number;
	createdAt: number;
	totalVotes?: number;
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
