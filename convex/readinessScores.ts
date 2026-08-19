import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCoach, assertOwnsAthlete } from "./coaches";

export const getByAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, athleteId, coach._id);
    return await ctx.db
      .query("readiness_scores")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .order("desc")
      .collect();
  },
});

export const getLatestByAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, athleteId, coach._id);
    return await ctx.db
      .query("readiness_scores")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .order("desc")
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    const athletes = await ctx.db
      .query("athletes")
      .withIndex("by_coach", (q) => q.eq("coachId", coach._id))
      .collect();
    const athleteIds = new Set(athletes.map((a) => a._id));
    const all = await ctx.db.query("readiness_scores").order("desc").collect();
    return all.filter((s) => athleteIds.has(s.athleteId));
  },
});

export const create = mutation({
  args: {
    athleteId: v.id("athletes"),
    date: v.string(),
    physical: v.optional(v.number()),
    technical: v.optional(v.number()),
    tactical: v.optional(v.number()),
    psychological: v.optional(v.number()),
    functional: v.optional(v.number()),
    coordination: v.optional(v.number()),
    recovery: v.optional(v.number()),
    igs: v.optional(v.number()),
    coachNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, args.athleteId, coach._id);

    // Розраховуємо ІГС автоматично якщо є базові 4 компоненти
    let igs = args.igs;
    if (!igs && args.physical !== undefined && args.technical !== undefined &&
        args.tactical !== undefined && args.psychological !== undefined) {
      igs = Math.round(
        args.physical * 0.4 +
        args.technical * 0.25 +
        args.tactical * 0.2 +
        args.psychological * 0.15
      );
    }
    return await ctx.db.insert("readiness_scores", { ...args, igs });
  },
});

export const remove = mutation({
  args: { id: v.id("readiness_scores") },
  handler: async (ctx, { id }) => {
    const coach = await requireCoach(ctx);
    const score = await ctx.db.get(id);
    if (!score) throw new Error("Readiness score not found");
    await assertOwnsAthlete(ctx, score.athleteId, coach._id);
    await ctx.db.delete(id);
  },
});
