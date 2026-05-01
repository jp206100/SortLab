import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminUserId, DEFAULT_INVITE_TEMPLATE } from "./lib/auth";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const name = args.name.trim();
    if (name.length === 0) {
      throw new Error("Workshop name is required");
    }

    const now = Date.now();
    const workshopId = await ctx.db.insert("workshops", {
      name,
      description: args.description?.trim() || undefined,
      adminUserId: userId,
      status: "draft",
      anonymityMode: "anonymous",
      emailTemplates: { invite: DEFAULT_INVITE_TEMPLATE },
      phaseDeadlines: {},
      createdAt: now,
      launchedAt: null,
      deletedAt: null,
    });

    await ctx.db.insert("events", {
      workshopId,
      actorType: "admin",
      actorId: userId,
      eventType: "workshop.created",
      payload: { name },
      timestamp: now,
    });

    return workshopId;
  },
});

export const update = mutation({
  args: {
    id: v.id("workshops"),
    patch: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      anonymityMode: v.optional(
        v.union(v.literal("anonymous"), v.literal("attributed")),
      ),
      emailTemplates: v.optional(
        v.object({
          invite: v.object({
            subject: v.string(),
            body: v.string(),
          }),
        }),
      ),
      phaseDeadlines: v.optional(
        v.object({ phase1: v.optional(v.number()) }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const workshop = await ctx.db.get(args.id);
    if (!workshop) throw new Error("Workshop not found");
    if (workshop.adminUserId !== userId) throw new Error("Not authorized");
    if (workshop.status === "deleted") {
      throw new Error("Cannot edit a deleted workshop");
    }

    const patch = args.patch;
    const isActive = workshop.status === "phase1_active";

    if (isActive) {
      if (patch.anonymityMode !== undefined) {
        throw new Error(
          "Anonymity mode is locked once a workshop has launched",
        );
      }
      if (patch.emailTemplates !== undefined) {
        throw new Error(
          "The invite template cannot be edited after launch (it has already been sent)",
        );
      }
    }

    const cleanPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) {
      const trimmed = patch.name.trim();
      if (trimmed.length === 0) throw new Error("Workshop name is required");
      cleanPatch.name = trimmed;
    }
    if (patch.description !== undefined) {
      const trimmed = patch.description.trim();
      cleanPatch.description = trimmed.length === 0 ? undefined : trimmed;
    }
    if (patch.anonymityMode !== undefined) {
      cleanPatch.anonymityMode = patch.anonymityMode;
    }
    if (patch.emailTemplates !== undefined) {
      cleanPatch.emailTemplates = patch.emailTemplates;
    }
    if (patch.phaseDeadlines !== undefined) {
      cleanPatch.phaseDeadlines = patch.phaseDeadlines;
    }

    if (Object.keys(cleanPatch).length === 0) return;

    await ctx.db.patch(args.id, cleanPatch);

    await ctx.db.insert("events", {
      workshopId: args.id,
      actorType: "admin",
      actorId: userId,
      eventType: "workshop.updated",
      payload: { fields: Object.keys(cleanPatch) },
      timestamp: Date.now(),
    });
  },
});

export const softDelete = mutation({
  args: { id: v.id("workshops") },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const workshop = await ctx.db.get(args.id);
    if (!workshop) throw new Error("Workshop not found");
    if (workshop.adminUserId !== userId) throw new Error("Not authorized");
    if (workshop.status === "deleted") return;

    const now = Date.now();
    await ctx.db.patch(args.id, { status: "deleted", deletedAt: now });
    await ctx.db.insert("events", {
      workshopId: args.id,
      actorType: "admin",
      actorId: userId,
      eventType: "workshop.deleted",
      payload: { previousStatus: workshop.status },
      timestamp: now,
    });
  },
});

export const listForAdmin = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const includeDeleted = args.includeDeleted ?? false;

    const workshops = await ctx.db
      .query("workshops")
      .withIndex("by_admin", (q) => q.eq("adminUserId", userId))
      .collect();

    const visible = includeDeleted
      ? workshops
      : workshops.filter((w) => w.status !== "deleted");

    const annotated = await Promise.all(
      visible.map(async (w) => {
        const participants = await ctx.db
          .query("participants")
          .withIndex("by_workshop", (q) => q.eq("workshopId", w._id))
          .collect();
        return { ...w, participantCount: participants.length };
      }),
    );

    annotated.sort((a, b) => b.createdAt - a.createdAt);
    return annotated;
  },
});

export const getForAdmin = query({
  args: { id: v.id("workshops") },
  handler: async (ctx, args) => {
    const userId = await requireAdminUserId(ctx);
    const workshop = await ctx.db.get(args.id);
    if (!workshop) return null;
    if (workshop.adminUserId !== userId) throw new Error("Not authorized");

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_workshop", (q) => q.eq("workshopId", workshop._id))
      .collect();

    return { workshop, participants };
  },
});
