/* eslint-disable */
/**
 * Schema-aware stub for `convex/_generated/server`.
 *
 * `npx convex dev` / `npx convex deploy` regenerates this file with the real
 * runtime + types. We bind the builders to our schema here so local TypeScript
 * checks (e.g. CI's `tsc --noEmit`) catch ctx/args mismatches before deploy.
 */
import type {
  ActionBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  DataModelFromSchemaDefinition,
} from "convex/server";
import type schema from "../schema";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;

export declare const query: QueryBuilder<DataModel, "public">;
export declare const mutation: MutationBuilder<DataModel, "public">;
export declare const action: ActionBuilder<DataModel, "public">;
export declare const internalQuery: QueryBuilder<DataModel, "internal">;
export declare const internalMutation: MutationBuilder<DataModel, "internal">;
export declare const internalAction: ActionBuilder<DataModel, "internal">;
export declare const httpAction: HttpActionBuilder;

export { httpRouter } from "convex/server";
