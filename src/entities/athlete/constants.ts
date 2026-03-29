import type { CyclePhase } from "./types";

export const cycleLabels: Record<CyclePhase, { label: string; color: string }> = {
  preparatory_general: {
    label: "Підг. загальний",
    color: "bg-blue-500/10 text-blue-400",
  },
  preparatory_special: {
    label: "Підг. спеціальний",
    color: "bg-violet-500/10 text-violet-400",
  },
  pre_competitive: {
    label: "Передзмагальний",
    color: "bg-orange-500/10 text-orange-400",
  },
  competitive: {
    label: "Змагальний",
    color: "bg-yellow-500/10 text-yellow-400",
  },
  restorative: { label: "Відновний", color: "bg-green-500/10 text-green-400" },
  transitional: {
    label: "Перехідний",
    color: "bg-muted text-muted-foreground",
  },
};

// 12 types of preparedness colors (from Platonov) — simple version used by IGSColorBar
export const PREPAREDNESS_TYPES = [
  { key: "physical", label: "Фізична", icon: "💪", color: "hsl(84,81%,44%)" },
  { key: "technical", label: "Технічна", icon: "🎯", color: "hsl(45,90%,55%)" },
  { key: "tactical", label: "Тактична", icon: "♟️", color: "hsl(200,70%,50%)" },
  {
    key: "psychological",
    label: "Психологічна",
    icon: "🧠",
    color: "hsl(340,75%,55%)",
  },
  {
    key: "theoretical",
    label: "Теоретична",
    icon: "📚",
    color: "hsl(270,65%,60%)",
  },
  {
    key: "functional",
    label: "Функціональна",
    icon: "❤️",
    color: "hsl(0,75%,55%)",
  },
  {
    key: "psychophysio",
    label: "Психофізіологічна",
    icon: "⚡",
    color: "hsl(30,80%,55%)",
  },
  {
    key: "cognitive",
    label: "Когнітивна",
    icon: "🔬",
    color: "hsl(160,60%,45%)",
  },
  {
    key: "morphofunc",
    label: "Морфофункціональна",
    icon: "📏",
    color: "hsl(190,65%,45%)",
  },
  {
    key: "recovery",
    label: "Відновлювальна",
    icon: "🔄",
    color: "hsl(120,55%,45%)",
  },
  {
    key: "coordination",
    label: "Координаційна",
    icon: "🤸",
    color: "hsl(60,85%,50%)",
  },
  {
    key: "integral",
    label: "Інтегральна",
    icon: "🏆",
    color: "hsl(84,81%,44%)",
  },
] as const;
