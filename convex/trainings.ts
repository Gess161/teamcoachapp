import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireCoach } from "./coaches";

const exerciseCriterionValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  scale: v.string(),
  weight: v.number(),
});

const exerciseValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  sets: v.number(),
  reps: v.string(),
  restSeconds: v.number(),
  criteria: v.array(exerciseCriterionValidator),
});

async function assertOwnsTraining(
  ctx: QueryCtx | MutationCtx,
  id: Id<"trainings">,
  coachId: Id<"coaches">,
) {
  const training = await ctx.db.get(id);
  if (!training || training.coachId !== coachId) {
    throw new Error("Training not found");
  }
  return training;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    return await ctx.db
      .query("trainings")
      .withIndex("by_coach", (q) => q.eq("coachId", coach._id))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("trainings") },
  handler: async (ctx, { id }) => {
    const coach = await requireCoach(ctx);
    return await assertOwnsTraining(ctx, id, coach._id);
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const coach = await requireCoach(ctx);
    return await ctx.db
      .query("trainings")
      .withIndex("by_date", (q) => q.eq("date", date))
      .filter((q) => q.eq(q.field("coachId"), coach._id))
      .collect();
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, { status }) => {
    const coach = await requireCoach(ctx);
    return await ctx.db
      .query("trainings")
      .withIndex("by_status", (q) => q.eq("status", status))
      .filter((q) => q.eq(q.field("coachId"), coach._id))
      .order("desc")
      .collect();
  },
});

export const getByAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    const coach = await requireCoach(ctx);
    const all = await ctx.db
      .query("trainings")
      .withIndex("by_coach", (q) => q.eq("coachId", coach._id))
      .order("desc")
      .collect();
    return all.filter((t) => t.athleteIds.includes(athleteId));
  },
});

export const getUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const coach = await requireCoach(ctx);
    const today = new Date().toISOString().split("T")[0];
    const all = await ctx.db
      .query("trainings")
      .withIndex("by_status", (q) => q.eq("status", "planned"))
      .filter((q) => q.eq(q.field("coachId"), coach._id))
      .collect();
    const upcoming = all.filter((t) => t.date >= today);
    upcoming.sort((a, b) => a.date.localeCompare(b.date));
    return limit ? upcoming.slice(0, limit) : upcoming;
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("strength"),
      v.literal("speed"),
      v.literal("endurance"),
      v.literal("technique"),
      v.literal("recovery"),
      v.literal("mixed"),
      v.literal("tactical"),
      v.literal("competition"),
    ),
    preparationType: v.optional(
      v.union(
        v.literal("ЗФП"),
        v.literal("СФП"),
        v.literal("Технічна"),
        v.literal("Тактична"),
        v.literal("Психологічна"),
        v.literal("Теоретична"),
        v.literal("Змішана"),
      ),
    ),
    loadLevel: v.optional(
      v.union(v.literal("В"), v.literal("ЗН"), v.literal("С"), v.literal("М")),
    ),
    exercises: v.array(exerciseValidator),
    globalCriteria: v.array(exerciseCriterionValidator),
    athleteIds: v.array(v.id("athletes")),
    mesocycleId: v.optional(v.id("mesocycles")),
    durationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    return await ctx.db.insert("trainings", {
      ...args,
      coachId: coach._id,
      status: "planned",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("trainings"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("strength"),
        v.literal("speed"),
        v.literal("endurance"),
        v.literal("technique"),
        v.literal("recovery"),
        v.literal("mixed"),
        v.literal("tactical"),
        v.literal("competition"),
      ),
    ),
    preparationType: v.optional(
      v.union(
        v.literal("ЗФП"),
        v.literal("СФП"),
        v.literal("Технічна"),
        v.literal("Тактична"),
        v.literal("Психологічна"),
        v.literal("Теоретична"),
        v.literal("Змішана"),
      ),
    ),
    loadLevel: v.optional(
      v.union(v.literal("В"), v.literal("ЗН"), v.literal("С"), v.literal("М")),
    ),
    exercises: v.optional(v.array(exerciseValidator)),
    globalCriteria: v.optional(v.array(exerciseCriterionValidator)),
    athleteIds: v.optional(v.array(v.id("athletes"))),
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("in_progress"),
        v.literal("completed"),
      ),
    ),
    durationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsTraining(ctx, id, coach._id);
    await ctx.db.patch(id, fields);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("trainings"),
    status: v.union(
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, { id, status }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsTraining(ctx, id, coach._id);
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("trainings") },
  handler: async (ctx, { id }) => {
    const coach = await requireCoach(ctx);
    await assertOwnsTraining(ctx, id, coach._id);
    await ctx.db.delete(id);
  },
});
