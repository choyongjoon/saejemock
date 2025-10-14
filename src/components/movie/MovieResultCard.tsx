import { useState } from "react";
import { LoginRequiredModal } from "../common/LoginRequiredModal";
import MovieCard from "../MovieCard";

export type MergedMovie = {
	source: "db" | "kobis";
	inDB: boolean;
	movieCd?: string;
	shortId?: string;
	koreanTitle: string;
	originalTitle: string;
	year?: string;
	directors?: string;
	additionalInfo?: string;
	posterUrl?: string;
};

type MovieResultCardProps = {
	movie: MergedMovie;
	index: number;
	isAdding: boolean;
	isSignedIn: boolean;
	onMovieClick: (movie: MergedMovie) => void;
};

export function MovieResultCard({
	movie,
	isAdding,
	isSignedIn,
	onMovieClick,
}: MovieResultCardProps) {
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	const handleCardClick = () => {
		// If movie is in DB, navigate to it
		if (movie.inDB) {
			onMovieClick(movie);
			return;
		}

		// If movie is not in DB and user is signed in, add it
		if (isSignedIn) {
			onMovieClick(movie);
			return;
		}

		// If movie is not in DB and user is not signed in, show modal
		setIsLoginModalOpen(true);
	};

	return (
		<>
			<MovieCard
				isLoading={isAdding}
				mode="button"
				movie={{
					koreanTitle: movie.koreanTitle,
					originalTitle: movie.originalTitle,
					year: movie.year,
					directors: movie.directors,
					additionalInfo: movie.additionalInfo,
				}}
				onClick={handleCardClick}
			/>

			<LoginRequiredModal
				isOpen={isLoginModalOpen}
				message="이 영화를 추가하려면 로그인이 필요합니다."
				onClose={() => setIsLoginModalOpen(false)}
			/>
		</>
	);
}
