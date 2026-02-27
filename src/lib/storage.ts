// Storage keys
const STORAGE_KEYS = {
  TRAININGS: "app_trainings",
  ATHLETES: "app_athletes",
  HISTORY: "app_history",
  TRAINING_RESULTS: "trainingResults",
  CALENDAR_EVENTS: "app_calendar_events",
} as const;

// Types
interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  scale: string;
  weight: number;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  restSeconds: number;
  criteria: EvaluationCriterion[];
}

interface Training {
  id: string;
  name: string;
  date: string;
  description: string;
  type: "strength" | "speed" | "endurance" | "technique" | "recovery" | "mixed";
  exercises: Exercise[];
  status: "planned" | "in_progress" | "completed";
  athleteCount: number;
  globalCriteria: EvaluationCriterion[];
}

interface PerformanceRecord {
  date: string;
  actual: number;
  predicted: number;
}

interface Athlete {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  sport: string;
  specialization: string;
  qualification: string;
  phone: string;
  email: string;
  height: number;
  weight: number;
  trainingAge: number;
  currentCycle: "preparatory" | "competitive" | "transition";
  microCycleWeek: number;
  macroCycleName: string;
  bestResult: string;
  targetResult: string;
  injuryNotes: string;
  performanceHistory: PerformanceRecord[];
}

// Default mock data
const DEFAULT_TRAININGS: Training[] = [
  {
    id: "1",
    name: "Силове тренування",
    date: "2026-02-21",
    description: "Базова силова робота з акцентом на нижні кінцівки",
    type: "strength",
    athleteCount: 8,
    status: "completed",
    globalCriteria: [
      {
        id: "gc1",
        name: "Загальна інтенсивність",
        description: "Оцінка загальної інтенсивності тренування",
        scale: "1-10",
        weight: 4,
      },
      {
        id: "gc2",
        name: "Техніка виконання",
        description: "Правильність техніки рухів",
        scale: "1-10",
        weight: 5,
      },
    ],
    exercises: [
      {
        id: "e1",
        name: "Присідання зі штангою",
        description: "Глибокий присід, кут 90°+",
        sets: 4,
        reps: "8-10",
        restSeconds: 120,
        criteria: [
          {
            id: "c1",
            name: "Глибина присіду",
            description: "Кут згинання колін нижче 90°",
            scale: "прохідний/непрохідний",
            weight: 5,
          },
          {
            id: "c2",
            name: "Контроль спини",
            description: "Збереження нейтрального положення хребта",
            scale: "1-5",
            weight: 4,
          },
        ],
      },
      {
        id: "e2",
        name: "Жим лежачи",
        description: "Класичний жим штанги",
        sets: 4,
        reps: "6-8",
        restSeconds: 150,
        criteria: [
          {
            id: "c3",
            name: "Діапазон руху",
            description: "Повна амплітуда руху",
            scale: "1-5",
            weight: 3,
          },
        ],
      },
      {
        id: "e3",
        name: "Тяга в нахилі",
        description: "Тяга штанги до поясу",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
        criteria: [],
      },
    ],
  },
  {
    id: "2",
    name: "Швидкісна витривалість",
    date: "2026-02-20",
    description: "Інтервальна робота для розвитку швидкісної витривалості",
    type: "speed",
    athleteCount: 12,
    status: "completed",
    globalCriteria: [
      {
        id: "gc3",
        name: "ЧСС відновлення",
        description: "Час відновлення ЧСС до 120 уд/хв між інтервалами",
        scale: "час (с)",
        weight: 5,
      },
    ],
    exercises: [
      {
        id: "e4",
        name: "Інтервальний біг",
        description: "200м інтервали з відпочинком 2хв",
        sets: 6,
        reps: "200м",
        restSeconds: 120,
        criteria: [
          {
            id: "c4",
            name: "Час пробіжки",
            description: "Цільовий час на 200м",
            scale: "час (с)",
            weight: 5,
          },
          {
            id: "c5",
            name: "Стабільність темпу",
            description: "Різниця між найкращим і найгіршим часом",
            scale: "час (с)",
            weight: 4,
          },
        ],
      },
      {
        id: "e5",
        name: "Човниковий біг",
        description: "4x10м з максимальною швидкістю",
        sets: 5,
        reps: "4x10м",
        restSeconds: 90,
        criteria: [],
      },
    ],
  },
];

