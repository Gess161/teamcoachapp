import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Play,
  CheckCircle2,
  X,
  ClipboardList,
  Dumbbell,
  Star,
  Trash2,
  GripVertical,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  storage,
  type Training,
  type Exercise,
  type EvaluationCriterion,
} from "@/lib/storage";

const trainingTypes = {
  strength: { label: "Силове", color: "bg-chart-1/10 text-chart-1" },
  speed: { label: "Швидкісне", color: "bg-chart-4/10 text-chart-4" },
  endurance: { label: "Витривалість", color: "bg-chart-2/10 text-chart-2" },
  technique: { label: "Техніка", color: "bg-chart-5/10 text-chart-5" },
  recovery: { label: "Відновлення", color: "bg-chart-3/10 text-chart-3" },
  mixed: { label: "Змішане", color: "bg-muted text-muted-foreground" },
};

const statusMap = {
  planned: { label: "Заплановано", color: "bg-chart-2/10 text-chart-2" },
  in_progress: { label: "В процесі", color: "bg-chart-4/10 text-chart-4" },
  completed: { label: "Завершено", color: "bg-primary/10 text-primary" },
};

const scaleOptions = [
  "1-5",
  "1-10",
  "1-100",
  "прохідний/непрохідний",
  "час (с)",
  "відстань (м)",
  "вага (кг)",
];

