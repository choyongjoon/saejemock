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
import type * as http from "../http.js";
import type * as kobis from "../kobis.js";
import type * as movies from "../movies.js";
import type * as seedMovies from "../seedMovies.js";
import type * as shortId from "../shortId.js";
import type * as testMovieTitle from "../testMovieTitle.js";
import type * as titleSuggestions from "../titleSuggestions.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  kobis: typeof kobis;
  movies: typeof movies;
  seedMovies: typeof seedMovies;
  shortId: typeof shortId;
  testMovieTitle: typeof testMovieTitle;
  titleSuggestions: typeof titleSuggestions;
  todos: typeof todos;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
