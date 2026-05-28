import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, Info } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PLATONOV_DISTRIBUTION, PHASE_NAMES, BAR_COLORS } from "@/entities/macrocycle/constants";
import type { MacroPhaseKey } from "@/entities/macrocycle/types";

const PREP_TYPE_COLORS: Record<string, string> = {
  ЗФП: "bg-blue-500/20 text-blue-400",
  СФП: "bg-violet-500/20 text-violet-400",
  Технічна: "bg-yellow-500/20 text-yellow-400",
  Тактична: "bg-orange-500/20 text-orange-400",
  Психологічна: "bg-pink-500/20 text-pink-400",
  Теоретична: "bg-cyan-500/20 text-cyan-400",
  Змішана: "bg-primary/20 text-primary",
};

type PrepType = "ЗФП" | "СФП" | "Технічна" | "Тактична";

interface TrainingTypeModalProps {
  training: { _id: Id<"trainings">; name: string; date: string; preparationType?: string };
  activeMacroPhase: MacroPhaseKey | null;
  onClose: () => void;
}

const TrainingTypeModal = ({ training, activeMacroPhase, onClose }: TrainingTypeModalProps) => {
  const { t } = useTranslation(["history", "enums", "common"]);
  const updateTraining = useMutation(api.trainings.update);
  const [selected, setSelected] = useState<PrepType | undefined>(training.preparationType as PrepType | undefined);
  const [saving, setSaving] = useState(false);

  const handleSave = async (type: PrepType) => {
    setSaving(true);
    await updateTraining({ id: training._id, preparationType: type });
    setSaving(false);
    onClose();
  };

  const ALL_PHASES = Object.keys(PLATONOV_DISTRIBUTION) as MacroPhaseKey[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl">{training.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {training.date} · {t("typeModal.prepTypeSubtitle")}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">{t("typeModal.recommendation")}</p>
          </div>

          {ALL_PHASES.map((phase) => {
            const dist = PLATONOV_DISTRIBUTION[phase];
            const isCurrentPhase = phase === activeMacroPhase;
            return (
              <div key={phase} className={`rounded-lg p-4 space-y-3 ${isCurrentPhase ? "border border-primary/30 bg-primary/5" : "bg-secondary/20"}`}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {t(`enums:phaseName.${phase}`, PHASE_NAMES[phase])}
                  </p>
                  {isCurrentPhase && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {t("typeModal.currentPhase")}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {(Object.entries(dist) as [PrepType, number][]).map(([type, pct]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">
                        {t(`enums:prepType.${type}`, type)}
                      </span>
                      <div className="flex-1 bg-secondary/50 rounded-full h-2">
                        <div className={`h-2 rounded-full ${BAR_COLORS[type]}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{t("typeModal.typeTitle")}</p>
          {training.preparationType && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("typeModal.currentType")}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${PREP_TYPE_COLORS[training.preparationType] ?? ""}`}>
                {t(`enums:prepType.${training.preparationType}`, training.preparationType)}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["ЗФП", "СФП", "Технічна", "Тактична", "Психологічна", "Теоретична", "Змішана"] as const).map((type) => (
              <button
                key={type}
                disabled={saving}
                onClick={() => { setSelected(type as PrepType); handleSave(type as PrepType); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  selected === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {t(`enums:prepType.${type}`, type)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("typeModal.saveHint")}</p>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">{t("close", { ns: "common" })}</Button>
      </motion.div>
    </div>
  );
};

export default TrainingTypeModal;
