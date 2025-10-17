import { TableAggregate } from "@convex-dev/aggregate";
import type { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";

// Aggregate for movies sorted by view count (descending)
// Using negative value to sort in descending order
export const moviesByViewCount = new TableAggregate<{
	Key: number;
	DataModel: DataModel;
	TableName: "movies";
}>(components.aggregate, {
	sortKey: (movie) => -movie.viewCount,
});

// Aggregate for movies sorted by creation date (descending)
// Using negative value to sort in descending order
export const moviesByCreatedAt = new TableAggregate<{
	Key: number;
	DataModel: DataModel;
	TableName: "movies";
}>(components.aggregate, {
	sortKey: (movie) => -movie.createdAt,
});
