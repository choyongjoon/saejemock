import { useState } from "react";
import type { MovieInfo } from "@/types/movie";
import { LoginRequiredModal } from "../common/LoginRequiredModal";
import MovieCard from "../MovieCard";

type MovieResultCardProps = {
	movie: MovieInfo & { inDB: boolean };
	index: number;
	isAdding: boolean;
	disabled?: boolean;
	isSignedIn: boolean;
	onMovieClick: (movie: MovieInfo) => void;
};

export function MovieResultCard({
	movie,
	isAdding,
	disabled,
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
				disabled={disabled}
				isLoading={isAdding}
				mode="button"
				movie={movie}
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
