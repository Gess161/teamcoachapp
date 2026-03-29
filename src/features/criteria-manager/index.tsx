import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Criterion } from "@/entities/training/types";
import { scaleOptions } from "@/entities/training/constants";

interface CriteriaManagerProps {
  trainingId: Id<"trainings">;
  exerciseId: string | undefined;
  training: {
    exercises: { id: string; criteria: Criterion[] }[];
    globalCriteria: Criterion[];
  };
  onClose: () => void;
}

const CriteriaManager = ({ trainingId, exerciseId, training, onClose }: CriteriaManagerProps) => {
  const updateTraining = useMutation(api.trainings.update);
  const { toast } = useToast();

  const [newCriterion, setNewCriterion] = useState({
    name: "",
    description: "",
    scale: "1-10",
    weight: "3",
  });

  const addCriterion = async () => {
    if (!newCriterion.name) return;

    const criterion: Criterion = {
      id: Date.now().toString(),
      name: newCriterion.name,
      description: newCriterion.description || undefined,
      scale: newCriterion.scale,
      weight: Number(newCriterion.weight) || 3,
    };

    if (exerciseId) {
      await updateTraining({
        id: trainingId,
        exercises: training.exercises.map((e) =>
          e.id === exerciseId
            ? { ...e, criteria: [...e.criteria, criterion] }
            : e,
        ),
      });
    } else {
      await updateTraining({
        id: trainingId,
        globalCriteria: [...training.globalCriteria, criterion],
      });
    }
    setNewCriterion({ name: "", description: "", scale: "1-10", weight: "3" });
    toast({ title: "Критерій додано" });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="glass-card p-6 w-full max-w-md space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-chart-4" /> Новий критерій
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {exerciseId ? "Критерій для конкретної вправи" : "Загальний критерій тренування"}
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Назва критерію</Label>
              <Input
                placeholder="Техніка виконання"
                value={newCriterion.name}
                onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Опис</Label>
              <Textarea
                placeholder="Що саме оцінюється..."
                value={newCriterion.description}
                onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
                className="bg-secondary/50 border-border/50 min-h-[50px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Шкала</Label>
                <select
                  value={newCriterion.scale}
                  onChange={(e) => setNewCriterion({ ...newCriterion, scale: e.target.value })}
                  className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  {scaleOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Вага (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={newCriterion.weight}
                  onChange={(e) => setNewCriterion({ ...newCriterion, weight: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Скасувати
            </Button>
            <Button
              onClick={addCriterion}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Додати критерій
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CriteriaManager;
