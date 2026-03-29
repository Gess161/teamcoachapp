import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ClipboardList } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Exercise } from "@/entities/training/types";

interface ExerciseManagerProps {
  trainingId: Id<"trainings">;
  training: {
    exercises: Exercise[];
  };
  onClose: () => void;
}

const ExerciseManager = ({ trainingId, training, onClose }: ExerciseManagerProps) => {
  const updateTraining = useMutation(api.trainings.update);
  const dyushTests = useQuery(api.dyushTests.getAll, {}) ?? [];
  const { toast } = useToast();

  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    sets: "",
    reps: "",
    restSeconds: "",
  });

  const addExercise = async () => {
    if (!newExercise.name) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      description: newExercise.description || undefined,
      sets: Number(newExercise.sets) || 3,
      reps: newExercise.reps || "10",
      restSeconds: Number(newExercise.restSeconds) || 60,
      criteria: [],
    };
    await updateTraining({ id: trainingId, exercises: [...training.exercises, ex] });
    setNewExercise({ name: "", description: "", sets: "", reps: "", restSeconds: "" });
    toast({ title: "Вправу додано" });
    onClose();
  };

  const addExerciseFromTest = async (testId: Id<"dyush_tests">) => {
    const test = dyushTests.find((t) => t._id === testId);
    if (!test) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      name: test.name,
      description: test.description,
      sets: 1,
      reps: "1",
      restSeconds: 0,
      criteria: [],
    };
    await updateTraining({ id: trainingId, exercises: [...training.exercises, ex] });
    toast({ title: `Вправу «${test.name}» додано` });
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
              <ClipboardList className="w-5 h-5 text-primary" /> Тести ДЮСШ
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            Оберіть тест щоб додати як вправу до тренування:
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dyushTests.length > 0 ? (
              dyushTests.map((test) => (
                <button
                  key={test._id}
                  onClick={() => addExerciseFromTest(test._id)}
                  className="w-full text-left p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <p className="font-medium text-sm">{test.name}</p>
                  {test.description && (
                    <p className="text-xs text-muted-foreground truncate">{test.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="bg-secondary px-2 py-0.5 rounded">{test.unit}</span>
                    <span className="bg-chart-4/10 text-chart-4 px-2 py-0.5 rounded">
                      {test.physicalQuality}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Тестів не знайдено</p>
            )}
          </div>

          <div className="border-t border-border/40 pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Або додати вручну:</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Назва"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="bg-secondary/50 border-border/50 text-sm"
              />
              <Input
                placeholder="Опис"
                value={newExercise.description}
                onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                className="bg-secondary/50 border-border/50 text-sm"
              />
              <Input
                placeholder="Підходи"
                type="number"
                value={newExercise.sets}
                onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                className="bg-secondary/50 border-border/50 text-sm"
              />
              <Input
                placeholder="Повтори/дистанція"
                value={newExercise.reps}
                onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                className="bg-secondary/50 border-border/50 text-sm"
              />
              <Input
                placeholder="Відпочинок (сек)"
                type="number"
                value={newExercise.restSeconds}
                onChange={(e) => setNewExercise({ ...newExercise, restSeconds: e.target.value })}
                className="bg-secondary/50 border-border/50 text-sm col-span-2"
              />
            </div>
            <Button
              size="sm"
              onClick={addExercise}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 w-full"
            >
              <Plus className="w-3 h-3" /> Додати вправу вручну
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseManager;
