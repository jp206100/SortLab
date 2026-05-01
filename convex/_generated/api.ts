/* eslint-disable */
/**
 * Schema-aware stub for `convex/_generated/api`.
 *
 * `npx convex dev` / `npx convex deploy` regenerates this file with real
 * runtime references. The stub provides:
 *   1. Type-safe FunctionReference exports derived from each Convex module's
 *      validators, so consumers get arg/return type checking before deploy.
 *   2. A null-returning Proxy at runtime so that components that read the
 *      stub (e.g. on a fresh checkout before `npx convex dev` runs) don't
 *      crash with import errors.
 */
import type * as hello from "../hello";
import type * as workshops from "../workshops";
import type * as participants from "../participants";
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

const stub: any = new Proxy(
  {},
  { get: () => new Proxy({}, { get: () => null }) },
);

declare const fullApi: ApiFromModules<{
  hello: typeof hello;
  workshops: typeof workshops;
  participants: typeof participants;
}>;

export const api = stub as FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export const internal = stub as FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
