import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const phaseValidator = v.object({
  startDate: v.string(),
  endDate: v.string(),
  hoursPercent: v.number(),
});

// ─── Queries ────────────────────────────────────────────────────────────────

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("macrocycles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("macrocycles").order("desc").collect();
  },
});

export const getWithMesocycles = query({
  args: { id: v.id("macrocycles") },
  handler: async (ctx, { id }) => {
    const macro = await ctx.db.get(id);
    if (!macro) return null;
    const mesocycles = await ctx.db
      .query("mesocycles")
      .withIndex("by_macrocycle", (q) => q.eq("macroCycleId", id))
      .collect();
    return { ...macro, mesocycles };
  },
});

// Отримати поточну фазу для конкретного спортсмена
export const getCurrentPhaseForAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (ctx, { athleteId }) => {
    const athlete = await ctx.db.get(athleteId);
    if (!athlete?.macroCycleId) return null;

    const macro = await ctx.db.get(athlete.macroCycleId);
    if (!macro) return null;

    const today = new Date().toISOString().split("T")[0];

    // Визначаємо поточну фазу
    const { phases } = macro;
    let currentPhase = "transitional";
    let progressPercent = 0;

    if (today >= phases.preparatoryGeneral.startDate && today <= phases.preparatoryGeneral.endDate) {
      currentPhase = "preparatory_general";
      progressPercent = calcProgress(today, phases.preparatoryGeneral.startDate, phases.preparatoryGeneral.endDate);
    } else if (today >= phases.preparatorySpecial.startDate && today <= phases.preparatorySpecial.endDate) {
      currentPhase = "preparatory_special";
      progressPercent = calcProgress(today, phases.preparatorySpecial.startDate, phases.preparatorySpecial.endDate);
    } else if (today >= phases.competitive.startDate && today <= phases.competitive.endDate) {
      currentPhase = "competitive";
      progressPercent = calcProgress(today, phases.competitive.startDate, phases.competitive.endDate);
    } else if (today >= phases.transitional.startDate && today <= phases.transitional.endDate) {
      currentPhase = "transitional";
      progressPercent = calcProgress(today, phases.transitional.startDate, phases.transitional.endDate);
    }

    // Загальний прогрес по макроциклу
    const macroProgress = calcProgress(today, macro.startDate, macro.endDate);

    return {
      macrocycle: macro,
      currentPhase,
      progressPercent,
      macroProgress,
    };
  },
});

function calcProgress(today: string, start: string, end: string): number {
  const t = new Date(today).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (t <= s) return 0;
  if (t >= e) return 100;
  return Math.round(((t - s) / (e - s)) * 100);
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    sport: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    totalHoursPlanned: v.optional(v.number()),
    phases: v.object({
      preparatoryGeneral: phaseValidator,
      preparatorySpecial: phaseValidator,
      competitive: phaseValidator,
      transitional: phaseValidator,
    }),
    athleteIds: v.array(v.id("athletes")),
    coachId: v.optional(v.id("coaches")),
  },
  handler: async (ctx, args) => {
    // Деактивуємо попередній активний макроцикл
    const active = await ctx.db
      .query("macrocycles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    if (active) {
      await ctx.db.patch(active._id, { isActive: false });
    }
    return await ctx.db.insert("macrocycles", { ...args, isActive: true });
  },
});

export const addMesocycle = mutation({
  args: {
    macroCycleId: v.id("macrocycles"),
    name: v.string(),
    type: v.union(
      v.literal("ударний"),
      v.literal("відновний"),
      v.literal("змагальний"),
      v.literal("передзмагальний"),
      v.literal("стабілізуючий")
    ),
    startDate: v.string(),
    endDate: v.string(),
    weekCount: v.number(),
    targetLoadLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mesocycles", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("macrocycles"),
    name: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    totalHoursPlanned: v.optional(v.number()),
    phases: v.optional(v.object({
      preparatoryGeneral: phaseValidator,
      preparatorySpecial: phaseValidator,
      competitive: phaseValidator,
      transitional: phaseValidator,
    })),
    athleteIds: v.optional(v.array(v.id("athletes"))),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const deactivate = mutation({
  args: { id: v.id("macrocycles") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isActive: false });
  },
});
