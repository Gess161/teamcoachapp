import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  scale: string;
  weight: number;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  restSeconds: number;
  criteria: EvaluationCriterion[];
}

interface Training {
  id: string;
  name: string;
  date: string;
  description: string;
  type: "strength" | "speed" | "endurance" | "technique" | "recovery" | "mixed";
  exercises: Exercise[];
  status: "planned" | "in_progress" | "completed";
  athleteCount: number;
  globalCriteria: EvaluationCriterion[];
}

interface Athlete {
  id: string;
  name: string;
  sport: string;
  specialization: string;
}

interface TrainingResultInput {
  criterionId: string;
  value: string | number | boolean;
}

interface AthleteTrainingResults {
  athleteId: string;
  athleteName: string;
  exerciseResults: Record<string, TrainingResultInput[]>;
  globalResults: TrainingResultInput[];
}

interface SessionResults {
  trainingId: string;
  results: AthleteTrainingResults[];
  recordedAt: string;
}

interface RecordingResultsModalProps {
  isOpen: boolean;
  trainings: Training[];
  athletes: Athlete[];
  onClose: () => void;
  onSave: (results: SessionResults) => void;
}

const RecordingResultsModal = ({
  isOpen,
  trainings,
  athletes,
  onClose,
  onSave,
}: RecordingResultsModalProps) => {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(
    null,
  );
  const [results, setResults] = useState<
    Record<string, Record<string, string | number | boolean>>
  >({});
  const { toast } = useToast();

  const completedTrainings = useMemo(
    () => trainings.filter((t) => t.status === "completed"),
    [trainings],
  );

  const selectedTraining = useMemo(
    () =>
      selectedTrainingId
        ? trainings.find((t) => t.id === selectedTrainingId)
        : null,
    [selectedTrainingId, trainings],
  );

  const trainingAthletes = useMemo(() => {
    if (!selectedTraining) return [];
    return athletes.slice(0, selectedTraining.athleteCount);
  }, [selectedTraining, athletes]);

  const handleTrainingSelect = (trainingId: string) => {
    setSelectedTrainingId(trainingId);
    setResults({});
  };

  const handleResultChange = (
    athleteId: string,
    criterionId: string,
    value: string | number | boolean,
  ) => {
    setResults((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [criterionId]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!selectedTraining) {
      toast({
        description: "Будь ласка, оберіть тренування",
        variant: "destructive",
      });
      return;
    }

    const sessionResults: SessionResults = {
      trainingId: selectedTraining.id,
      results: trainingAthletes.map((athlete) => ({
        athleteId: athlete.id,
        athleteName: athlete.name,
        exerciseResults: selectedTraining.exercises.reduce(
          (acc, exercise) => {
            acc[exercise.id] = exercise.criteria
              .map((criterion) => ({
                criterionId: criterion.id,
                value: results[athlete.id]?.[criterion.id] ?? "",
              }))
              .filter((r) => r.value !== "");
            return acc;
          },
          {} as Record<string, TrainingResultInput[]>,
        ),
        globalResults: selectedTraining.globalCriteria
          .map((criterion) => ({
            criterionId: criterion.id,
            value: results[athlete.id]?.[criterion.id] ?? "",
          }))
          .filter((r) => r.value !== ""),
      })),
      recordedAt: new Date().toISOString(),
    };

    onSave(sessionResults);
    toast({
      description: "Результати збережено успішно!",
    });
    setSelectedTrainingId(null);
    setResults({});
    onClose();
  };

  const renderInputField = (
    scale: string,
    value: string | number | boolean | undefined,
    onChange: (value: string | number | boolean) => void,
  ) => {
    const baseInputClass =
      "w-full px-2 py-1 bg-secondary/50 border border-primary/20 rounded text-sm";

    switch (scale) {
      case "1-5":
        return (
          <input
            type="number"
            min="1"
            max="5"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? parseInt(e.target.value) : "")
            }
            placeholder="-"
            className={baseInputClass}
          />
        );
      case "1-10":
        return (
          <input
            type="number"
            min="1"
            max="10"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? parseInt(e.target.value) : "")
            }
            placeholder="-"
            className={baseInputClass}
          />
        );
      case "1-100":
        return (
          <input
            type="number"
            min="1"
            max="100"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? parseInt(e.target.value) : "")
            }
            placeholder="-"
            className={baseInputClass}
          />
        );
      case "прохідний/непрохідний":
        return (
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">Не вибрано</option>
            <option value="pass">Виконано</option>
            <option value="fail">Не виконано</option>
          </select>
        );
      case "час (с)":
        return (
          <input
            type="number"
            step="0.1"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? parseFloat(e.target.value) : "")
            }
            placeholder="сек"
            className={baseInputClass}
          />
        );
      case "відстань (м)":
        return (
          <input
            type="number"
            step="0.1"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? parseFloat(e.target.value) : "")
            }
            placeholder="м"
            className={baseInputClass}
          />
        );
      case "вага (кг)":
        return (
          <input
            type="number"
            step="0.1"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? parseFloat(e.target.value) : "")
            }
            placeholder="кг"
            className={baseInputClass}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="-"
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <div className="glass-card max-w-6xl w-full max-h-[90vh] overflow-y-auto space-y-6 p-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">
                  Запис результатів тренування
                </h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Training Selection */}
              <div className="space-y-2">
                <Label htmlFor="training-select">
                  Оберіть завершену тренування
                </Label>
                <Select
                  value={selectedTrainingId || ""}
                  onValueChange={handleTrainingSelect}
                >
                  <SelectTrigger id="training-select">
                    <SelectValue placeholder="Виберіть тренування..." />
                  </SelectTrigger>
                  <SelectContent>
                    {completedTrainings.map((training) => (
                      <SelectItem key={training.id} value={training.id}>
                        {training.name} ({training.date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Table */}
              {selectedTraining && trainingAthletes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg">
                    Результати спортсменів
                  </h3>

                  <div className="overflow-x-auto rounded-lg border border-primary/10">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 border-b border-primary/10">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-secondary/50 z-10">
                            Спортсмен
                          </th>
                          {selectedTraining.exercises.map((exercise) => (
                            <th
                              key={exercise.id}
                              colSpan={exercise.criteria.length || 1}
                              className="px-4 py-3 text-center font-semibold border-r border-primary/10"
                            >
                              {exercise.name}
                            </th>
                          ))}
                          {selectedTraining.globalCriteria.length > 0 && (
                            <th
                              colSpan={selectedTraining.globalCriteria.length}
                              className="px-4 py-3 text-center font-semibold border-r border-primary/10"
                            >
                              Загальні критерії
                            </th>
                          )}
                        </tr>

                        {/* Criteria headers */}
                        <tr className="bg-secondary/30">
                          <th className="px-4 py-2 sticky left-0 bg-secondary/30 z-10" />
                          {selectedTraining.exercises.map((exercise) =>
                            exercise.criteria.map((criterion) => (
                              <th
                                key={criterion.id}
                                className="px-3 py-2 text-center text-xs border-r border-primary/10 text-muted-foreground"
                                title={criterion.description}
                              >
                                {criterion.name}
                                <div className="text-xs font-normal">
                                  ({criterion.scale})
                                </div>
                              </th>
                            )),
                          )}
                          {selectedTraining.globalCriteria.map((criterion) => (
                            <th
                              key={criterion.id}
                              className="px-3 py-2 text-center text-xs border-r border-primary/10 text-muted-foreground"
                              title={criterion.description}
                            >
                              {criterion.name}
                              <div className="text-xs font-normal">
                                ({criterion.scale})
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {trainingAthletes.map((athlete, idx) => (
                          <motion.tr
                            key={athlete.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-primary/5 hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium sticky left-0 bg-background z-10">
                              {athlete.name}
                            </td>

                            {/* Exercise criteria inputs */}
                            {selectedTraining.exercises.map((exercise) =>
                              exercise.criteria.map((criterion) => (
                                <td
                                  key={criterion.id}
                                  className="px-3 py-3 border-r border-primary/5"
                                >
                                  {renderInputField(
                                    criterion.scale,
                                    results[athlete.id]?.[criterion.id],
                                    (value) =>
                                      handleResultChange(
                                        athlete.id,
                                        criterion.id,
                                        value,
                                      ),
                                  )}
                                </td>
                              )),
                            )}

                            {/* Global criteria inputs */}
                            {selectedTraining.globalCriteria.map(
                              (criterion) => (
                                <td
                                  key={criterion.id}
                                  className="px-3 py-3 border-r border-primary/5"
                                >
                                  {renderInputField(
                                    criterion.scale,
                                    results[athlete.id]?.[criterion.id],
                                    (value) =>
                                      handleResultChange(
                                        athlete.id,
                                        criterion.id,
                                        value,
                                      ),
                                  )}
                                </td>
                              ),
                            )}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {selectedTraining && selectedTraining.exercises.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-4 text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>У цього тренування немає вправ</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-primary/10">
                <Button variant="outline" onClick={onClose}>
                  Скасувати
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!selectedTraining}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Зберегти результати
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecordingResultsModal;
