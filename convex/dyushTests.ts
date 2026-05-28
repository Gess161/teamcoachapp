import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getAll = query({
  args: { sport: v.optional(v.string()) },
  handler: async (ctx, { sport }) => {
    if (sport) {
      return await ctx.db
        .query("dyush_tests")
        .withIndex("by_sport", (q) => q.eq("sport", sport))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    return await ctx.db
      .query("dyush_tests")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getByQuality = query({
  args: {
    physicalQuality: v.union(
      v.literal("strength"),
      v.literal("endurance"),
      v.literal("flexibility"),
      v.literal("coordination"),
      v.literal("speed")
    ),
  },
  handler: async (ctx, { physicalQuality }) => {
    return await ctx.db
      .query("dyush_tests")
      .withIndex("by_quality", (q) => q.eq("physicalQuality", physicalQuality))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// ─── Seed mutation (запускається один раз) ──────────────────────────────────
//
// Нормативи відповідають офіційній "Навчальній програмі з гандболу для ДЮСШ,
// СДЮШОР, ДЮСШ олімпійського резерву, шкіл вищої спортивної майстерності"
// (Київ, 2003), затвердженій Федерацією гандболу України.
//
// Вікові групи відповідають ДЮСШ-структурі:
//   "9-10"  — ГПП рік 1
//   "10-11" — ГПП рік 2
//   "11-12" — ГПБП рік 1
//   "12-13" — ГПБП рік 2
//   "13-14" — ГПБП рік 3
//   "14-15" — ГПБП рік 4
//   "15-16" — ГСБП рік 1
//   "16-17" — ГСБП рік 2
//   "17-18" — ГВД
//
// Джерела значень:
//   Табл. 25-26 (с. 97-99) — нормативи відбору для ГПП (9-11 р.)
//   Табл. 37 (с. 136-137)  — контрольні нормативи ГСБП (15-18 р.)
//   Проміжні значення      — лінійна інтерполяція між відомими точками.
//
// Структура нормативів (нorms):
//   excellent   — нижня межа діапазону (найкращий результат)
//   good        — середина діапазону
//   satisfactory— верхня межа (мінімально прийнятний результат)
//   Для "lowerIsBetter: true": excellent < good < satisfactory
//   Для "lowerIsBetter: false": excellent > good > satisfactory

export const seedHandballTests = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("dyush_tests")
      .withIndex("by_sport", (q) => q.eq("sport", "handball"))
      .collect();

    if (existing.length > 0) return { alreadySeeded: true };

    const handballTests = [

      // ══════════════════════════════════════════════════════════════════════
      // ── ШВИДКІСТЬ ─────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Біг 30м",
        description: "Біг на 30 метрів з високого старту. Менший час = кращий результат.",
        sport: "handball",
        physicalQuality: "speed" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          // Табл. 25: 9-10 р. діапазон 5.4-5.7 с; Табл. 26: 10-11 р. 5.1-5.5 с
          // Табл. 37: 15-16 р. 4.4-4.9 с; 17-18 р. 4.2-4.5 с
          { ageGroup: "9-10",  gender: "male" as const, excellent: 5.4, good: 5.5, satisfactory: 5.7 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 5.1, good: 5.3, satisfactory: 5.5 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 4.9, good: 5.1, satisfactory: 5.3 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 4.8, good: 4.9, satisfactory: 5.1 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 4.6, good: 4.8, satisfactory: 5.0 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 4.5, good: 4.7, satisfactory: 4.9 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 4.4, good: 4.6, satisfactory: 4.9 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 4.3, good: 4.4, satisfactory: 4.7 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 4.2, good: 4.3, satisfactory: 4.5 },
          // ── Дівчата ─────────────────────────────────────────────────────
          // Табл. 25: 9-10 р. діапазон ~6.0-6.8 с; Табл. 26: 10-11 р. 5.5-6.0 с
          // Табл. 37: 15-16 р. 4.9-5.2 с
          { ageGroup: "9-10",  gender: "female" as const, excellent: 6.0, good: 6.4, satisfactory: 6.8 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 5.5, good: 5.7, satisfactory: 6.0 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 5.3, good: 5.5, satisfactory: 5.8 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 5.2, good: 5.4, satisfactory: 5.6 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 5.1, good: 5.2, satisfactory: 5.5 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 5.0, good: 5.1, satisfactory: 5.3 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 4.9, good: 5.0, satisfactory: 5.2 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 4.8, good: 4.9, satisfactory: 5.1 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 4.7, good: 4.8, satisfactory: 5.0 },
        ],
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── СИЛА ──────────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Стрибок у довжину з місця",
        description: "Стрибок у довжину з місця (поштовх двома ногами). Більше = краще.",
        sport: "handball",
        physicalQuality: "strength" as const,
        unit: "см",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          // Табл. 25: 9-10 р. 130-160 см; Табл. 37: 15-16 р. 215-235 см; 17-18 р. 245-265 см
          { ageGroup: "9-10",  gender: "male" as const, excellent: 160, good: 145, satisfactory: 130 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 175, good: 160, satisfactory: 145 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 190, good: 173, satisfactory: 155 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 200, good: 183, satisfactory: 165 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 210, good: 193, satisfactory: 175 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 218, good: 200, satisfactory: 183 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 235, good: 225, satisfactory: 215 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 250, good: 240, satisfactory: 228 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 265, good: 255, satisfactory: 245 },
          // ── Дівчата ─────────────────────────────────────────────────────
          // Табл. 25: 9-10 р. 100-130 см; Табл. 37: 15-16 р. ~160-185 см
          { ageGroup: "9-10",  gender: "female" as const, excellent: 130, good: 115, satisfactory: 100 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 145, good: 130, satisfactory: 115 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 157, good: 142, satisfactory: 127 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 167, good: 152, satisfactory: 137 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 175, good: 160, satisfactory: 145 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 180, good: 165, satisfactory: 150 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 185, good: 173, satisfactory: 160 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 192, good: 180, satisfactory: 168 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 198, good: 187, satisfactory: 175 },
        ],
        isActive: true,
      },

      {
        name: "Підтягування на перекладині (хлопці)",
        description: "Підтягування з вису на перекладині, долонями від себе. Більше = краще.",
        sport: "handball",
        physicalQuality: "strength" as const,
        unit: "рази",
        lowerIsBetter: false,
        norms: [
          // Табл. 37: 15-16 р. 14-17 разів; 17-18 р. 17-20 разів
          { ageGroup: "9-10",  gender: "male" as const, excellent: 3,  good: 2,  satisfactory: 1  },
          { ageGroup: "10-11", gender: "male" as const, excellent: 5,  good: 3,  satisfactory: 2  },
          { ageGroup: "11-12", gender: "male" as const, excellent: 7,  good: 5,  satisfactory: 3  },
          { ageGroup: "12-13", gender: "male" as const, excellent: 9,  good: 7,  satisfactory: 5  },
          { ageGroup: "13-14", gender: "male" as const, excellent: 12, good: 9,  satisfactory: 7  },
          { ageGroup: "14-15", gender: "male" as const, excellent: 13, good: 11, satisfactory: 9  },
          { ageGroup: "15-16", gender: "male" as const, excellent: 17, good: 15, satisfactory: 14 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 19, good: 17, satisfactory: 15 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 20, good: 18, satisfactory: 17 },
        ],
        isActive: true,
      },

      {
        name: "Вис на зігнутих руках (дівчата)",
        description: "Вис на перекладині на зігнутих руках, підборіддя над перекладиною. Довше = краще.",
        sport: "handball",
        physicalQuality: "strength" as const,
        unit: "с",
        lowerIsBetter: false,
        norms: [
          { ageGroup: "9-10",  gender: "female" as const, excellent: 12, good: 8,  satisfactory: 5  },
          { ageGroup: "10-11", gender: "female" as const, excellent: 16, good: 11, satisfactory: 7  },
          { ageGroup: "11-12", gender: "female" as const, excellent: 20, good: 14, satisfactory: 9  },
          { ageGroup: "12-13", gender: "female" as const, excellent: 24, good: 17, satisfactory: 12 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 27, good: 20, satisfactory: 14 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 30, good: 23, satisfactory: 16 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 33, good: 26, satisfactory: 18 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 35, good: 28, satisfactory: 20 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 37, good: 30, satisfactory: 22 },
        ],
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── ВИТРИВАЛІСТЬ ──────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Прес за 30с",
        description: "Кількість підйомів тулуба з положення лежачи за 30 секунд. Більше = краще.",
        sport: "handball",
        physicalQuality: "endurance" as const,
        unit: "рази",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "male" as const, excellent: 18, good: 15, satisfactory: 12 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 20, good: 17, satisfactory: 14 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 22, good: 19, satisfactory: 15 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 25, good: 21, satisfactory: 17 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 27, good: 23, satisfactory: 19 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 29, good: 25, satisfactory: 21 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 30, good: 26, satisfactory: 22 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 31, good: 27, satisfactory: 23 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 32, good: 28, satisfactory: 24 },
          // ── Дівчата ─────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "female" as const, excellent: 16, good: 13, satisfactory: 10 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 18, good: 15, satisfactory: 12 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 20, good: 17, satisfactory: 13 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 22, good: 18, satisfactory: 15 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 24, good: 20, satisfactory: 16 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 26, good: 22, satisfactory: 18 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 27, good: 23, satisfactory: 19 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 28, good: 24, satisfactory: 20 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 29, good: 25, satisfactory: 21 },
        ],
        isActive: true,
      },

      {
        name: "Біг 1500м (хлопці)",
        description: "Біг на 1500 метрів. Менший час (в секундах) = кращий результат.",
        sport: "handball",
        physicalQuality: "endurance" as const,
        unit: "хв:с",
        lowerIsBetter: true,
        norms: [
          // Нормативи в секундах. Починаємо з 13-14 р. — до цього 1500м не практикується.
          { ageGroup: "13-14", gender: "male" as const, excellent: 360, good: 390, satisfactory: 420 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 345, good: 375, satisfactory: 405 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 330, good: 360, satisfactory: 395 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 318, good: 348, satisfactory: 383 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 305, good: 335, satisfactory: 370 },
        ],
        isActive: true,
      },

      {
        name: "Біг 1000м (дівчата)",
        description: "Біг на 1000 метрів. Менший час (в секундах) = кращий результат.",
        sport: "handball",
        physicalQuality: "endurance" as const,
        unit: "хв:с",
        lowerIsBetter: true,
        norms: [
          { ageGroup: "13-14", gender: "female" as const, excellent: 265, good: 290, satisfactory: 325 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 257, good: 282, satisfactory: 315 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 250, good: 275, satisfactory: 310 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 245, good: 270, satisfactory: 305 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 240, good: 265, satisfactory: 300 },
        ],
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── КООРДИНАЦІЯ ───────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Човниковий біг 4×9м",
        description: "Човниковий біг 4 рази по 9 метрів з торканням лінії. Менший час = кращий результат.",
        sport: "handball",
        physicalQuality: "coordination" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "male" as const, excellent: 10.2, good: 10.6, satisfactory: 11.2 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 9.8,  good: 10.2, satisfactory: 10.8 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 9.5,  good: 9.9,  satisfactory: 10.5 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 9.2,  good: 9.7,  satisfactory: 10.3 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 9.0,  good: 9.5,  satisfactory: 10.1 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 8.8,  good: 9.3,  satisfactory: 9.9  },
          { ageGroup: "15-16", gender: "male" as const, excellent: 8.7,  good: 9.2,  satisfactory: 9.8  },
          { ageGroup: "16-17", gender: "male" as const, excellent: 8.6,  good: 9.1,  satisfactory: 9.7  },
          { ageGroup: "17-18", gender: "male" as const, excellent: 8.5,  good: 9.0,  satisfactory: 9.6  },
          // ── Дівчата ─────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "female" as const, excellent: 10.6, good: 11.0, satisfactory: 11.6 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 10.2, good: 10.6, satisfactory: 11.2 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 9.8,  good: 10.3, satisfactory: 10.9 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 9.6,  good: 10.1, satisfactory: 10.7 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 9.4,  good: 9.9,  satisfactory: 10.5 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 9.3,  good: 9.8,  satisfactory: 10.4 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 9.2,  good: 9.7,  satisfactory: 10.3 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 9.1,  good: 9.6,  satisfactory: 10.2 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 9.0,  good: 9.5,  satisfactory: 10.1 },
        ],
        isActive: true,
      },

      {
        name: "Ведення м'яча 20м",
        description: "Ведення гандбольного м'яча на 20 метрів і назад (40м). Менший час = кращий результат.",
        sport: "handball",
        physicalQuality: "coordination" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "male" as const, excellent: 6.5, good: 7.2, satisfactory: 8.0 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 6.0, good: 6.7, satisfactory: 7.5 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 5.5, good: 6.1, satisfactory: 6.8 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 5.1, good: 5.7, satisfactory: 6.3 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 4.8, good: 5.3, satisfactory: 5.9 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 4.5, good: 5.0, satisfactory: 5.6 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 4.3, good: 4.8, satisfactory: 5.4 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 4.1, good: 4.6, satisfactory: 5.2 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 4.0, good: 4.5, satisfactory: 5.0 },
          // ── Дівчата ─────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "female" as const, excellent: 7.0, good: 7.7, satisfactory: 8.5 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 6.5, good: 7.2, satisfactory: 8.0 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 6.0, good: 6.7, satisfactory: 7.4 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 5.6, good: 6.2, satisfactory: 6.9 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 5.2, good: 5.8, satisfactory: 6.4 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 5.0, good: 5.5, satisfactory: 6.1 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 4.8, good: 5.3, satisfactory: 5.9 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 4.6, good: 5.1, satisfactory: 5.7 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 4.5, good: 5.0, satisfactory: 5.5 },
        ],
        isActive: true,
      },

      {
        name: "Передачі в парах за 30с",
        description: "Кількість передач м'яча у парі за 30 секунд з відстані 3 метри. Більше = краще.",
        sport: "handball",
        physicalQuality: "coordination" as const,
        unit: "рази",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "male" as const, excellent: 22, good: 18, satisfactory: 14 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 26, good: 22, satisfactory: 17 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 30, good: 25, satisfactory: 20 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 33, good: 28, satisfactory: 23 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 35, good: 30, satisfactory: 25 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 37, good: 32, satisfactory: 27 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 39, good: 34, satisfactory: 28 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 40, good: 35, satisfactory: 30 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 42, good: 37, satisfactory: 31 },
          // ── Дівчата ─────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "female" as const, excellent: 20, good: 16, satisfactory: 12 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 24, good: 20, satisfactory: 15 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 27, good: 23, satisfactory: 18 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 30, good: 25, satisfactory: 20 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 32, good: 27, satisfactory: 22 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 34, good: 29, satisfactory: 24 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 36, good: 31, satisfactory: 25 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 37, good: 32, satisfactory: 27 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 38, good: 33, satisfactory: 28 },
        ],
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── ГНУЧКІСТЬ ─────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Нахил вперед сидячи",
        description: "Нахил тулуба вперед сидячи з прямими ногами. Позитивне значення = за рівень стоп. Більше = краще.",
        sport: "handball",
        physicalQuality: "flexibility" as const,
        unit: "см",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          // Табл. 37: 15-16 р. 5-15 см; 17-18 р. 8-22 см
          { ageGroup: "9-10",  gender: "male" as const, excellent: 7,  good: 4,  satisfactory: 1  },
          { ageGroup: "10-11", gender: "male" as const, excellent: 8,  good: 5,  satisfactory: 2  },
          { ageGroup: "11-12", gender: "male" as const, excellent: 9,  good: 6,  satisfactory: 2  },
          { ageGroup: "12-13", gender: "male" as const, excellent: 10, good: 7,  satisfactory: 3  },
          { ageGroup: "13-14", gender: "male" as const, excellent: 11, good: 7,  satisfactory: 4  },
          { ageGroup: "14-15", gender: "male" as const, excellent: 13, good: 9,  satisfactory: 5  },
          { ageGroup: "15-16", gender: "male" as const, excellent: 15, good: 10, satisfactory: 5  },
          { ageGroup: "16-17", gender: "male" as const, excellent: 18, good: 13, satisfactory: 7  },
          { ageGroup: "17-18", gender: "male" as const, excellent: 22, good: 15, satisfactory: 8  },
          // ── Дівчата ─────────────────────────────────────────────────────
          // Дівчата, як правило, гнучкіші на 4-6 см
          { ageGroup: "9-10",  gender: "female" as const, excellent: 13, good: 9,  satisfactory: 5  },
          { ageGroup: "10-11", gender: "female" as const, excellent: 14, good: 10, satisfactory: 6  },
          { ageGroup: "11-12", gender: "female" as const, excellent: 15, good: 11, satisfactory: 6  },
          { ageGroup: "12-13", gender: "female" as const, excellent: 16, good: 12, satisfactory: 7  },
          { ageGroup: "13-14", gender: "female" as const, excellent: 17, good: 13, satisfactory: 8  },
          { ageGroup: "14-15", gender: "female" as const, excellent: 18, good: 14, satisfactory: 9  },
          { ageGroup: "15-16", gender: "female" as const, excellent: 20, good: 15, satisfactory: 10 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 22, good: 17, satisfactory: 11 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 24, good: 19, satisfactory: 13 },
        ],
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── ГАНДБОЛЬНІ СПЕЦИФІЧНІ ТЕСТИ ───────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        // Для груп ГПП (9-11 р.) — основний кидковий тест за програмою ДЮСШ.
        // Табл. 25 (добір 1-го року): хлопці 25-35 м, дівчата 15-25 м.
        // М'яч тенісний вагою 150 г (хлопці — 120 г за деякими таблицями).
        name: "Метання тенісного м'яча",
        description: "Метання тенісного м'яча (150г) з місця на дальність. Основний тест для груп ГПП. Більше = краще.",
        sport: "handball",
        physicalQuality: "strength" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          // Табл. 25: 9-10 р. 25-35 м; Табл. 26: 10-11 р. ~32-42 м (інтерполяція)
          { ageGroup: "9-10",  gender: "male" as const, excellent: 35, good: 30, satisfactory: 25 },
          { ageGroup: "10-11", gender: "male" as const, excellent: 42, good: 37, satisfactory: 32 },
          { ageGroup: "11-12", gender: "male" as const, excellent: 48, good: 43, satisfactory: 37 },
          // ── Дівчата ─────────────────────────────────────────────────────
          // Табл. 25: 9-10 р. 15-25 м
          { ageGroup: "9-10",  gender: "female" as const, excellent: 25, good: 20, satisfactory: 15 },
          { ageGroup: "10-11", gender: "female" as const, excellent: 30, good: 25, satisfactory: 19 },
          { ageGroup: "11-12", gender: "female" as const, excellent: 35, good: 29, satisfactory: 23 },
        ],
        isActive: true,
      },

      {
        // Для груп ГПБП і вище (11-12+) — кидок гандбольного м'яча на дальність.
        // Замінює тест метання тенісного м'яча для старших груп.
        name: "Кидок м'яча на дальність",
        description: "Кидок гандбольного м'яча з місця на дальність. Для груп ГПБП і вище. Більше = краще.",
        sport: "handball",
        physicalQuality: "strength" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          { ageGroup: "11-12", gender: "male" as const, excellent: 28, good: 23, satisfactory: 18 },
          { ageGroup: "12-13", gender: "male" as const, excellent: 33, good: 28, satisfactory: 22 },
          { ageGroup: "13-14", gender: "male" as const, excellent: 38, good: 33, satisfactory: 27 },
          { ageGroup: "14-15", gender: "male" as const, excellent: 43, good: 37, satisfactory: 31 },
          { ageGroup: "15-16", gender: "male" as const, excellent: 48, good: 42, satisfactory: 36 },
          { ageGroup: "16-17", gender: "male" as const, excellent: 53, good: 47, satisfactory: 40 },
          { ageGroup: "17-18", gender: "male" as const, excellent: 57, good: 51, satisfactory: 44 },
          // ── Дівчата ─────────────────────────────────────────────────────
          { ageGroup: "11-12", gender: "female" as const, excellent: 18, good: 14, satisfactory: 10 },
          { ageGroup: "12-13", gender: "female" as const, excellent: 22, good: 18, satisfactory: 13 },
          { ageGroup: "13-14", gender: "female" as const, excellent: 26, good: 21, satisfactory: 16 },
          { ageGroup: "14-15", gender: "female" as const, excellent: 29, good: 24, satisfactory: 19 },
          { ageGroup: "15-16", gender: "female" as const, excellent: 32, good: 27, satisfactory: 21 },
          { ageGroup: "16-17", gender: "female" as const, excellent: 35, good: 29, satisfactory: 23 },
          { ageGroup: "17-18", gender: "female" as const, excellent: 37, good: 31, satisfactory: 25 },
        ],
        isActive: true,
      },

      {
        name: "Влучність кидків у ворота (10 спроб)",
        description: "Кількість влучань у ворота з 9 метрів з 10 кидків. Більше = краще.",
        sport: "handball",
        physicalQuality: "coordination" as const,
        unit: "рази",
        lowerIsBetter: false,
        norms: [
          // ── Хлопці ──────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "male" as const, excellent: 6,  good: 4,  satisfactory: 2  },
          { ageGroup: "10-11", gender: "male" as const, excellent: 7,  good: 5,  satisfactory: 3  },
          { ageGroup: "11-12", gender: "male" as const, excellent: 7,  good: 6,  satisfactory: 4  },
          { ageGroup: "12-13", gender: "male" as const, excellent: 8,  good: 7,  satisfactory: 5  },
          { ageGroup: "13-14", gender: "male" as const, excellent: 8,  good: 7,  satisfactory: 5  },
          { ageGroup: "14-15", gender: "male" as const, excellent: 9,  good: 8,  satisfactory: 6  },
          { ageGroup: "15-16", gender: "male" as const, excellent: 9,  good: 8,  satisfactory: 6  },
          { ageGroup: "16-17", gender: "male" as const, excellent: 9,  good: 8,  satisfactory: 7  },
          { ageGroup: "17-18", gender: "male" as const, excellent: 10, good: 9,  satisfactory: 7  },
          // ── Дівчата ─────────────────────────────────────────────────────
          { ageGroup: "9-10",  gender: "female" as const, excellent: 5,  good: 3,  satisfactory: 2  },
          { ageGroup: "10-11", gender: "female" as const, excellent: 6,  good: 4,  satisfactory: 3  },
          { ageGroup: "11-12", gender: "female" as const, excellent: 7,  good: 5,  satisfactory: 3  },
          { ageGroup: "12-13", gender: "female" as const, excellent: 7,  good: 6,  satisfactory: 4  },
          { ageGroup: "13-14", gender: "female" as const, excellent: 8,  good: 7,  satisfactory: 5  },
          { ageGroup: "14-15", gender: "female" as const, excellent: 8,  good: 7,  satisfactory: 5  },
          { ageGroup: "15-16", gender: "female" as const, excellent: 9,  good: 7,  satisfactory: 6  },
          { ageGroup: "16-17", gender: "female" as const, excellent: 9,  good: 8,  satisfactory: 6  },
          { ageGroup: "17-18", gender: "female" as const, excellent: 10, good: 8,  satisfactory: 7  },
        ],
        isActive: true,
      },
    ];

    const insertedIds = [];
    for (const test of handballTests) {
      const id = await ctx.db.insert("dyush_tests", test);
      insertedIds.push(id);
    }

    return { seeded: insertedIds.length, ids: insertedIds };
  },
});