const DEFAULT_ATHLETES: Athlete[] = [
  {
    id: "1",
    name: "Олександр Петренко",
    dateOfBirth: "2004-03-15",
    gender: "male",
    sport: "Легка атлетика",
    specialization: "Спринт 100м",
    qualification: "КМС",
    phone: "+380991234567",
    email: "petrenko@mail.com",
    height: 182,
    weight: 78,
    trainingAge: 6,
    currentCycle: "preparatory",
    microCycleWeek: 3,
    macroCycleName: "Зимовий підготовчий 2026",
    bestResult: "10.45с",
    targetResult: "10.20с",
    injuryNotes: "",
    performanceHistory: [
      { date: "Тж1", actual: 10.82, predicted: 10.8 },
      { date: "Тж2", actual: 10.75, predicted: 10.74 },
      { date: "Тж3", actual: 10.68, predicted: 10.68 },
    ],
  },
  {
    id: "2",
    name: "Марія Коваленко",
    dateOfBirth: "2006-07-22",
    gender: "female",
    sport: "Легка атлетика",
    specialization: "Стрибки в довжину",
    qualification: "I розряд",
    phone: "+380997654321",
    email: "kovalenko@mail.com",
    height: 172,
    weight: 62,
    trainingAge: 4,
    currentCycle: "competitive",
    microCycleWeek: 2,
    macroCycleName: "Зимовий змагальний 2026",
    bestResult: "6.12м",
    targetResult: "6.35м",
    injuryNotes: "Легке розтягнення правого стегна (жовтень 2025)",
    performanceHistory: [
      { date: "Тж1", actual: 5.8, predicted: 5.82 },
      { date: "Тж2", actual: 5.88, predicted: 5.9 },
    ],
  },
  {
    id: "3",
    name: "Іван Сидоренко",
    dateOfBirth: "2002-11-08",
    gender: "male",
    sport: "Легка атлетика",
    specialization: "Штовхання ядра",
    qualification: "КМС",
    phone: "+380991112233",
    email: "sydorenko@mail.com",
    height: 190,
    weight: 105,
    trainingAge: 7,
    currentCycle: "transition",
    microCycleWeek: 1,
    macroCycleName: "Перехідний період",
    bestResult: "18.3м",
    targetResult: "19.0м",
    injuryNotes: "Проблеми з правим плечем",
    performanceHistory: [
      { date: "Тж1", actual: 17.5, predicted: 17.55 },
      { date: "Тж2", actual: 17.7, predicted: 17.72 },
    ],
  },
  {
    id: "4",
    name: "Анна Шевченко",
    dateOfBirth: "2007-01-30",
    gender: "female",
    sport: "Легка атлетика",
    specialization: "Біг 400м",
    qualification: "II розряд",
    phone: "+380994445566",
    email: "shevchenko@mail.com",
    height: 168,
    weight: 58,
    trainingAge: 3,
    currentCycle: "preparatory",
    microCycleWeek: 5,
    macroCycleName: "Зимовий підготовчий 2026",
    bestResult: "52.1с",
    targetResult: "50.8с",
    injuryNotes: "",
    performanceHistory: [
      { date: "Тж1", actual: 54.2, predicted: 54.1 },
      { date: "Тж2", actual: 53.8, predicted: 53.7 },
    ],
  },
  {
    id: "5",
    name: "Дмитро Бондар",
    dateOfBirth: "2003-09-12",
    gender: "male",
    sport: "Легка атлетика",
    specialization: "Стрибки у висоту",
    qualification: "I розряд",
    phone: "+380997778899",
    email: "bondar@mail.com",
    height: 193,
    weight: 82,
    trainingAge: 5,
    currentCycle: "preparatory",
    microCycleWeek: 4,
    macroCycleName: "Зимовий підготовчий 2026",
    bestResult: "2.15м",
    targetResult: "2.20м",
    injuryNotes: "",
    performanceHistory: [
      { date: "Тж1", actual: 2.05, predicted: 2.06 },
      { date: "Тж2", actual: 2.07, predicted: 2.08 },
    ],
  },
];

// Storage Manager
class StorageManager {
  // Trainings
  getTrainings(): Training[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRAININGS);
      return stored ? JSON.parse(stored) : DEFAULT_TRAININGS;
    } catch (error) {
      console.error("Error reading trainings from storage:", error);
      return DEFAULT_TRAININGS;
    }
  }

  setTrainings(trainings: Training[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(trainings));
    } catch (error) {
      console.error("Error saving trainings to storage:", error);
    }
  }

  // Athletes
  getAthletes(): Athlete[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATHLETES);
      return stored ? JSON.parse(stored) : DEFAULT_ATHLETES;
    } catch (error) {
      console.error("Error reading athletes from storage:", error);
      return DEFAULT_ATHLETES;
    }
  }

  setAthletes(athletes: Athlete[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));
    } catch (error) {
      console.error("Error saving athletes to storage:", error);
    }
  }

  // Training Results
  getTrainingResults(): Record<string, any> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRAINING_RESULTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading training results from storage:", error);
      return {};
    }
  }

  setTrainingResults(results: Record<string, any>): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRAINING_RESULTS,
        JSON.stringify(results),
      );
    } catch (error) {
      console.error("Error saving training results to storage:", error);
    }
  }

  // Calendar Events
  getCalendarEvents(): Record<string, any[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading calendar events from storage:", error);
      return {};
    }
  }

  setCalendarEvents(events: Record<string, any[]>): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CALENDAR_EVENTS,
        JSON.stringify(events),
      );
    } catch (error) {
      console.error("Error saving calendar events to storage:", error);
    }
  }

  // Clear all
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // Reset to defaults
  resetToDefaults(): void {
    try {
      this.setTrainings(DEFAULT_TRAININGS);
      this.setAthletes(DEFAULT_ATHLETES);
      localStorage.removeItem(STORAGE_KEYS.TRAINING_RESULTS);
      localStorage.removeItem(STORAGE_KEYS.CALENDAR_EVENTS);
    } catch (error) {
      console.error("Error resetting to defaults:", error);
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();

export type {
  Training,
  Athlete,
  Exercise,
  EvaluationCriterion,
  PerformanceRecord,
};
