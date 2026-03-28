import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    return await ctx.db
      .query("training_sessions")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
  },
});

export const getByAthlete = query({
  args: { athleteId: v.id("athletes"), limit: v.optional(v.number()) },
  handler: async (ctx, { athleteId, limit }) => {
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
    await ctx.db.patch(id, { personalAdjustments, coachNotes });
  },
});

export const remove = mutation({
  args: { id: v.id("training_sessions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