// ─── Helper: варіант А — excellent = наступний вік, satisfactory = попередній вік ──
// Якщо вікова межа — екстраполяція за трендом (2*current - neighbor)
function buildFootballNorms(
  rawData: Array<{ age: string; value: number }>
): Array<{
  ageGroup: string;
  gender: "male";
  excellent: number;
  good: number;
  satisfactory: number;
}> {
  return rawData.map((curr, i) => {
    const prev = rawData[i - 1];
    const next = rawData[i + 1];
    const r = (n: number) => Math.round(n * 100) / 100;
    const excellent = next ? next.value : r(2 * curr.value - prev!.value);
    const satisfactory = prev ? prev.value : r(2 * curr.value - next!.value);
    return { ageGroup: curr.age, gender: "male" as const, excellent, good: curr.value, satisfactory };
  });
}

// ─── Seed: футбол ДЮСШ ──────────────────────────────────────────────────────
//
// Джерело: Навчальна програма для ДЮСШ з футболу (Україна).
// Таблиця 9  (с. 40) — початкова підготовка, вік 6–10 р.
// Таблиця 20 (с. 55) — НТГ, вік 11–15 р.
// Таблиця 31 (с. 72) — ГСВ, вік 16–18 р.
// Таблиця 40 (с. 90) — ВСМ, вік 19–20 р.
//
// Оскільки джерельні таблиці дають одне еталонне значення на вік (без діапазону),
// застосовується Варіант А:
//   good         = табличне значення для цього віку
//   excellent    = значення наступного віку (кращий показник)
//   satisfactory = значення попереднього віку (ще прийнятний показник)
// Для крайніх вікових груп — лінійна екстраполяція за трендом сусідів.
//
// Статева приналежність: лише "male" (програма не диференціює за статтю).
// Вікові групи: окремі роки — "6", "7", ... "20".

