import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdminUserId, generateMagicLinkToken } from "./lib/auth";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const add = mutation({
  args: {
    workshopId: v.id("workshops"),
    email: v.string(),
    name: v.optional(v.union(v.string(), v.null())),
    role: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const workshop = await ctx.db.get(args.workshopId);
    if (!workshop) throw new Error("Workshop not found");
    if (workshop.adminUserId !== userId) throw new Error("Not authorized");
    if (workshop.status === "deleted") {
      throw new Error("Cannot add participants to a deleted workshop");
    }

    const email = args.email.trim().toLowerCase();
    if (!isValidEmail(email)) throw new Error(`Invalid email: ${args.email}`);

    const existing = await ctx.db
      .query("participants")
      .withIndex("by_workshop", (q) => q.eq("workshopId", args.workshopId))
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (existing) {
      throw new Error(`${email} is already a participant in this workshop`);
    }

    const token = generateMagicLinkToken();
    const tokenCollision = await ctx.db
      .query("participants")
      .withIndex("by_token", (q) => q.eq("magicLinkToken", token))
      .first();
    if (tokenCollision) {
      throw new Error("Token collision; please retry");
    }

    const now = Date.now();
    const isLaunched = workshop.status === "phase1_active";

    const cleanName =
      args.name == null ? null : args.name.trim().length === 0 ? null : args.name.trim();
    const cleanRole =
      args.role == null ? null : args.role.trim().length === 0 ? null : args.role.trim();

    const participantId = await ctx.db.insert("participants", {
      workshopId: args.workshopId,
      email,
      name: cleanName,
      role: cleanRole,
      magicLinkToken: token,
      magicLinkExpiresAt: isLaunched ? now + THIRTY_DAYS_MS : null,
      invitedAt: null,
      createdAt: now,
    });

    await ctx.db.insert("events", {
      workshopId: args.workshopId,
      actorType: "admin",
      actorId: userId,
      eventType: "participant.added",
      payload: { email, addedAfterLaunch: isLaunched },
      timestamp: now,
    });

    return participantId;
  },
});

export const remove = mutation({
  args: { id: v.id("participants") },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const participant = await ctx.db.get(args.id);
    if (!participant) throw new Error("Participant not found");
    const workshop = await ctx.db.get(participant.workshopId);
    if (!workshop) throw new Error("Workshop not found");
    if (workshop.adminUserId !== userId) throw new Error("Not authorized");
    if (workshop.status !== "draft") {
      throw new Error(
        "Removing participants from active workshops is not supported in M2",
      );
    }

    await ctx.db.delete(args.id);

    await ctx.db.insert("events", {
      workshopId: participant.workshopId,
      actorType: "admin",
      actorId: userId,
      eventType: "participant.removed",
      payload: { email: participant.email },
      timestamp: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("participants"),
    patch: v.object({
      name: v.optional(v.union(v.string(), v.null())),
      role: v.optional(v.union(v.string(), v.null())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const participant = await ctx.db.get(args.id);
    if (!participant) throw new Error("Participant not found");
    const workshop = await ctx.db.get(participant.workshopId);
    if (!workshop) throw new Error("Workshop not found");
    if (workshop.adminUserId !== userId) throw new Error("Not authorized");
    if (workshop.status === "deleted") {
      throw new Error("Cannot edit participants in a deleted workshop");
    }

    const cleanPatch: Record<string, unknown> = {};
    if (args.patch.name !== undefined) {
      cleanPatch.name =
        args.patch.name == null
          ? null
          : args.patch.name.trim().length === 0
            ? null
            : args.patch.name.trim();
    }
    if (args.patch.role !== undefined) {
      cleanPatch.role =
        args.patch.role == null
          ? null
          : args.patch.role.trim().length === 0
            ? null
            : args.patch.role.trim();
    }
    if (Object.keys(cleanPatch).length === 0) return;

    await ctx.db.patch(args.id, cleanPatch);
  },
});
