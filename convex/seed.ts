import { mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Admin-only: масове заведення реальних спортсменів для конкретного тренера
// (за email). Викликається один раз через `npx convex run`.
export const adminCreateAthletesForCoach = internalMutation({
  args: {
    coachEmail: v.string(),
    athletes: v.array(
      v.object({
        name: v.string(),
        dateOfBirth: v.string(),
        gender: v.union(v.literal("male"), v.literal("female")),
        sport: v.string(),
        specialization: v.string(),
        qualification: v.string(),
        height: v.number(),
        weight: v.number(),
        trainingAge: v.number(),
      }),
    ),
  },
  handler: async (ctx, { coachEmail, athletes }) => {
    const coach = await ctx.db
      .query("coaches")
      .withIndex("by_email", (q) => q.eq("email", coachEmail))
      .unique();
    if (!coach) throw new Error("Coach not found for this email");

    const ids = [];
    for (const a of athletes) {
      const id = await ctx.db.insert("athletes", {
        ...a,
        coachId: coach._id,
        isActive: true,
      });
      ids.push(id);
    }
    return ids;
  },
});

// Clears all user data (keeps dyush_tests reference library)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    for (const r of await ctx.db.query("training_sessions").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("test_results").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("readiness_scores").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("anthropometry").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("trainings").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("mesocycles").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("macrocycles").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("athletes").collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query("coaches").collect()) await ctx.db.delete(r._id);
    return { status: "cleared" };
  },
});

