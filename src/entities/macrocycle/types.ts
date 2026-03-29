import type { Id } from "../../../convex/_generated/dataModel";

export type MacroDoc = {
  _id: Id<"macrocycles">;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  phases: {
    preparatoryGeneral: {
      startDate: string;
      endDate: string;
      hoursPercent: number;
    };
    preparatorySpecial: {
      startDate: string;
      endDate: string;
      hoursPercent: number;
    };
    competitive: { startDate: string; endDate: string; hoursPercent: number };
    transitional: { startDate: string; endDate: string; hoursPercent: number };
  };
  athleteIds: Id<"athletes">[];
  sport?: string;
  totalHoursPlanned?: number;
};

export type MacroPhaseKey =
  | "preparatory_general"
  | "preparatory_special"
  | "competitive"
  | "transitional";

export type MacroForm = {
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  totalHoursPlanned: string;
  pg_start: string;
  pg_end: string;
  ps_start: string;
  ps_end: string;
  comp_start: string;
  comp_end: string;
  trans_start: string;
  trans_end: string;
};
