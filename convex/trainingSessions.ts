import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCoach, assertOwnsAthlete } from "./coaches";

const criteriaResultValidator = v.object({
  criterionId: v.string(),
  criterionName: v.string(),
  value: v.union(v.string(), v.number()),
  score: v.optional(v.number()),
});

// ─── Queries ────────────────────────────────────────────────────────────────

export const getByTraining = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    const coach = await requireCoach(ctx);
    const training = await ctx.db.get(trainingId);
    if (!training || training.coachId !== coach._id) {
      throw new Error("Training not found");
    }
    return await ctx.db
      .query("training_sessions")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
  },
});

export const getByAthlete = query({
  args: { athleteId: v.id("athletes"), limit: v.optional(v.number()) },
  handler: async (ctx, { athleteId, limit }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, athleteId, coach._id);
    const sessions = await ctx.db
      .query("training_sessions")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .order("desc")
      .collect();
    return limit ? sessions.slice(0, limit) : sessions;
  },
});

export const getByAthleteAndTraining = query({
  args: { athleteId: v.id("athletes"), trainingId: v.id("trainings") },
  handler: async (ctx, { athleteId, trainingId }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, athleteId, coach._id);
    return await ctx.db
      .query("training_sessions")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .filter((q) => q.eq(q.field("trainingId"), trainingId))
      .first();
  },
});

export const getByAthleteWithTraining = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, athleteId, coach._id);
    const sessions = await ctx.db
      .query("training_sessions")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .order("desc")
      .collect();

    // Збагачуємо інформацією про тренування
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const training = await ctx.db.get(session.trainingId);
        return { ...session, training };
      })
    );
    return enriched;
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    trainingId: v.id("trainings"),
    athleteId: v.id("athletes"),
    date: v.string(),
    criteriaResults: v.array(criteriaResultValidator),
    exerciseResults: v.array(
      v.object({
        exerciseId: v.string(),
        exerciseName: v.string(),
        criteriaResults: v.array(criteriaResultValidator),
      })
    ),
    overallScore: v.optional(v.number()),
    coachNotes: v.optional(v.string()),
    personalAdjustments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    await assertOwnsAthlete(ctx, args.athleteId, coach._id);
    const training = await ctx.db.get(args.trainingId);
    if (!training || training.coachId !== coach._id) {
      throw new Error("Training not found");
    }
    return await ctx.db.insert("training_sessions", args);
  },
});

export const updatePersonalAdjustments = mutation({
  args: {
    id: v.id("training_sessions"),
    personalAdjustments: v.string(),
    coachNotes: v.optional(v.string()),
  },
  handler: async (ctx, { id, personalAdjustments, coachNotes }) => {
    const coach = await requireCoach(ctx);
    const session = await ctx.db.get(id);
    if (!session) throw new Error("Training session not found");
    await assertOwnsAthlete(ctx, session.athleteId, coach._id);
    await ctx.db.patch(id, { personalAdjustments, coachNotes });
  },
});

export const remove = mutation({
  args: { id: v.id("training_sessions") },
  handler: async (ctx, { id }) => {
    const coach = await requireCoach(ctx);
    const session = await ctx.db.get(id);
    if (!session) throw new Error("Training session not found");
    await assertOwnsAthlete(ctx, session.athleteId, coach._id);
    await ctx.db.delete(id);
  },
});