export const seedFootballTests = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("dyush_tests")
      .withIndex("by_sport", (q) => q.eq("sport", "football"))
      .collect();

    if (existing.length > 0) return { alreadySeeded: true };

    const footballTests = [

      // ══════════════════════════════════════════════════════════════════════
      // ── ШВИДКІСТЬ ─────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Біг 15м з місця",
        description: "Біг на 15 метрів з місця (з місця старту). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "speed" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 3.40 },
          { age: "7",  value: 3.28 },
          { age: "8",  value: 3.09 },
          { age: "9",  value: 2.91 },
          { age: "10", value: 2.80 },
          // Табл. 20: вік 11-15
          { age: "11", value: 2.69 },
          { age: "12", value: 2.58 },
          { age: "13", value: 2.53 },
          { age: "14", value: 2.37 },
          { age: "15", value: 2.31 },
          // Табл. 31: вік 16-18
          { age: "16", value: 2.30 },
          { age: "17", value: 2.30 },
          { age: "18", value: 2.29 },
          // Табл. 40: вік 19-20
          { age: "19", value: 2.29 },
          { age: "20", value: 2.28 },
        ]),
        isActive: true,
      },

      {
        name: "Біг 15м з ходу",
        description: "Біг на 15 метрів з ходу (з розгону). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "speed" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          { age: "6",  value: 2.97 },
          { age: "7",  value: 2.88 },
          { age: "8",  value: 2.73 },
          { age: "9",  value: 2.47 },
          { age: "10", value: 2.27 },
          { age: "11", value: 2.26 },
          { age: "12", value: 2.17 },
          { age: "13", value: 2.09 },
          { age: "14", value: 1.89 },
          { age: "15", value: 1.83 },
          { age: "16", value: 1.82 },
          { age: "17", value: 1.80 },
          { age: "18", value: 1.80 },
          { age: "19", value: 1.80 },
          { age: "20", value: 1.78 },
        ]),
        isActive: true,
      },

      {
        name: "Біг 30м",
        description: "Біг на 30 метрів з високого старту. Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "speed" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          { age: "6",  value: 5.90 },
          { age: "7",  value: 5.80 },
          { age: "8",  value: 5.70 },
          { age: "9",  value: 5.50 },
          { age: "10", value: 5.40 },
          { age: "11", value: 5.30 },
          { age: "12", value: 5.10 },
          { age: "13", value: 4.80 },
          { age: "14", value: 4.60 },
          { age: "15", value: 4.40 },
          { age: "16", value: 4.30 },
          { age: "17", value: 4.20 },
          { age: "18", value: 4.10 },
          { age: "19", value: 4.10 },
          { age: "20", value: 4.00 },
        ]),
        isActive: true,
      },

      {
        name: "Біг 50м",
        description: "Біг на 50 метрів з високого старту. Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "speed" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 9.10 },
          { age: "7",  value: 9.00 },
          { age: "8",  value: 8.90 },
          { age: "9",  value: 8.80 },
          { age: "10", value: 8.70 },
          // Табл. 20: вік 11-15
          { age: "11", value: 8.6 },
          { age: "12", value: 8.5 },
          { age: "13", value: 8.4 },
          { age: "14", value: 8.2 },
          { age: "15", value: 8.0 },
          // Табл. 31: вік 16-18
          { age: "16", value: 7.8 },
          { age: "17", value: 7.2 },
          { age: "18", value: 6.9 },
        ]),
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── КООРДИНАЦІЯ ───────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Човниковий біг 30×10м",
        description: "Човниковий біг 30 разів по 10 метрів. Для груп початкової підготовки (вік 6-10). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "coordination" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 9: лише вік 6-10
          { age: "6",  value: 9.90 },
          { age: "7",  value: 9.60 },
          { age: "8",  value: 9.10 },
          { age: "9",  value: 8.80 },
          { age: "10", value: 8.60 },
        ]),
        isActive: true,
      },

      {
        name: "Човниковий біг 3×10м",
        description: "Човниковий біг 3 рази по 10 метрів з торканням лінії. Для НТГ та старших груп (вік 11+). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "coordination" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 20: вік 11-15
          { age: "11", value: 8.50 },
          { age: "12", value: 8.30 },
          { age: "13", value: 8.00 },
          { age: "14", value: 7.60 },
          { age: "15", value: 7.40 },
          // Табл. 31: вік 16-18
          { age: "16", value: 7.20 },
          { age: "17", value: 7.20 },
          { age: "18", value: 7.10 },
        ]),
        isActive: true,
      },

      {
        name: "Човниковий біг 7×50м",
        description: "Човниковий біг 7 разів по 50 метрів. Тест витривалості та швидкості (вік 13+). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "endurance" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 20: вік 13-15
          { age: "13", value: 69.0 },
          { age: "14", value: 68.0 },
          { age: "15", value: 66.0 },
          // Табл. 31: вік 16-18
          { age: "16", value: 64.0 },
          { age: "17", value: 62.0 },
          { age: "18", value: 61.0 },
          // Табл. 40: вік 19-20
          { age: "19", value: 60.0 },
          { age: "20", value: 59.0 },
        ]),
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── ВИТРИВАЛІСТЬ ──────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Біг 300м",
        description: "Біг на 300 метрів. Тест загальної витривалості для молодших груп (вік 8-12). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "endurance" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 9: вік 8-10
          { age: "8",  value: 63.0 },
          { age: "9",  value: 60.0 },
          { age: "10", value: 59.0 },
          // Табл. 20: вік 11-12
          { age: "11", value: 57.0 },
          { age: "12", value: 55.0 },
        ]),
        isActive: true,
      },

      {
        name: "Біг 400м",
        description: "Біг на 400 метрів. Тест загальної витривалості для старших груп (вік 16+). Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "endurance" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 31: вік 16-18
          { age: "16", value: 61.0 },
          { age: "17", value: 60.0 },
          { age: "18", value: 59.0 },
          // Табл. 40: вік 19-20
          { age: "19", value: 58.0 },
          { age: "20", value: 57.0 },
        ]),
        isActive: true,
      },

      {
        name: "12-хвилинний біг",
        description: "Тест Купера — максимальна відстань за 12 хвилин бігу. Для груп НТГ і старших (вік 13+). Більше = краще.",
        sport: "football",
        physicalQuality: "endurance" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 20: вік 13-15
          { age: "13", value: 2850 },
          { age: "14", value: 2950 },
          { age: "15", value: 3050 },
          // Табл. 31: вік 16-18
          { age: "16", value: 3100 },
          { age: "17", value: 3150 },
          { age: "18", value: 3200 },
          // Табл. 40: вік 19-20
          { age: "19", value: 3200 },
          { age: "20", value: 3200 },
        ]),
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── СИЛА ──────────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Стрибок у довжину з місця",
        description: "Стрибок у довжину з місця (поштовх двома ногами). Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "см",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 140 },
          { age: "7",  value: 150 },
          { age: "8",  value: 160 },
          { age: "9",  value: 170 },
          { age: "10", value: 180 },
          // Табл. 20: вік 11-15
          { age: "11", value: 190 },
          { age: "12", value: 200 },
          { age: "13", value: 210 },
          { age: "14", value: 230 },
          { age: "15", value: 240 },
          // Табл. 31: вік 16-18
          { age: "16", value: 250 },
          { age: "17", value: 260 },
          { age: "18", value: 270 },
        ]),
        isActive: true,
      },

      {
        name: "Потрійний стрибок",
        description: "Потрійний стрибок з місця (три послідовних стрибки). Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "см",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 310 },
          { age: "7",  value: 350 },
          { age: "8",  value: 380 },
          { age: "9",  value: 450 },
          { age: "10", value: 490 },
          // Табл. 20: вік 11-15
          { age: "11", value: 520 },
          { age: "12", value: 560 },
          { age: "13", value: 590 },
          { age: "14", value: 620 },
          { age: "15", value: 660 },
          // Табл. 31: вік 16-18
          { age: "16", value: 690 },
          { age: "17", value: 720 },
          { age: "18", value: 750 },
          // Табл. 40: вік 19-20
          { age: "19", value: 800 },
          { age: "20", value: 850 },
        ]),
        isActive: true,
      },

      {
        name: "5-кратний стрибок",
        description: "П'ять послідовних стрибків з місця. Для груп 8+ років. Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "см",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 8-10
          { age: "8",  value: 790 },
          { age: "9",  value: 820 },
          { age: "10", value: 840 },
          // Табл. 20: вік 11-15
          { age: "11", value: 910 },
          { age: "12", value: 950 },
          { age: "13", value: 1030 },
          { age: "14", value: 1160 },
          { age: "15", value: 1240 },
          // Табл. 31: вік 16-18
          { age: "16", value: 1270 },
          { age: "17", value: 1310 },
          { age: "18", value: 1350 },
          // Табл. 40: вік 19-20
          { age: "19", value: 1400 },
          { age: "20", value: 1450 },
        ]),
        isActive: true,
      },

      {
        name: "Стрибок угору з місця",
        description: "Стрибок угору з місця (вертикальний стрибок, поштовх двома ногами). Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "см",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 23 },
          { age: "7",  value: 26 },
          { age: "8",  value: 27 },
          { age: "9",  value: 29 },
          { age: "10", value: 32 },
          // Табл. 20: вік 11-15
          { age: "11", value: 34 },
          { age: "12", value: 36 },
          { age: "13", value: 38 },
          { age: "14", value: 40 },
          { age: "15", value: 43 },
          // Табл. 31: вік 16-18
          { age: "16", value: 47 },
          { age: "17", value: 50 },
          { age: "18", value: 52 },
          // Табл. 40: вік 19-20
          { age: "19", value: 55 },
          { age: "20", value: 59 },
        ]),
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── СПЕЦІАЛЬНА ФУТБОЛЬНА ПІДГОТОВКА — ПОЛЬОВІ ГРАВЦІ ─────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Біг 30м з веденням м'яча",
        description: "Біг на 30 метрів з веденням футбольного м'яча. Менший час = кращий результат.",
        sport: "football",
        physicalQuality: "coordination" as const,
        unit: "с",
        lowerIsBetter: true,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 9.00 },
          { age: "7",  value: 8.50 },
          { age: "8",  value: 7.50 },
          { age: "9",  value: 7.00 },
          { age: "10", value: 6.20 },
          // Табл. 20: вік 11-15
          { age: "11", value: 6.0 },
          { age: "12", value: 5.8 },
          { age: "13", value: 5.6 },
          { age: "14", value: 5.4 },
          { age: "15", value: 5.2 },
          // Табл. 31: вік 16-18
          { age: "16", value: 4.8 },
          { age: "17", value: 4.6 },
          { age: "18", value: 4.4 },
        ]),
        isActive: true,
      },

      {
        name: "Удар по м'ячу на дальність",
        description: "Удар по футбольному м'ячу ногою на дальність (для польових гравців). Більше = краще.",
        sport: "football",
        physicalQuality: "coordination" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 8-10
          { age: "8",  value: 25 },
          { age: "9",  value: 30 },
          { age: "10", value: 35 },
          // Табл. 20: вік 11-15
          { age: "11", value: 40 },
          { age: "12", value: 45 },
          { age: "13", value: 55 },
          { age: "14", value: 65 },
          { age: "15", value: 75 },
          // Табл. 31: вік 16-18
          { age: "16", value: 80 },
          { age: "17", value: 85 },
          { age: "18", value: 90 },
        ]),
        isActive: true,
      },

      {
        name: "Укидання м'яча на дальність",
        description: "Укидання футбольного м'яча руками з-за голови на дальність (аут). Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 6 },
          { age: "7",  value: 7 },
          { age: "8",  value: 8 },
          { age: "9",  value: 9 },
          { age: "10", value: 12 },
          // Табл. 20: вік 11-15
          { age: "11", value: 14 },
          { age: "12", value: 15 },
          { age: "13", value: 16 },
          { age: "14", value: 18 },
          { age: "15", value: 19 },
          // Табл. 31: вік 16-18
          { age: "16", value: 21 },
          { age: "17", value: 23 },
          { age: "18", value: 26 },
        ]),
        isActive: true,
      },

      {
        name: "Жонглювання м'ячем",
        description: "Кількість безперервних торкань м'яча ногами (жонглювання). Більше = краще.",
        sport: "football",
        physicalQuality: "coordination" as const,
        unit: "разів",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 9: вік 6-10
          { age: "6",  value: 6 },
          { age: "7",  value: 8 },
          { age: "8",  value: 10 },
          { age: "9",  value: 15 },
          { age: "10", value: 20 },
          // Табл. 20: вік 11-15
          { age: "11", value: 35 },
          { age: "12", value: 40 },
          { age: "13", value: 50 },
          { age: "14", value: 60 },
          { age: "15", value: 70 },
          // Табл. 31: вік 16-18
          { age: "16", value: 80 },
          { age: "17", value: 90 },
          { age: "18", value: 100 },
        ]),
        isActive: true,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── СПЕЦІАЛЬНА ПІДГОТОВКА — ВОРОТАРІ ─────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      {
        name: "Удар по м'ячу з рук на дальність (воротарі)",
        description: "Удар по м'ячу з рук на дальність (специфічний тест для воротарів). Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 20: вік 11-15
          { age: "11", value: 25 },
          { age: "12", value: 30 },
          { age: "13", value: 35 },
          { age: "14", value: 40 },
          { age: "15", value: 45 },
          // Табл. 31: вік 16-18
          { age: "16", value: 50 },
          { age: "17", value: 55 },
          { age: "18", value: 60 },
        ]),
        isActive: true,
      },

      {
        name: "Кидок м'яча на дальність (воротарі)",
        description: "Кидок футбольного м'яча руками на дальність (специфічний тест для воротарів). Більше = краще.",
        sport: "football",
        physicalQuality: "strength" as const,
        unit: "м",
        lowerIsBetter: false,
        norms: buildFootballNorms([
          // Табл. 20: вік 11-15
          { age: "11", value: 14 },
          { age: "12", value: 16 },
          { age: "13", value: 20 },
          { age: "14", value: 24 },
          { age: "15", value: 26 },
          // Табл. 31: вік 16-18
          { age: "16", value: 30 },
          { age: "17", value: 32 },
          { age: "18", value: 34 },
        ]),
        isActive: true,
      },
    ];

    const insertedIds = [];
    for (const test of footballTests) {
      const id = await ctx.db.insert("dyush_tests", test);
      insertedIds.push(id);
    }

    return { seeded: insertedIds.length, ids: insertedIds };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    sport: v.string(),
    physicalQuality: v.union(
      v.literal("strength"),
      v.literal("endurance"),
      v.literal("flexibility"),
      v.literal("coordination"),
      v.literal("speed")
    ),
    unit: v.string(),
    lowerIsBetter: v.boolean(),
    norms: v.array(
      v.object({
        ageGroup: v.string(),
        gender: v.union(v.literal("male"), v.literal("female")),
        excellent: v.number(),
        good: v.number(),
        satisfactory: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dyush_tests", { ...args, isActive: true });
  },
});
