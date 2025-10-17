import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// Aggregate for movies sorted by view count (descending)
// Using negative value to sort in descending order
export const moviesByViewCount = new TableAggregate<{
	Key: number;
	DataModel: DataModel;
	TableName: "movies";
}>(components.aggregateByViewCount, {
	sortKey: (movie) => -movie.viewCount,
});

// Aggregate for movies sorted by total votes (descending)
// Using negative value to sort in descending order
export const moviesByTotalVotes = new TableAggregate<{
	Key: number;
	DataModel: DataModel;
	TableName: "movies";
}>(components.aggregateByTotalVotes, {
	sortKey: (movie) => -movie.totalVotes,
});

// Aggregate for movies sorted by creation date (descending)
// Using negative value to sort in descending order
export const moviesByCreatedAt = new TableAggregate<{
	Key: number;
	DataModel: DataModel;
	TableName: "movies";
}>(components.aggregateByCreatedAt, {
	sortKey: (movie) => -movie.createdAt,
});
