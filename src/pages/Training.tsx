import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ClipboardList, Dumbbell } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import TrainingForm from "@/features/training-form";
import ExerciseManager from "@/features/exercise-manager";
import CriteriaManager from "@/features/criteria-manager";
import AthletesSelector from "@/features/athletes-selector";
import TrainingDetailPanel from "@/widgets/TrainingDetailPanel";
import TrainingCard from "@/widgets/TrainingCard";
import type { TrainingType, LoadLevel, PreparationType } from "@/entities/training/types";

const TrainingPage = () => {
  const trainings = useQuery(api.trainings.getAll) ?? [];
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const updateTraining = useMutation(api.trainings.update);
  const updateStatus = useMutation(api.trainings.updateStatus);
  const removeTraining = useMutation(api.trainings.remove);

  const [selectedId, setSelectedId] = useState<Id<"trainings"> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Id<"trainings"> | null>(null);
  const [editingInitialData, setEditingInitialData] = useState<{
    name: string; date: string; time: string; description: string;
    type: TrainingType; preparationType: PreparationType; loadLevel: LoadLevel;
  } | null>(null);
  const [showCriteriaModal, setShowCriteriaModal] = useState<{
    trainingId: Id<"trainings">; exerciseId?: string;
  } | null>(null);
  const [showAthletesModal, setShowAthletesModal] = useState<Id<"trainings"> | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState<Id<"trainings"> | null>(null);

  const { toast } = useToast();
  const selectedTraining = selectedId ? (trainings.find((t) => t._id === selectedId) ?? null) : null;

  const removeExercise = async (trainingId: Id<"trainings">, exerciseId: string) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    await updateTraining({ id: trainingId, exercises: training.exercises.filter((e) => e.id !== exerciseId) });
  };

  const removeCriterion = async (trainingId: Id<"trainings">, criterionId: string, exerciseId?: string) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    if (exerciseId) {
      await updateTraining({
        id: trainingId,
        exercises: training.exercises.map((e) =>
          e.id === exerciseId ? { ...e, criteria: e.criteria.filter((c) => c.id !== criterionId) } : e,
        ),
      });
    } else {
      await updateTraining({ id: trainingId, globalCriteria: training.globalCriteria.filter((c) => c.id !== criterionId) });
    }
  };

  const removeAthlete = async (trainingId: Id<"trainings">, athleteId: Id<"athletes">) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    await updateTraining({ id: trainingId, athleteIds: training.athleteIds.filter((id) => id !== athleteId) });
    toast({ title: "Спортсмена видалено" });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Тренування</h1>
            <p className="text-muted-foreground mt-1">Створюйте, оцінюйте та проводьте тренування</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setEditingInitialData(null); setShowModal(true); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Нове тренування
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Training List */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Всі тренування
            </h2>
            {trainings.length === 0 && (
              <div className="glass-card p-12 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Немає тренувань. Створіть перше!</p>
              </div>
            )}
            {trainings.map((t) => (
              <TrainingCard
                key={t._id}
                training={t}
                isSelected={selectedTraining?._id === t._id}
                onSelect={() => setSelectedId(t._id)}
                onStart={async () => { await updateStatus({ id: t._id, status: "in_progress" }); toast({ title: "Тренування розпочато!" }); }}
                onComplete={async () => { await updateStatus({ id: t._id, status: "completed" }); toast({ title: "Тренування завершено! ✅" }); }}
                onEdit={() => {
                  setEditingId(t._id);
                  setEditingInitialData({
                    name: t.name, date: t.date, time: t.time || "",
                    description: t.description || "", type: t.type as TrainingType,
                    preparationType: (t.preparationType || "ЗФП") as PreparationType,
                    loadLevel: (t.loadLevel || "С") as LoadLevel,
                  });
                  setShowModal(true);
                }}
                onRemove={() => removeTraining({ id: t._id })}
              />
            ))}
          </div>

          {/* Training Detail */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" /> Деталі тренування
            </h2>
            {selectedTraining ? (
              <TrainingDetailPanel
                training={selectedTraining}
                athletes={athletes}
                onAddAthletes={() => setShowAthletesModal(selectedTraining._id)}
                onAddCriteria={() => setShowCriteriaModal({ trainingId: selectedTraining._id })}
                onAddExerciseCriteria={(exerciseId) =>
                  setShowCriteriaModal({ trainingId: selectedTraining._id, exerciseId })
                }
                onAddExercise={() => setShowExerciseModal(selectedTraining._id)}
                onRemoveAthlete={(athleteId) => removeAthlete(selectedTraining._id, athleteId)}
                onRemoveCriterion={(criterionId, exerciseId) =>
                  removeCriterion(selectedTraining._id, criterionId, exerciseId)
                }
                onRemoveExercise={(exerciseId) => removeExercise(selectedTraining._id, exerciseId)}
              />
            ) : (
              <div className="glass-card p-12 text-center text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Оберіть тренування зі списку</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showModal && (
            <TrainingForm
              editingId={editingId}
              initialData={editingInitialData}
              onClose={() => { setShowModal(false); setEditingId(null); setEditingInitialData(null); }}
              onSaved={(id) => setSelectedId(id)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCriteriaModal && selectedTraining && (
            <CriteriaManager
              trainingId={showCriteriaModal.trainingId}
              exerciseId={showCriteriaModal.exerciseId}
              training={selectedTraining}
              onClose={() => setShowCriteriaModal(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAthletesModal && (
            <AthletesSelector
              trainingId={showAthletesModal}
              currentAthleteIds={trainings.find((t) => t._id === showAthletesModal)?.athleteIds ?? []}
              onClose={() => setShowAthletesModal(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showExerciseModal && selectedTraining && (
            <ExerciseManager
              trainingId={showExerciseModal}
              training={selectedTraining}
              onClose={() => setShowExerciseModal(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default TrainingPage;
