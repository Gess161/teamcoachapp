/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as athletes from "../athletes.js";
import type * as dyushTests from "../dyushTests.js";
import type * as macrocycles from "../macrocycles.js";
import type * as readinessScores from "../readinessScores.js";
import type * as testResults from "../testResults.js";
import type * as trainingSessions from "../trainingSessions.js";
import type * as trainings from "../trainings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  athletes: typeof athletes;
  dyushTests: typeof dyushTests;
  macrocycles: typeof macrocycles;
  readinessScores: typeof readinessScores;
  testResults: typeof testResults;
  trainingSessions: typeof trainingSessions;
  trainings: typeof trainings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
