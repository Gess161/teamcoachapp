import type { MacroPhaseKey } from "./types";

export const PHASE_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-yellow-500",
  "bg-green-500",
];

type PrepType = "ЗФП" | "СФП" | "Технічна" | "Тактична";

export const PLATONOV_DISTRIBUTION: Record<MacroPhaseKey, Record<PrepType, number>> = {
  preparatory_general: { ЗФП: 60, СФП: 20, Технічна: 15, Тактична: 5 },
  preparatory_special: { ЗФП: 30, СФП: 40, Технічна: 20, Тактична: 10 },
  competitive:         { ЗФП: 15, СФП: 25, Технічна: 25, Тактична: 35 },
  transitional:        { ЗФП: 70, СФП: 15, Технічна: 10, Тактична: 5 },
};

export const PHASE_NAMES: Record<MacroPhaseKey, string> = {
  preparatory_general: "Підготовчий I (ЗФП)",
  preparatory_special: "Підготовчий II (СФП)",
  competitive:         "Змагальний",
  transitional:        "Перехідний",
};

export const BAR_COLORS: Record<PrepType, string> = {
  ЗФП:      "bg-blue-500",
  СФП:      "bg-violet-500",
  Технічна: "bg-yellow-500",
  Тактична: "bg-orange-500",
};
