import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, User, Activity } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

type AthleteDoc = {
  _id: Id<"athletes">; name: string; dateOfBirth: string; gender: "male" | "female";
  sport: string; specialization: string; qualification: string; phone?: string; email?: string;
  height: number; weight: number; trainingAge: number; currentCyclePhase?: string;
  bestResult?: string; targetResult?: string; injuryNotes?: string; personalNotes?: string;
};

const getAge = (dob: string) =>
  Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

interface AthleteProfileModalProps {
  athlete: AthleteDoc;
  onClose: () => void;
}

const AthleteProfileModal = ({ athlete, onClose }: AthleteProfileModalProps) => {
  const { t } = useTranslation(["team", "enums"]);
  const phase = athlete.currentCyclePhase ?? "preparatory_general";

  const cycleColors: Record<string, string> = {
    preparatory_general: "bg-blue-500/10 text-blue-400",
    preparatory_special: "bg-violet-500/10 text-violet-400",
    pre_competitive: "bg-orange-500/10 text-orange-400",
    competitive: "bg-yellow-500/10 text-yellow-400",
    restorative: "bg-green-500/10 text-green-400",
    transitional: "bg-muted text-muted-foreground",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-lg space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{athlete.name}</h2>
              <p className="text-muted-foreground text-sm">{athlete.specialization} · {athlete.qualification}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("profileModal.age"), value: `${getAge(athlete.dateOfBirth)} р.` },
            { label: t("profileModal.height"), value: `${athlete.height} см` },
            { label: t("profileModal.weight"), value: `${athlete.weight} кг` },
            { label: t("profileModal.experience"), value: `${athlete.trainingAge} р.` },
            { label: t("profileModal.best"), value: athlete.bestResult ?? "—" },
            { label: t("profileModal.goal"), value: athlete.targetResult ?? "—" },
          ].map((c) => (
            <div key={c.label} className="glass-card p-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="font-semibold text-sm mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${cycleColors[phase] ?? "bg-muted text-muted-foreground"}`}>
            {t(`enums:cyclePhase.${phase}`, phase)}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> {athlete.sport}
          </span>
          <span className="text-xs text-muted-foreground">
            {athlete.gender === "male" ? t("profileModal.male") : t("profileModal.female")}
          </span>
        </div>

        {(athlete.injuryNotes || athlete.personalNotes) && (
          <div className="space-y-2">
            {athlete.injuryNotes && (
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("profileModal.injuryNotes")}</p>
                <p className="text-sm">{athlete.injuryNotes}</p>
              </div>
            )}
            {athlete.personalNotes && (
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("profileModal.coachNotes")}</p>
                <p className="text-sm">{athlete.personalNotes}</p>
              </div>
            )}
          </div>
        )}

        {(athlete.phone || athlete.email) && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            {athlete.phone && <span>{athlete.phone}</span>}
            {athlete.email && <span>{athlete.email}</span>}
          </div>
        )}

        <Button variant="outline" onClick={onClose} className="w-full">
          {t("close", { ns: "common" })}
        </Button>
      </motion.div>
    </div>
  );
};

export default AthleteProfileModal;
