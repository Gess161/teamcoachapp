import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, Save, Brain } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PREPAREDNESS_TYPES } from "@/entities/readiness/constants";
import IGSColorBar from "@/shared/ui/IGSColorBar";

const ReadinessModal = ({
  athletes, onClose,
}: {
  athletes: { _id: Id<"athletes">; name: string }[];
  onClose: () => void;
}) => {
  const { t } = useTranslation(["statistics", "enums", "common"]);
  const createScore = useMutation(api.readinessScores.create);
  const [athleteId, setAthleteId] = useState<string>(athletes[0]?._id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const setScore = (key: string, v: string) => setScores((p) => ({ ...p, [key]: v }));
  const num = (k: string) => (scores[k] ? Number(scores[k]) : undefined);

  const igs = useMemo(() => {
    const p = num("physical"), tp = num("technical"), ta = num("tactical"), ps = num("psychological");
    if (p !== undefined && tp !== undefined && ta !== undefined && ps !== undefined) {
      return Math.round(p * 0.4 + tp * 0.25 + ta * 0.2 + ps * 0.15);
    }
    return undefined;
  }, [scores]);

  const handleSave = async () => {
    if (!athleteId) return;
    setSaving(true);
    await createScore({
      athleteId: athleteId as Id<"athletes">, date,
      physical: num("physical"), technical: num("technical"),
      tactical: num("tactical"), psychological: num("psychological"),
      functional: num("functional"), coordination: num("coordination"),
      recovery: num("recovery"), igs, coachNotes: notes || undefined,
    });
    setSaving(false);
    onClose();
  };

  const BASIC_KEYS = ["physical", "technical", "tactical", "psychological"];
  const EXTRA_KEYS = ["functional", "coordination", "recovery"];

  const getIgsLabel = (v: number) => {
    if (v >= 85) return t("readinessModal.excellent");
    if (v >= 70) return t("readinessModal.good");
    if (v >= 55) return t("readinessModal.satisfactory");
    return t("readinessModal.needsWork");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl">{t("readinessModal.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("readinessModal.subtitle")}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-muted-foreground">{t("readinessModal.athlete")}</label>
            <select
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
            >
              {athletes.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-muted-foreground">{t("readinessModal.date")}</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/50 border-border/50" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("readinessModal.basicComponents")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BASIC_KEYS.map((k) => {
              const tp = PREPAREDNESS_TYPES.find((x) => x.key === k)!;
              return (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {tp.icon} {t(`enums:preparedness.${k}.label`, tp.label)}
                  </label>
                  <Input type="number" min={0} max={100} placeholder="0–100" value={scores[k] ?? ""} onChange={(e) => setScore(k, e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
              );
            })}
          </div>
          {igs !== undefined && (
            <div className="space-y-2 p-3 rounded-lg bg-primary/10">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{t("readinessModal.igsAuto", { value: igs })}</span>
                <span className="text-xs opacity-70 ml-auto text-muted-foreground">{getIgsLabel(igs)}</span>
              </div>
              <IGSColorBar variant="compact" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("readinessModal.extraComponents")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EXTRA_KEYS.map((k) => {
              const tp = PREPAREDNESS_TYPES.find((x) => x.key === k)!;
              return (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {tp.icon} {t(`enums:preparedness.${k}.label`, tp.label)}
                  </label>
                  <Input type="number" min={0} max={100} placeholder="0–100" value={scores[k] ?? ""} onChange={(e) => setScore(k, e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">{t("readinessModal.coachNotes")}</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("readinessModal.coachNotesPlaceholder")} className="bg-secondary/50 border-border/50" />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">{t("common:actions.cancel")}</Button>
          <Button onClick={handleSave} disabled={saving || !athleteId} className="flex-1 gap-2">
            <Save className="w-4 h-4" /> {saving ? t("common:actions.saving") : t("common:actions.save")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReadinessModal;
