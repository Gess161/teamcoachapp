import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

// ─── Queries ────────────────────────────────────────────────────────────────

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trainings").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("trainings") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("trainings")
      .withIndex("by_date", (q) => q.eq("date", date))
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
    return await ctx.db
      .query("trainings")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

export const getByAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    const all = await ctx.db.query("trainings").order("desc").collect();
    return all.filter((t) => t.athleteIds.includes(athleteId));
  },
});

export const getUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const today = new Date().toISOString().split("T")[0];
    const all = await ctx.db
      .query("trainings")
      .withIndex("by_status", (q) => q.eq("status", "planned"))
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
    coachId: v.optional(v.id("coaches")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trainings", {
      ...args,
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
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("trainings") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
