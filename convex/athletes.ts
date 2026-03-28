import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("athletes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("athletes") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getBySport = query({
  args: { sport: v.string() },
  handler: async (ctx, { sport }) => {
    return await ctx.db
      .query("athletes")
      .withIndex("by_sport", (q) => q.eq("sport", sport))
      .filter((q) => q.eq(q.field("isActive"), true))
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
    coachId: v.optional(v.id("coaches")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("athletes", {
      ...args,
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
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("athletes") },
  handler: async (ctx, { id }) => {
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
    await ctx.db.patch(id, { currentCyclePhase, macroCycleId });
  },
});
