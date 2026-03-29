import type { Id } from "../../../convex/_generated/dataModel";

export type CyclePhase =
  | "preparatory_general"
  | "preparatory_special"
  | "pre_competitive"
  | "competitive"
  | "restorative"
  | "transitional";

export type FormState = {
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  sport: string;
  specialization: string;
  qualification: string;
  phone: string;
  email: string;
  height: string;
  weight: string;
  trainingAge: string;
  currentCyclePhase: CyclePhase;
  bestResult: string;
  targetResult: string;
  injuryNotes: string;
  personalNotes: string;
};

export const emptyForm: FormState = {
  name: "",
  dateOfBirth: "",
  gender: "male",
  sport: "handball",
  specialization: "",
  qualification: "",
  phone: "",
  email: "",
  height: "",
  weight: "",
  trainingAge: "",
  currentCyclePhase: "preparatory_general",
  bestResult: "",
  targetResult: "",
  injuryNotes: "",
  personalNotes: "",
};

export type AthleteDoc = {
  _id: Id<"athletes">;
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  sport: string;
  specialization: string;
  qualification: string;
  phone?: string;
  email?: string;
  height: number;
  weight: number;
  trainingAge: number;
  currentCyclePhase?: string;
  bestResult?: string;
  targetResult?: string;
  injuryNotes?: string;
  personalNotes?: string;
  isActive: boolean;
  macroCycleId?: Id<"macrocycles">;
};
