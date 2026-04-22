import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Future tables (M3+): workshops, participants, cards, categories, placements, contentMapNodes
});