const TrainingPage = () => {
  const [trainings, setTrainings] = useState<Training[]>(
    storage.getTrainings()
  );
  const [showModal, setShowModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState<{
    trainingId: string;
    exerciseId?: string;
  } | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  );
  const [newTraining, setNewTraining] = useState({
    name: "",
    date: "",
    description: "",
    type: "mixed" as Training["type"],
  });
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    sets: "",
    reps: "",
    restSeconds: "",
  });
  const [newCriterion, setNewCriterion] = useState({
    name: "",
    description: "",
    scale: "1-10",
    weight: "3",
  });
  const { toast } = useToast();

  // Keep selectedTraining in sync with trainings state
  const syncedSelectedTraining = selectedTraining
    ? trainings.find((t) => t.id === selectedTraining.id) || null
    : null;

  useEffect(() => {
    storage.setTrainings(trainings);
  }, [trainings]);

  const handleCreateTraining = () => {
    if (!newTraining.name || !newTraining.date) return;
    const t: Training = {
      id: Date.now().toString(),
      name: newTraining.name,
      date: newTraining.date,
      description: newTraining.description,
      type: newTraining.type,
      exercises: [],
      status: "planned",
      athleteCount: 0,
      globalCriteria: [],
    };
    setTrainings((prev) => [t, ...prev]);
    setNewTraining({ name: "", date: "", description: "", type: "mixed" });
    setShowModal(false);
    toast({ title: "Тренування створено", description: t.name });
  };

  const addExerciseToTraining = (trainingId: string) => {
    if (!newExercise.name) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      description: newExercise.description,
      sets: Number(newExercise.sets) || 3,
      reps: newExercise.reps || "10",
      restSeconds: Number(newExercise.restSeconds) || 60,
      criteria: [],
    };
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === trainingId ? { ...t, exercises: [...t.exercises, ex] } : t,
      ),
    );
    setNewExercise({
      name: "",
      description: "",
      sets: "",
      reps: "",
      restSeconds: "",
    });
    toast({ title: "Вправу додано" });
  };

  const removeExercise = (trainingId: string, exerciseId: string) => {
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === trainingId
          ? { ...t, exercises: t.exercises.filter((e) => e.id !== exerciseId) }
          : t,
      ),
    );
  };

  const addCriterion = () => {
    if (!newCriterion.name || !showCriteriaModal) return;
    const criterion: EvaluationCriterion = {
      id: Date.now().toString(),
      name: newCriterion.name,
      description: newCriterion.description,
      scale: newCriterion.scale,
      weight: Number(newCriterion.weight) || 3,
    };
    setTrainings((prev) =>
      prev.map((t) => {
        if (t.id !== showCriteriaModal.trainingId) return t;
        if (showCriteriaModal.exerciseId) {
          return {
            ...t,
            exercises: t.exercises.map((e) =>
              e.id === showCriteriaModal.exerciseId
                ? { ...e, criteria: [...e.criteria, criterion] }
                : e,
            ),
          };
        }
        return { ...t, globalCriteria: [...t.globalCriteria, criterion] };
      }),
    );
    setNewCriterion({ name: "", description: "", scale: "1-10", weight: "3" });
    toast({ title: "Критерій додано" });
  };

  const removeCriterion = (
    trainingId: string,
    criterionId: string,
    exerciseId?: string,
  ) => {
    setTrainings((prev) =>
      prev.map((t) => {
        if (t.id !== trainingId) return t;
        if (exerciseId) {
          return {
            ...t,
            exercises: t.exercises.map((e) =>
              e.id === exerciseId
                ? {
                    ...e,
                    criteria: e.criteria.filter((c) => c.id !== criterionId),
                  }
                : e,
            ),
          };
        }
        return {
          ...t,
          globalCriteria: t.globalCriteria.filter((c) => c.id !== criterionId),
        };
      }),
    );
  };

  const startTraining = (id: string) => {
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "in_progress" as const } : t,
      ),
    );
    toast({ title: "Тренування розпочато! 💪" });
  };

  const completeTraining = (id: string) => {
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "completed" as const } : t,
      ),
    );
    toast({ title: "Тренування завершено! ✅" });
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Тренування</h1>
            <p className="text-muted-foreground mt-1">
              Створюйте, оцінюйте та проводьте тренування
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
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
            {trainings.map((t) => (
              <motion.div
                key={t.id}
                layout
                className={`glass-card p-5 space-y-3 cursor-pointer transition-all duration-300 ${syncedSelectedTraining?.id === t.id ? "glow-border" : "hover:border-border"}`}
                onClick={() => setSelectedTraining(t)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${trainingTypes[t.type].color}`}
                    >
                      {trainingTypes[t.type].label}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-medium ${statusMap[t.status].color}`}
                  >
                    {statusMap[t.status].label}
                  </span>
                </div>
                {t.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {t.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{t.date}</span>
                  <span>{t.exercises.length} вправ</span>
                  <span>{t.athleteCount} спортсменів</span>
                  {(t.globalCriteria.length > 0 ||
                    t.exercises.some((e) => e.criteria.length > 0)) && (
                    <span className="flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> критерії
                    </span>
                  )}
                </div>
                {t.status === "planned" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startTraining(t.id);
                    }}
                    className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Play className="w-3 h-3" /> Розпочати
                  </Button>
                )}
                {t.status === "in_progress" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTraining(t.id);
                    }}
                    className="gap-1 bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 border-0"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Завершити
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Training Detail */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" /> Деталі тренування
            </h2>
            {syncedSelectedTraining ? (
              <div className="space-y-4">
                <div className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {syncedSelectedTraining.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${trainingTypes[syncedSelectedTraining.type].color}`}
                    >
                      {trainingTypes[syncedSelectedTraining.type].label}
                    </span>
                  </div>
                  {syncedSelectedTraining.description && (
                    <p className="text-sm text-muted-foreground">
                      {syncedSelectedTraining.description}
                    </p>
                  )}

                  {/* Global Criteria */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-chart-4" /> Критерії
                        оцінювання тренування
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowCriteriaModal({
                            trainingId: syncedSelectedTraining.id,
                          })
                        }
                      >
                        <Plus className="w-3 h-3" /> Додати
                      </Button>
                    </div>
                    {syncedSelectedTraining.globalCriteria.map((c) => (
                      <CriterionBadge
                        key={c.id}
                        criterion={c}
                        onRemove={() =>
                          removeCriterion(syncedSelectedTraining.id, c.id)
                        }
                      />
                    ))}
                    {syncedSelectedTraining.globalCriteria.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Критерії не задані
                      </p>
                    )}
                  </div>
                </div>

                {/* Exercises */}
                <div className="space-y-3">
                  {syncedSelectedTraining.exercises.map((ex, i) => (
                    <div key={ex.id} className="glass-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{ex.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ex.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground font-mono">
                            {ex.sets}×{ex.reps} · {ex.restSeconds}с відп.
                          </p>
                          <button
                            onClick={() =>
                              removeExercise(syncedSelectedTraining.id, ex.id)
                            }
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Exercise Criteria */}
                      <div className="pl-10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                            Критерії вправи
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] gap-0.5 text-muted-foreground hover:text-foreground px-2"
                            onClick={() =>
                              setShowCriteriaModal({
                                trainingId: syncedSelectedTraining.id,
                                exerciseId: ex.id,
                              })
                            }
                          >
                            <Plus className="w-2.5 h-2.5" /> Критерій
                          </Button>
                        </div>
                        {ex.criteria.map((c) => (
                          <CriterionBadge
                            key={c.id}
                            criterion={c}
                            compact
                            onRemove={() =>
                              removeCriterion(
                                syncedSelectedTraining.id,
                                c.id,
                                ex.id,
                              )
                            }
                          />
                        ))}
                        {ex.criteria.length === 0 && (
                          <p className="text-[11px] text-muted-foreground/60 italic">
                            Без критеріїв
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Exercise */}
                <div className="glass-card p-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Додати вправу
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Назва"
                      value={newExercise.name}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, name: e.target.value })
                      }
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Input
                      placeholder="Опис"
                      value={newExercise.description}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          description: e.target.value,
                        })
                      }
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Input
                      placeholder="Підходи"
                      type="number"
                      value={newExercise.sets}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, sets: e.target.value })
                      }
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Input
                      placeholder="Повтори/дистанція"
                      value={newExercise.reps}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, reps: e.target.value })
                      }
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Input
                      placeholder="Відпочинок (сек)"
                      type="number"
                      value={newExercise.restSeconds}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          restSeconds: e.target.value,
                        })
                      }
                      className="bg-secondary/50 border-border/50 text-sm col-span-2"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      addExerciseToTraining(syncedSelectedTraining.id)
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                  >
                    <Plus className="w-3 h-3" /> Додати
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Оберіть тренування зі списку</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Training Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="glass-card p-6 w-full max-w-md space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">
                    Нове тренування
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Назва
                    </Label>
                    <Input
                      placeholder="Силове тренування"
                      value={newTraining.name}
                      onChange={(e) =>
                        setNewTraining({ ...newTraining, name: e.target.value })
                      }
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Тип</Label>
                    <select
                      value={newTraining.type}
                      onChange={(e) =>
                        setNewTraining({
                          ...newTraining,
                          type: e.target.value as Training["type"],
                        })
                      }
                      className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                    >
                      {Object.entries(trainingTypes).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Дата
                    </Label>
                    <Input
                      type="date"
                      value={newTraining.date}
                      onChange={(e) =>
                        setNewTraining({ ...newTraining, date: e.target.value })
                      }
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Опис
                    </Label>
                    <Textarea
                      placeholder="Опис тренування..."
                      value={newTraining.description}
                      onChange={(e) =>
                        setNewTraining({
                          ...newTraining,
                          description: e.target.value,
                        })
                      }
                      className="bg-secondary/50 border-border/50 min-h-[60px]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Скасувати
                  </Button>
                  <Button
                    onClick={handleCreateTraining}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Створити
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Criterion Modal */}
        <AnimatePresence>
          {showCriteriaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowCriteriaModal(null)}
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
                    <Star className="w-5 h-5 text-chart-4" />
                    Новий критерій
                  </h2>
                  <button
                    onClick={() => setShowCriteriaModal(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {showCriteriaModal.exerciseId
                    ? "Критерій для конкретної вправи"
                    : "Загальний критерій тренування"}
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Назва критерію
                    </Label>
                    <Input
                      placeholder="Техніка виконання"
                      value={newCriterion.name}
                      onChange={(e) =>
                        setNewCriterion({
                          ...newCriterion,
                          name: e.target.value,
                        })
                      }
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Опис
                    </Label>
                    <Textarea
                      placeholder="Що саме оцінюється..."
                      value={newCriterion.description}
                      onChange={(e) =>
                        setNewCriterion({
                          ...newCriterion,
                          description: e.target.value,
                        })
                      }
                      className="bg-secondary/50 border-border/50 min-h-[50px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Шкала
                      </Label>
                      <select
                        value={newCriterion.scale}
                        onChange={(e) =>
                          setNewCriterion({
                            ...newCriterion,
                            scale: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                      >
                        {scaleOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Вага (1-5)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={newCriterion.weight}
                        onChange={(e) =>
                          setNewCriterion({
                            ...newCriterion,
                            weight: e.target.value,
                          })
                        }
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCriteriaModal(null)}
                    className="flex-1"
                  >
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
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

const CriterionBadge = ({
  criterion,
  compact,
  onRemove,
}: {
  criterion: EvaluationCriterion;
  compact?: boolean;
  onRemove: () => void;
}) => (
  <div
    className={`flex items-center justify-between rounded-lg bg-secondary/30 group/crit ${compact ? "px-3 py-1.5" : "px-3 py-2.5"}`}
  >
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex gap-0.5">
        {Array.from({ length: criterion.weight }).map((_, i) => (
          <Star
            key={i}
            className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} fill-chart-4 text-chart-4`}
          />
        ))}
      </div>
      <div className="min-w-0">
        <p
          className={`font-medium truncate ${compact ? "text-[11px]" : "text-xs"}`}
        >
          {criterion.name}
        </p>
        {!compact && criterion.description && (
          <p className="text-[10px] text-muted-foreground truncate">
            {criterion.description}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span
        className={`${compact ? "text-[10px]" : "text-[11px]"} text-muted-foreground font-mono`}
      >
        {criterion.scale}
      </span>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover/crit:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default TrainingPage;
