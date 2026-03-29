import type { TrainingType, LoadLevel, PreparationType } from "./types";

export const trainingTypes: Record<TrainingType, { label: string; color: string }> = {
  strength: { label: "Силове", color: "bg-chart-1/10 text-chart-1" },
  speed: { label: "Швидкісне", color: "bg-chart-4/10 text-chart-4" },
  endurance: { label: "Витривалість", color: "bg-chart-2/10 text-chart-2" },
  technique: { label: "Техніка", color: "bg-chart-5/10 text-chart-5" },
  recovery: { label: "Відновлення", color: "bg-chart-3/10 text-chart-3" },
  mixed: { label: "Змішане", color: "bg-muted text-muted-foreground" },
  tactical: { label: "Тактичне", color: "bg-chart-4/20 text-chart-4" },
  competition: { label: "Змагання", color: "bg-primary/10 text-primary" },
};

export const statusMap = {
  planned: { label: "Заплановано", color: "bg-chart-2/10 text-chart-2" },
  in_progress: { label: "В процесі", color: "bg-chart-4/10 text-chart-4" },
  completed: { label: "Завершено", color: "bg-primary/10 text-primary" },
};

export const scaleOptions = [
  "1-5",
  "1-10",
  "1-100",
  "прохідний/непрохідний",
  "час (с)",
  "відстань (м)",
  "вага (кг)",
];

export const preparationTypes: PreparationType[] = [
  "ЗФП",
  "СФП",
  "Технічна",
  "Тактична",
  "Психологічна",
  "Теоретична",
  "Змішана",
];

export const loadLevels: { value: LoadLevel; label: string }[] = [
  { value: "В", label: "Великі (В)" },
  { value: "ЗН", label: "Значні (ЗН)" },
  { value: "С", label: "Середні (С)" },
  { value: "М", label: "Малі (М)" },
];
