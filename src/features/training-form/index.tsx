import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { TrainingType, LoadLevel, PreparationType } from "@/entities/training/types";
import { trainingTypes, preparationTypes, loadLevels } from "@/entities/training/constants";

interface TrainingFormProps {
  editingId: Id<"trainings"> | null;
  initialData: {
    name: string; date: string; time: string; description: string;
    type: TrainingType; preparationType: PreparationType; loadLevel: LoadLevel;
  } | null;
  onClose: () => void;
  onSaved: (id: Id<"trainings">) => void;
}

const emptyForm = () => ({
  name: "", date: "", time: "", description: "",
  type: "mixed" as TrainingType,
  preparationType: "ЗФП" as PreparationType,
  loadLevel: "С" as LoadLevel,
});

const TrainingForm = ({ editingId, initialData, onClose, onSaved }: TrainingFormProps) => {
  const { t } = useTranslation(["training", "enums", "common"]);
  const createTraining = useMutation(api.trainings.create);
  const updateTraining = useMutation(api.trainings.update);
  const { toast } = useToast();

  const [form, setForm] = useState(initialData ?? emptyForm());

  useEffect(() => {
    setForm(initialData ?? emptyForm());
  }, [initialData]);

  const handleSave = async () => {
    if (!form.name || !form.date) return;

    if (editingId) {
      await updateTraining({
        id: editingId, name: form.name, date: form.date,
        time: form.time || undefined, description: form.description || undefined,
        type: form.type, preparationType: form.preparationType, loadLevel: form.loadLevel,
      });
      toast({ title: t("form.updated"), description: form.name });
      onSaved(editingId);
    } else {
      const id = await createTraining({
        name: form.name, date: form.date,
        time: form.time || undefined, description: form.description || undefined,
        type: form.type, preparationType: form.preparationType, loadLevel: form.loadLevel,
        exercises: [], globalCriteria: [], athleteIds: [],
      });
      toast({ title: t("form.created"), description: form.name });
      onSaved(id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          className="glass-card p-6 w-full max-w-md space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">
              {editingId ? t("form.edit") : t("form.new")}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("form.name")}</Label>
              <Input
                placeholder={t("form.namePlaceholder")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">{t("form.type")}</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TrainingType })}
                  className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  {Object.entries(trainingTypes).map(([k]) => (
                    <option key={k} value={k}>{t(`enums:trainingType.${k}`, k)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">{t("form.load")}</Label>
                <select
                  value={form.loadLevel}
                  onChange={(e) => setForm({ ...form, loadLevel: e.target.value as LoadLevel })}
                  className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  {loadLevels.map((l) => (
                    <option key={l.value} value={l.value}>{t(`enums:loadLevel.${l.value}`, l.label)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("form.prepType")}</Label>
              <select
                value={form.preparationType}
                onChange={(e) => setForm({ ...form, preparationType: e.target.value as PreparationType })}
                className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
              >
                {preparationTypes.map((p) => (
                  <option key={p} value={p}>{t(`enums:prepType.${p}`, p)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("form.date")}</Label>
              <Input
                type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("form.time")}</Label>
              <Input
                type="time" value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">{t("form.description")}</Label>
                {form.description && (
                  <button
                    onClick={() => setForm({ ...form, description: "" })}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {t("common:actions.clear")}
                  </button>
                )}
              </div>
              <Textarea
                placeholder={t("form.descriptionPlaceholder")}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-secondary/50 border-border/50 min-h-[60px]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">{t("common:actions.cancel")}</Button>
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {editingId ? t("common:actions.update") : t("common:actions.create")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrainingForm;
