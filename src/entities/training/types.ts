import type { Id } from "../../../convex/_generated/dataModel";

export type TrainingType =
  | "strength"
  | "speed"
  | "endurance"
  | "technique"
  | "recovery"
  | "mixed"
  | "tactical"
  | "competition";

export type LoadLevel = "В" | "ЗН" | "С" | "М";

export type PreparationType =
  | "ЗФП"
  | "СФП"
  | "Технічна"
  | "Тактична"
  | "Психологічна"
  | "Теоретична"
  | "Змішана";

export interface Criterion {
  id: string;
  name: string;
  description?: string;
  scale: string;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  criteria: Criterion[];
}

export type TrainingDoc = {
  _id: Id<"trainings">;
  name: string;
  date: string;
  status: string;
  preparationType?: string;
  loadLevel?: string;
  athleteIds: Id<"athletes">[];
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
  }[];
  durationMinutes?: number;
  description?: string;
};
