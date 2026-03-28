import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Тренери (auth) ───────────────────────────────────────────────────────
  coaches: defineTable({
    name: v.string(),
    email: v.string(),
    sport: v.string(), // "handball", "football", etc.
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // ─── Спортсмени ───────────────────────────────────────────────────────────
  athletes: defineTable({
    name: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    sport: v.string(),
    specialization: v.string(),
    qualification: v.string(), // "КМС", "МС", "I розряд", etc.
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    height: v.number(), // cm
    weight: v.number(), // kg
    trainingAge: v.number(), // years
    // Поточний цикл — береться з macrocycles, але для швидкого доступу
    currentCyclePhase: v.optional(
      v.union(
        v.literal("preparatory_general"),
        v.literal("preparatory_special"),
        v.literal("pre_competitive"),
        v.literal("competitive"),
        v.literal("restorative"),
        v.literal("transitional")
      )
    ),
    macroCycleId: v.optional(v.id("macrocycles")),
    bestResult: v.optional(v.string()),
    targetResult: v.optional(v.string()),
    injuryNotes: v.optional(v.string()),
    personalNotes: v.optional(v.string()), // нотатки тренера
    coachId: v.optional(v.id("coaches")),
    isActive: v.boolean(),
  })
    .index("by_sport", ["sport"])
    .index("by_coach", ["coachId"]),

  // ─── Тренування (план) ────────────────────────────────────────────────────
  trainings: defineTable({
    name: v.string(),
    date: v.string(), // ISO date "2026-03-28"
    description: v.optional(v.string()),
    type: v.union(
      v.literal("strength"),
      v.literal("speed"),
      v.literal("endurance"),
      v.literal("technique"),
      v.literal("recovery"),
      v.literal("mixed"),
      v.literal("tactical"),
      v.literal("competition")
    ),
    // Вид підготовки за Платоновим
    preparationType: v.optional(
      v.union(
        v.literal("ЗФП"), // Загальна фізична підготовка
        v.literal("СФП"), // Спеціальна фізична підготовка
        v.literal("Технічна"),
        v.literal("Тактична"),
        v.literal("Психологічна"),
        v.literal("Теоретична"),
        v.literal("Змішана")
      )
    ),
    // Рівень навантаження за Платоновим
    loadLevel: v.optional(
      v.union(
        v.literal("В"),   // Великі (1.00)
        v.literal("ЗН"),  // Значні (0.75)
        v.literal("С"),   // Середні (0.50)
        v.literal("М")    // Малі (0.25)
      )
    ),
    exercises: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        sets: v.number(),
        reps: v.string(),
        restSeconds: v.number(),
        criteria: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            scale: v.string(),
            weight: v.number(),
          })
        ),
      })
    ),
    globalCriteria: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        scale: v.string(),
        weight: v.number(),
      })
    ),
    status: v.union(
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    athleteIds: v.array(v.id("athletes")), // хто бере участь
    mesocycleId: v.optional(v.id("mesocycles")),
    durationMinutes: v.optional(v.number()),
    coachId: v.optional(v.id("coaches")),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_coach", ["coachId"]),

  // ─── Результати тренування (по спортсмену) ────────────────────────────────
  training_sessions: defineTable({
    trainingId: v.id("trainings"),
    athleteId: v.id("athletes"),
    date: v.string(),
    // Результати по критеріях
    criteriaResults: v.array(
      v.object({
        criterionId: v.string(),
        criterionName: v.string(),
        value: v.union(v.string(), v.number()),
        score: v.optional(v.number()), // normalized 0-100
      })
    ),
    exerciseResults: v.array(
      v.object({
        exerciseId: v.string(),
        exerciseName: v.string(),
        criteriaResults: v.array(
          v.object({
            criterionId: v.string(),
            criterionName: v.string(),
            value: v.union(v.string(), v.number()),
            score: v.optional(v.number()),
          })
        ),
      })
    ),
    overallScore: v.optional(v.number()), // ІТН-оцінка за заняття
    coachNotes: v.optional(v.string()),
    // Персональні корективи тренера для цього спортсмена
    personalAdjustments: v.optional(v.string()),
  })
    .index("by_training", ["trainingId"])
    .index("by_athlete", ["athleteId"])
    .index("by_athlete_date", ["athleteId", "date"]),

  // ─── Тести ДЮСШ (довідник) ────────────────────────────────────────────────
  dyush_tests: defineTable({
    name: v.string(), // "Біг 30м", "Підтягування"
    description: v.optional(v.string()),
    sport: v.string(), // "handball"
    physicalQuality: v.union(
      v.literal("strength"),     // Сила
      v.literal("endurance"),    // Витривалість
      v.literal("flexibility"),  // Гнучкість
      v.literal("coordination"), // Координація
      v.literal("speed")         // Швидкість
    ),
    unit: v.string(), // "с", "м", "рази", "см"
    // Чи менше = краще (для часових тестів)
    lowerIsBetter: v.boolean(),
    // Нормативи по вікових групах та статі
    norms: v.array(
      v.object({
        ageGroup: v.string(), // "U12", "U14", "U16", "U18", "U20+"
        gender: v.union(v.literal("male"), v.literal("female")),
        // Рівні нормативів
        excellent: v.number(),  // Відмінно
        good: v.number(),       // Добре
        satisfactory: v.number(), // Задовільно
      })
    ),
    isActive: v.boolean(),
  })
    .index("by_sport", ["sport"])
    .index("by_quality", ["physicalQuality"]),

  // ─── Результати тестів ДЮСШ ───────────────────────────────────────────────
  test_results: defineTable({
    athleteId: v.id("athletes"),
    testId: v.id("dyush_tests"),
    date: v.string(), // дата тестування
    value: v.number(), // результат
    // Обраховується автоматично
    normLevel: v.optional(
      v.union(
        v.literal("excellent"),
        v.literal("good"),
        v.literal("satisfactory"),
        v.literal("below_norm")
      )
    ),
    normPercent: v.optional(v.number()), // % від нормативу "good"
    notes: v.optional(v.string()),
    testingContext: v.optional(v.string()), // "контрольне", "змагальне", "поточне"
  })
    .index("by_athlete", ["athleteId"])
    .index("by_test", ["testId"])
    .index("by_athlete_test", ["athleteId", "testId"])
    .index("by_date", ["date"]),

  // ─── Макроцикл (річний план) ──────────────────────────────────────────────
  macrocycles: defineTable({
    name: v.string(), // "2026-2027 Річний макроцикл"
    sport: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    totalHoursPlanned: v.optional(v.number()),
    // Розбивка по циклах (відсотки)
    phases: v.object({
      preparatoryGeneral: v.object({
        startDate: v.string(),
        endDate: v.string(),
        hoursPercent: v.number(), // ~25-30% від річного
      }),
      preparatorySpecial: v.object({
        startDate: v.string(),
        endDate: v.string(),
        hoursPercent: v.number(), // ~25-30%
      }),
      competitive: v.object({
        startDate: v.string(),
        endDate: v.string(),
        hoursPercent: v.number(), // ~35-45%
      }),
      transitional: v.object({
        startDate: v.string(),
        endDate: v.string(),
        hoursPercent: v.number(), // ~5-10%
      }),
    }),
    athleteIds: v.array(v.id("athletes")),
    coachId: v.optional(v.id("coaches")),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  // ─── Мезоцикли ────────────────────────────────────────────────────────────
  mesocycles: defineTable({
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
    weekCount: v.number(), // 2-4 тижні
    targetLoadLevel: v.optional(v.string()), // рекомендований ІТН
  }).index("by_macrocycle", ["macroCycleId"]),

  // ─── Антропометрія (для морфофункціональної підготовленості) ─────────────
  anthropometry: defineTable({
    athleteId: v.id("athletes"),
    date: v.string(),
    height: v.number(),    // cm
    weight: v.number(),    // kg
    wingspan: v.optional(v.number()), // розмах рук (для гандболу важливо)
    bodyFatPercent: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_athlete", ["athleteId"]),

  // ─── Оцінки підготовленості (суб'єктивні) ────────────────────────────────
  readiness_scores: defineTable({
    athleteId: v.id("athletes"),
    date: v.string(),
    // Основні компоненти ІГС
    physical: v.optional(v.number()),       // 0-100
    technical: v.optional(v.number()),      // 0-100
    tactical: v.optional(v.number()),       // 0-100
    psychological: v.optional(v.number()),  // 0-100
    // Розширені (опціонально)
    functional: v.optional(v.number()),
    coordination: v.optional(v.number()),
    recovery: v.optional(v.number()),
    // Розрахунковий ІГС (0-100)
    igs: v.optional(v.number()),
    coachNotes: v.optional(v.string()),
  })
    .index("by_athlete", ["athleteId"])
    .index("by_date", ["date"]),
});
