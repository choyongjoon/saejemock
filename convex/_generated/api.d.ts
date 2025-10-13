/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as movies from "../movies.js";
import type * as omdb from "../omdb.js";
import type * as seedMovies from "../seedMovies.js";
import type * as shortId from "../shortId.js";
import type * as titleSuggestions from "../titleSuggestions.js";
import type * as todos from "../todos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  movies: typeof movies;
  omdb: typeof omdb;
  seedMovies: typeof seedMovies;
  shortId: typeof shortId;
  titleSuggestions: typeof titleSuggestions;
  todos: typeof todos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
