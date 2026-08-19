import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCoach, assertOwnsAthlete } from "./coaches";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    return await ctx.db
      .query("athletes")
      .withIndex("by_coach", (q) => q.eq("coachId", coach._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("athletes") },
  handler: async (ctx, { id }) => {
    const coach = await requireCoach(ctx);
    return await assertOwnsAthlete(ctx, id, coach._id);
  },
});

export const getBySport = query({
  args: { sport: v.string() },
  handler: async (ctx, { sport }) => {
    const coach = await requireCoach(ctx);
    return await ctx.db
      .query("athletes")
      .withIndex("by_sport", (q) => q.eq("sport", sport))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("coachId"), coach._id),
        ),
      )
      .collect();
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    sport: v.string(),
    specialization: v.string(),
    qualification: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    height: v.number(),
    weight: v.number(),
    trainingAge: v.number(),
    currentCyclePhase: v.optional(
      v.union(
        v.literal("preparatory_general"),
        v.literal("preparatory_special"),
        v.literal("pre_competitive"),
        v.literal("competitive"),
        v.literal("restorative"),
        v.literal("transitional"),
      ),
    ),
    bestResult: v.optional(v.string()),
    targetResult: v.optional(v.string()),
    injuryNotes: v.optional(v.string()),
    personalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    return await ctx.db.insert("athletes", {
      ...args,
      coachId: coach._id,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("athletes"),
    name: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    sport: v.optional(v.string()),
    specialization: v.optional(v.string()),
    qualification: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    trainingAge: v.optional(v.number()),
    bestResult: v.optional(v.string()),
    targetResult: v.optional(v.string()),
    injuryNotes: v.optional(v.string()),
    personalNotes: v.optional(v.string()),
    currentCyclePhase: v.optional(
      v.union(
        v.literal("preparatory_general"),
        v.literal("preparatory_special"),
        v.literal("pre_competitive"),
        v.literal("competitive"),
        v.literal("restorative"),
        v.literal("transitional"),
      ),
    ),
    macroCycleId: v.optional(v.id("macrocycles")),
  },
  handler: async (ctx, { id, ...fields }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, id, coach._id);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("athletes") },
  handler: async (ctx, { id }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, id, coach._id);
    // М'яке видалення — просто деактивуємо
    await ctx.db.patch(id, { isActive: false });
  },
});

export const updatePersonalNotes = mutation({
  args: {
    id: v.id("athletes"),
    personalNotes: v.string(),
  },
  handler: async (ctx, { id, personalNotes }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, id, coach._id);
    await ctx.db.patch(id, { personalNotes });
  },
});

export const updateCyclePhase = mutation({
  args: {
    id: v.id("athletes"),
    currentCyclePhase: v.union(
      v.literal("preparatory_general"),
      v.literal("preparatory_special"),
      v.literal("pre_competitive"),
      v.literal("competitive"),
      v.literal("restorative"),
      v.literal("transitional"),
    ),
    macroCycleId: v.optional(v.id("macrocycles")),
  },
  handler: async (ctx, { id, currentCyclePhase, macroCycleId }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, id, coach._id);
    await ctx.db.patch(id, { currentCyclePhase, macroCycleId });
  },
});
