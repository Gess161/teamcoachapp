import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { History as HistoryIcon } from "lucide-react";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PHASE_NAMES } from "@/entities/macrocycle/constants";
import type { MacroPhaseKey } from "@/entities/macrocycle/types";
import TrainingHistoryRow from "@/widgets/TrainingHistoryRow";

type AthleteDoc = {
  _id: any; name: string; dateOfBirth: string; gender: "male" | "female";
  sport: string; specialization: string; qualification: string; phone?: string; email?: string;
  height: number; weight: number; trainingAge: number; currentCyclePhase?: string;
  bestResult?: string; targetResult?: string; injuryNotes?: string; personalNotes?: string;
};

const HistoryPage = () => {
  const { t } = useTranslation(["history", "enums"]);
  const trainings = useQuery(api.trainings.getAll) ?? [];
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const activeMacro = useQuery(api.macrocycles.getActive) ?? null;

  const athleteMap = useMemo(() => {
    const m = new Map<string, AthleteDoc>();
    for (const a of athletes) m.set(a._id, a as AthleteDoc);
    return m;
  }, [athletes]);

  const activeMacroPhase = useMemo((): MacroPhaseKey | null => {
    if (!activeMacro) return null;
    const today = new Date().toISOString().split("T")[0];
    const { phases } = activeMacro;
    if (today >= phases.preparatoryGeneral.startDate && today <= phases.preparatoryGeneral.endDate)
      return "preparatory_general";
    if (today >= phases.preparatorySpecial.startDate && today <= phases.preparatorySpecial.endDate)
      return "preparatory_special";
    if (today >= phases.competitive.startDate && today <= phases.competitive.endDate)
      return "competitive";
    if (today >= phases.transitional.startDate && today <= phases.transitional.endDate)
      return "transitional";
    return null;
  }, [activeMacro]);

  const completed = useMemo(
    () =>
      [...trainings]
        .filter((tr) => tr.status === "completed")
        .sort((a, b) => b.date.localeCompare(a.date)),
    [trainings]
  );

  const tableHeaders = [
    t("table.training"),
    t("table.date"),
    t("table.prepType"),
    t("table.load"),
    t("table.athletes"),
    t("table.duration"),
    t("table.status"),
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle", { count: completed.length })}
          </p>
        </div>

        {activeMacroPhase && (
          <div className="flex items-center gap-2 text-sm px-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">
              {t("currentPhase")}{" "}
              <span className="text-foreground font-medium">
                {t(`enums:phaseName.${activeMacroPhase}`, PHASE_NAMES[activeMacroPhase])}
              </span>
            </span>
          </div>
        )}

        {completed.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("noCompleted")}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">{t("noCompletedHint")}</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {tableHeaders.map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completed.map((tr, i) => (
                    <TrainingHistoryRow
                      key={tr._id}
                      training={tr}
                      athleteMap={athleteMap}
                      activeMacroPhase={activeMacroPhase}
                      index={i}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default HistoryPage;
