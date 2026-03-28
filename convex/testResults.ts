import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getByAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    return await ctx.db
      .query("test_results")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .order("desc")
      .collect();
  },
});

export const getByAthleteAndTest = query({
  args: {
    athleteId: v.id("athletes"),
    testId: v.id("dyush_tests"),
  },
  handler: async (ctx, { athleteId, testId }) => {
    return await ctx.db
      .query("test_results")
      .withIndex("by_athlete_test", (q) =>
        q.eq("athleteId", athleteId).eq("testId", testId)
      )
      .order("asc") // хронологічно для графіка
      .collect();
  },
});

export const getLatestByAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    // Повертає останній результат по кожному тесту
    const all = await ctx.db
      .query("test_results")
      .withIndex("by_athlete", (q) => q.eq("athleteId", athleteId))
      .order("desc")
      .collect();

    // Групуємо по testId, беремо перший (найновіший)
    const latestByTest = new Map<string, typeof all[0]>();
    for (const result of all) {
      if (!latestByTest.has(result.testId)) {
        latestByTest.set(result.testId, result);
      }
    }
    return Array.from(latestByTest.values());
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    athleteId: v.id("athletes"),
    testId: v.id("dyush_tests"),
    date: v.string(),
    value: v.number(),
    notes: v.optional(v.string()),
    testingContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Завантажуємо тест і спортсмена для розрахунку нормативу
    const test = await ctx.db.get(args.testId);
    const athlete = await ctx.db.get(args.athleteId);

    let normLevel: "excellent" | "good" | "satisfactory" | "below_norm" =
      "below_norm";
    let normPercent: number | undefined;

    if (test && athlete) {
      // Визначаємо вікову групу
      const birthYear = new Date(athlete.dateOfBirth).getFullYear();
      const testYear = new Date(args.date).getFullYear();
      const age = testYear - birthYear;
      const ageGroup =
        age <= 12 ? "U12" :
        age <= 14 ? "U14" :
        age <= 16 ? "U16" :
        age <= 18 ? "U18" : "U20+";

      const norm = test.norms.find(
        (n) => n.ageGroup === ageGroup && n.gender === athlete.gender
      );

      if (norm) {
        // Для часових тестів: менше = краще
        if (test.lowerIsBetter) {
          normPercent = (norm.good / args.value) * 100;
          if (args.value <= norm.excellent) normLevel = "excellent";
          else if (args.value <= norm.good) normLevel = "good";
          else if (args.value <= norm.satisfactory) normLevel = "satisfactory";
          else normLevel = "below_norm";
        } else {
          normPercent = (args.value / norm.good) * 100;
          if (args.value >= norm.excellent) normLevel = "excellent";
          else if (args.value >= norm.good) normLevel = "good";
          else if (args.value >= norm.satisfactory) normLevel = "satisfactory";
          else normLevel = "below_norm";
        }
      }
    }

    return await ctx.db.insert("test_results", {
      ...args,
      normLevel,
      normPercent,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("test_results") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