// Populates mock data for screenshots / demo
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("athletes").collect();
    if (existing.length > 0) return { status: "already_seeded", count: existing.length };

    // Ensure handball tests exist
    const testsCount = await ctx.db
      .query("dyush_tests")
      .withIndex("by_sport", (q) => q.eq("sport", "football"))
      .collect();
    if (testsCount.length === 0) {
      // Football tests should already be seeded; skip auto-seed for now
    }

    // ── 1. Coach ─────────────────────────────────────────────────────────────
    const coachId = await ctx.db.insert("coaches", {
      name: "Іваненко Олексій Петрович",
      email: "coach@athletepro.ua",
      sport: "football",
    });

    // ── 2. Athletes ───────────────────────────────────────────────────────────
    type CyclePhase =
      | "preparatory_general"
      | "preparatory_special"
      | "pre_competitive"
      | "competitive"
      | "restorative"
      | "transitional";

    const athleteDefs: Array<{
      name: string;
      dateOfBirth: string;
      specialization: string;
      qualification: string;
      height: number;
      weight: number;
      trainingAge: number;
      bestResult: string;
      targetResult: string;
      phase: CyclePhase;
    }> = [
      { name: "Коваленко Максим", dateOfBirth: "2009-03-15", specialization: "Лівий вінгер", qualification: "КМС", height: 174, weight: 68, trainingAge: 5, bestResult: "Чемпіонат обл., 2-е місце", targetResult: "МС виконати", phase: "competitive" },
      { name: "Бондаренко Олег", dateOfBirth: "2010-07-22", specialization: "Правий вінгер", qualification: "I розряд", height: 172, weight: 65, trainingAge: 4, bestResult: "Кубок міста, 3-є місце", targetResult: "КМС виконати", phase: "competitive" },
      { name: "Петренко Андрій", dateOfBirth: "2008-11-08", specialization: "Центральний нападник", qualification: "КМС", height: 180, weight: 76, trainingAge: 6, bestResult: "Фінал першості обл.", targetResult: "МС виконати", phase: "transitional" },
      { name: "Шевченко Дмитро", dateOfBirth: "2009-05-30", specialization: "Опорний півзахисник", qualification: "I розряд", height: 178, weight: 74, trainingAge: 5, bestResult: "Першість обл., 1-е місце", targetResult: "КМС виконати", phase: "competitive" },
      { name: "Мороз Ілля", dateOfBirth: "2010-02-14", specialization: "Атакувальний півзахисник", qualification: "II розряд", height: 171, weight: 63, trainingAge: 3, bestResult: "Першість міста, 2-е місце", targetResult: "I розряд виконати", phase: "pre_competitive" },
      { name: "Гриценко Артем", dateOfBirth: "2008-09-03", specialization: "Воротар", qualification: "МС", height: 186, weight: 82, trainingAge: 8, bestResult: "Чемп. України U18, бронза", targetResult: "Чемп. України, пʼєдестал", phase: "transitional" },
      { name: "Кравченко Сергій", dateOfBirth: "2009-12-19", specialization: "Правий захисник", qualification: "КМС", height: 177, weight: 72, trainingAge: 5, bestResult: "Кубок обл., 2-е місце", targetResult: "МС виконати", phase: "competitive" },
      { name: "Ткаченко Роман", dateOfBirth: "2010-04-07", specialization: "Центральний захисник", qualification: "I розряд", height: 181, weight: 78, trainingAge: 4, bestResult: "Першість обл., 3-є місце", targetResult: "КМС виконати", phase: "competitive" },
      { name: "Марченко Євген", dateOfBirth: "2011-08-25", specialization: "Лівий захисник", qualification: "II розряд", height: 170, weight: 62, trainingAge: 2, bestResult: "Першість міста, 4-е місце", targetResult: "I розряд виконати", phase: "preparatory_general" },
      { name: "Власенко Денис", dateOfBirth: "2009-01-11", specialization: "Центральний півзахисник", qualification: "КМС", height: 176, weight: 71, trainingAge: 6, bestResult: "Кубок обл., 1-е місце", targetResult: "МС виконати", phase: "competitive" },
    ];

    const athleteIds: Array<{ id: any; idx: number }> = [];
    for (let i = 0; i < athleteDefs.length; i++) {
      const a = athleteDefs[i];
      const id = await ctx.db.insert("athletes", {
        name: a.name,
        dateOfBirth: a.dateOfBirth,
        gender: "male",
        sport: "football",
        specialization: a.specialization,
        qualification: a.qualification,
        height: a.height,
        weight: a.weight,
        trainingAge: a.trainingAge,
        bestResult: a.bestResult,
        targetResult: a.targetResult,
        currentCyclePhase: a.phase,
        isActive: true,
        coachId,
      });
      athleteIds.push({ id, idx: i });
    }
    const allIds = athleteIds.map((a) => a.id);

    // ── 3. Macrocycle ─────────────────────────────────────────────────────────
    const macroId = await ctx.db.insert("macrocycles", {
      name: "2025–2026 Річний макроцикл",
      sport: "football",
      startDate: "2025-08-01",
      endDate: "2026-07-31",
      totalHoursPlanned: 480,
      phases: {
        preparatoryGeneral: { startDate: "2025-08-01", endDate: "2025-10-31", hoursPercent: 28 },
        preparatorySpecial: { startDate: "2025-11-01", endDate: "2026-01-31", hoursPercent: 27 },
        competitive: { startDate: "2026-02-01", endDate: "2026-06-30", hoursPercent: 40 },
        transitional: { startDate: "2026-07-01", endDate: "2026-07-31", hoursPercent: 5 },
      },
      athleteIds: allIds,
      coachId,
      isActive: true,
    });

    // ── 4. Mesocycles ─────────────────────────────────────────────────────────
    const mesoDefs = [
      { name: "Базовий мезоцикл I", type: "ударний" as const, start: "2025-08-01", end: "2025-08-28", weeks: 4, load: "С–ЗН" },
      { name: "Базовий мезоцикл II", type: "стабілізуючий" as const, start: "2025-09-01", end: "2025-09-26", weeks: 4, load: "ЗН" },
      { name: "Передзмагальний", type: "передзмагальний" as const, start: "2026-01-12", end: "2026-02-06", weeks: 4, load: "С–В" },
      { name: "Змагальний основний", type: "змагальний" as const, start: "2026-02-09", end: "2026-06-26", weeks: 20, load: "В–ЗН" },
    ];
    for (const m of mesoDefs) {
      await ctx.db.insert("mesocycles", {
        macroCycleId: macroId,
        name: m.name,
        type: m.type,
        startDate: m.start,
        endDate: m.end,
        weekCount: m.weeks,
        targetLoadLevel: m.load,
      });
    }

    // ── 5. Trainings ──────────────────────────────────────────────────────────
    type TrainingType = "strength" | "speed" | "endurance" | "technique" | "recovery" | "mixed" | "tactical" | "competition";
    type PrepType = "ЗФП" | "СФП" | "Технічна" | "Тактична" | "Психологічна" | "Теоретична" | "Змішана";
    type LoadLevel = "В" | "ЗН" | "С" | "М";
    type TrainingStatus = "planned" | "in_progress" | "completed";

    const ex = (name: string, sets: number, reps: string) => ({
      id: `ex-${name.slice(0, 4)}-${sets}`,
      name,
      sets,
      reps,
      restSeconds: 60,
      criteria: [{ id: `c-${name.slice(0, 4)}`, name: "Якість виконання", scale: "1-5", weight: 1 }],
    });

    const trainingDefs: Array<{
      date: string; name: string; type: TrainingType; prep: PrepType;
      load: LoadLevel; status: TrainingStatus; exercises: any[];
    }> = [
      // Jan
      { date: "2026-01-06", name: "ЗФП — базова витривалість", type: "endurance", prep: "ЗФП", load: "С", status: "completed", exercises: [ex("Крос 5 км", 1, "1 раз"), ex("Загальна розминка", 1, "15 хв"), ex("Силові кола", 3, "12 раз")] },
      { date: "2026-01-10", name: "СФП — спринти та прискорення", type: "speed", prep: "СФП", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Спринти 30 м", 6, "3 рази"), ex("Прискорення з кроком", 4, "5 раз")] },
      { date: "2026-01-14", name: "Технічна — передачі в парах", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Передачі в парах", 4, "30 с"), ex("Ведення мʼяча", 3, "20 м")] },
      { date: "2026-01-17", name: "ЗФП — силова підготовка", type: "strength", prep: "ЗФП", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Присідання", 4, "8 раз"), ex("Жим лежачи", 3, "10 раз")] },
      // Feb
      { date: "2026-02-03", name: "Тактична — атакувальні схеми", type: "tactical", prep: "Тактична", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Комбінації 2-1", 3, "10 раз"), ex("Стандарти зі штрафного", 2, "8 раз")] },
      { date: "2026-02-07", name: "Змішане тренування", type: "mixed", prep: "Змішана", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Удари по воротах", 4, "8 раз"), ex("Спринти", 3, "30 м")] },
      { date: "2026-02-10", name: "СФП — швидкісна витривалість", type: "endurance", prep: "СФП", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Човниковий біг 4×9", 5, "3 рази"), ex("Ривки 10×50 м", 1, "10 раз")] },
      { date: "2026-02-14", name: "Технічна — кидки з флангів", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Удари з лівого флангу", 4, "10 раз"), ex("Удари з правого флангу", 4, "10 раз")] },
      { date: "2026-02-18", name: "Тактична — захист 4-4-2", type: "tactical", prep: "Тактична", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Захисні пересування 6-0", 4, "5 хв"), ex("Пресинг", 3, "3 хв")] },
      // Mar
      { date: "2026-03-03", name: "ЗФП — кросовий біг", type: "endurance", prep: "ЗФП", load: "ЗН", status: "completed", exercises: [ex("Крос 8 км", 1, "1 раз"), ex("ЗРВ", 2, "15 хв")] },
      { date: "2026-03-07", name: "Змішане — двостороння гра", type: "mixed", prep: "Змішана", load: "В", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Двостороння гра", 1, "30 хв"), ex("Охолодження", 1, "5 хв")] },
      { date: "2026-03-10", name: "СФП — пліометрика", type: "strength", prep: "СФП", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Стрибки у довжину", 4, "8 раз"), ex("Пліометрика", 3, "10 раз")] },
      { date: "2026-03-14", name: "Технічна — ведення з перешкодами", type: "technique", prep: "Технічна", load: "М", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Ведення 20 м з перешкодами", 5, "5 раз"), ex("Передачі в русі", 3, "30 с")] },
      { date: "2026-03-17", name: "Тактична — контратаки", type: "tactical", prep: "Тактична", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Захист 4-4-2", 3, "10 хв"), ex("Контратаки", 4, "5 раз")] },
      { date: "2026-03-21", name: "Змішане — ігрові комплекси", type: "mixed", prep: "Змішана", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Комплексні вправи", 4, "5 хв"), ex("Гра 5×5", 2, "10 хв")] },
      // Apr
      { date: "2026-04-01", name: "СФП — інтервальний біг", type: "speed", prep: "СФП", load: "В", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Інтервальний біг", 8, "200 м"), ex("Прискорення 30 м", 10, "1 раз")] },
      { date: "2026-04-05", name: "Технічна — кидки в русі", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Кидки в русі", 5, "10 раз"), ex("Удар з пенальті", 3, "10 раз")] },
      { date: "2026-04-08", name: "Тактична — стандарти", type: "tactical", prep: "Тактична", load: "М", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Розігрування штрафних", 4, "8 раз"), ex("Вільні удари", 3, "8 раз")] },
      { date: "2026-04-12", name: "Змішане — контрольна гра", type: "mixed", prep: "Змішана", load: "В", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Контрольна гра", 1, "60 хв"), ex("Охолодження", 1, "10 хв")] },
      { date: "2026-04-15", name: "ЗФП — відновна", type: "recovery", prep: "ЗФП", load: "М", status: "completed", exercises: [ex("Легкий біг", 1, "20 хв"), ex("Стретчинг", 1, "15 хв")] },
      { date: "2026-04-19", name: "Технічна — індивідуальна", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Індивідуальні вправи", 4, "10 хв"), ex("Кидки з різних позицій", 3, "12 раз")] },
      { date: "2026-04-22", name: "СФП — силова з мʼячем", type: "strength", prep: "СФП", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Силові вправи", 4, "10 раз"), ex("Спеціальні естафети", 3, "3 рази")] },
      // May
      { date: "2026-05-04", name: "Тактична — атака і захист", type: "tactical", prep: "Тактична", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Швидка атака", 4, "5 раз"), ex("Перехід захист–атака", 3, "5 раз")] },
      { date: "2026-05-07", name: "Змішане тренування", type: "mixed", prep: "Змішана", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Ігрові комплекси 3×3", 3, "10 хв"), ex("Кидки", 3, "8 раз")] },
      { date: "2026-05-11", name: "СФП — фартлек", type: "speed", prep: "СФП", load: "В", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Фартлек 25 хв", 1, "25 хв"), ex("Прискорення 50 м", 6, "1 раз")] },
      { date: "2026-05-14", name: "Технічна — 1 на 1 з воротарем", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("1 на 1 з воротарем", 4, "8 раз"), ex("Подвійний пас і удар", 3, "10 раз")] },
      { date: "2026-05-18", name: "Психологічна підготовка", type: "mixed", prep: "Психологічна", load: "М", status: "completed", exercises: [ex("Психорегулювальне тренування", 1, "30 хв"), ex("Ситуації під тиском", 2, "15 хв")] },
      { date: "2026-05-21", name: "Тактична — пресинг", type: "tactical", prep: "Тактична", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Пресинг по всьому майданчику", 4, "5 хв"), ex("Гра в меншості", 2, "10 хв")] },
      { date: "2026-05-25", name: "Змішане — велике навантаження", type: "mixed", prep: "Змішана", load: "В", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Двостороння гра", 1, "60 хв"), ex("Аналіз гри", 1, "15 хв")] },
      { date: "2026-05-28", name: "ЗФП — відновна", type: "recovery", prep: "ЗФП", load: "М", status: "completed", exercises: [ex("Легкий біг", 1, "20 хв"), ex("Стретчинг", 1, "15 хв")] },
      // Jun completed
      { date: "2026-06-02", name: "Технічна — відкриття місяця", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Технічні вправи без мʼяча", 3, "5 хв"), ex("З мʼячем в парах", 4, "5 хв")] },
      { date: "2026-06-05", name: "Тактична — схеми атаки", type: "tactical", prep: "Тактична", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Комбінаційна атака 4-3-3", 4, "6 раз"), ex("Позиційна атака", 3, "10 хв")] },
      { date: "2026-06-09", name: "СФП — швидкість реакції", type: "speed", prep: "СФП", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Спринти 20×30 м", 1, "20 раз"), ex("Реактивна швидкість", 4, "5 раз")] },
      { date: "2026-06-12", name: "Змішане тренування", type: "mixed", prep: "Змішана", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Ігрові вправи", 4, "5 хв"), ex("Удари під тиском", 3, "10 раз")] },
      { date: "2026-06-16", name: "Технічна — підготовка до змагань", type: "technique", prep: "Технічна", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Спеціальні технічні вправи", 5, "8 раз"), ex("Моделювання змагання", 1, "20 хв")] },
      { date: "2026-06-19", name: "Тактична — фінальна підготовка", type: "tactical", prep: "Тактична", load: "ЗН", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Повна тактична схема", 3, "10 хв"), ex("Стандарти і штрафні", 2, "10 раз")] },
      { date: "2026-06-23", name: "ЗФП — підтримуюча", type: "strength", prep: "ЗФП", load: "М", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Силовий круговий комплекс", 3, "10 раз"), ex("Легкий біг", 1, "15 хв")] },
      { date: "2026-06-26", name: "Змішане — перед паузою", type: "mixed", prep: "Змішана", load: "С", status: "completed", exercises: [ex("Розминка", 1, "10 хв"), ex("Двостороння гра 30 хв", 1, "30 хв"), ex("Підведення підсумків", 1, "10 хв")] },
      // Today — in progress
      { date: "2026-06-28", name: "Тактична — завершальна", type: "tactical", prep: "Тактична", load: "С", status: "in_progress", exercises: [ex("Розминка", 1, "10 хв"), ex("Схеми атаки", 4, "8 раз"), ex("Двостороння гра", 1, "20 хв")] },
      // Upcoming
      { date: "2026-06-30", name: "Відновне тренування", type: "recovery", prep: "ЗФП", load: "М", status: "planned", exercises: [ex("Легкий біг", 1, "20 хв"), ex("Стретчинг", 1, "15 хв")] },
      { date: "2026-07-02", name: "Теоретичне заняття — відеоаналіз", type: "mixed", prep: "Теоретична", load: "М", status: "planned", exercises: [ex("Перегляд відеоматеріалів", 1, "45 хв"), ex("Обговорення тактики", 1, "30 хв")] },
      { date: "2026-07-05", name: "ЗФП — вхід у підготовчий", type: "endurance", prep: "ЗФП", load: "С", status: "planned", exercises: [ex("Крос 5 км", 1, "1 раз"), ex("ЗРВ", 2, "15 хв"), ex("Стрибкові вправи", 2, "5 хв")] },
      { date: "2026-07-08", name: "СФП — стартова", type: "speed", prep: "СФП", load: "С", status: "planned", exercises: [ex("Розминка", 1, "10 хв"), ex("Швидкісні вправи", 4, "5 раз"), ex("Спринти", 3, "30 м")] },
    ];

    for (const tr of trainingDefs) {
      await ctx.db.insert("trainings", {
        name: tr.name,
        date: tr.date,
        time: "10:00",
        type: tr.type,
        preparationType: tr.prep,
        loadLevel: tr.load,
        exercises: tr.exercises,
        globalCriteria: [],
        status: tr.status,
        athleteIds: allIds,
        coachId,
        durationMinutes: 90,
      });
    }

    // ── 6. Readiness scores ───────────────────────────────────────────────────
    const scoreDefs = [
      { idx: 0, date: "2026-06-20", ph: 76, te: 72, ta: 68, ps: 74, fn: 70, co: 78, re: 72 },
      { idx: 0, date: "2026-04-15", ph: 71, te: 69, ta: 65, ps: 70, fn: 66, co: 74, re: 68 },
      { idx: 1, date: "2026-06-20", ph: 70, te: 68, ta: 66, ps: 68, fn: 68, co: 72, re: 70 },
      { idx: 2, date: "2026-06-20", ph: 84, te: 80, ta: 82, ps: 78, fn: 82, co: 80, re: 86 },
      { idx: 2, date: "2026-04-15", ph: 79, te: 76, ta: 78, ps: 74, fn: 77, co: 76, re: 80 },
      { idx: 3, date: "2026-06-20", ph: 74, te: 70, ta: 72, ps: 68, fn: 72, co: 70, re: 70 },
      { idx: 4, date: "2026-06-20", ph: 62, te: 60, ta: 64, ps: 58, fn: 60, co: 62, re: 64 },
      { idx: 5, date: "2026-06-20", ph: 90, te: 88, ta: 86, ps: 92, fn: 88, co: 84, re: 90 },
      { idx: 5, date: "2026-04-15", ph: 86, te: 84, ta: 82, ps: 88, fn: 84, co: 80, re: 86 },
      { idx: 6, date: "2026-06-20", ph: 76, te: 72, ta: 70, ps: 76, fn: 74, co: 72, re: 76 },
      { idx: 7, date: "2026-06-20", ph: 68, te: 66, ta: 64, ps: 70, fn: 66, co: 68, re: 66 },
      { idx: 8, date: "2026-06-20", ph: 58, te: 54, ta: 56, ps: 56, fn: 54, co: 60, re: 58 },
      { idx: 9, date: "2026-06-20", ph: 80, te: 78, ta: 80, ps: 76, fn: 78, co: 80, re: 82 },
      { idx: 9, date: "2026-04-15", ph: 76, te: 74, ta: 76, ps: 72, fn: 74, co: 76, re: 78 },
    ];
    for (const s of scoreDefs) {
      const igs = Math.round(s.ph * 0.4 + s.te * 0.25 + s.ta * 0.2 + s.ps * 0.15);
      await ctx.db.insert("readiness_scores", {
        athleteId: athleteIds[s.idx].id,
        date: s.date,
        physical: s.ph,
        technical: s.te,
        tactical: s.ta,
        psychological: s.ps,
        functional: s.fn,
        coordination: s.co,
        recovery: s.re,
        igs,
        coachNotes: "Планова оцінка підготовленості",
      });
    }

    // ── 7. Test results ───────────────────────────────────────────────────────
    const tests = await ctx.db
      .query("dyush_tests")
      .withIndex("by_sport", (q) => q.eq("sport", "handball"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const testSubset = tests.slice(0, 6);
    for (const a of athleteIds.slice(0, 8)) {
      for (const test of testSubset) {
        const norm =
          test.norms.find(
            (n: any) => n.gender === "male" && ["16-17", "15-16", "17-18"].includes(n.ageGroup)
          ) ?? test.norms[0];
        if (!norm) continue;
        const offset = 0.3 + (a.idx % 5) * 0.08;
        const value = test.lowerIsBetter
          ? norm.excellent + (norm.good - norm.excellent) * offset
          : norm.excellent - (norm.excellent - norm.good) * offset;
        await ctx.db.insert("test_results", {
          athleteId: a.id,
          testId: test._id,
          date: "2026-06-10",
          value: Math.round(value * 100) / 100,
          normLevel: a.idx <= 2 ? "excellent" : a.idx <= 5 ? "good" : "satisfactory",
          normPercent: Math.round(85 + a.idx * 2),
          notes: "Контрольне тестування червень 2026",
          testingContext: "контрольне",
        });
      }
    }

    return {
      status: "seeded",
      athletes: athleteIds.length,
      trainings: trainingDefs.length,
      readinessScores: scoreDefs.length,
    };
  },
});
