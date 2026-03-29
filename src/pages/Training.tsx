import { useState } from "react";
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
  ListChecks,
  Users,
  Edit,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

import type { TrainingType, LoadLevel, PreparationType, Criterion, Exercise } from "@/entities/training/types";
import { trainingTypes, statusMap, scaleOptions, preparationTypes, loadLevels } from "@/entities/training/constants";

const TrainingPage = () => {
  const trainings = useQuery(api.trainings.getAll) ?? [];
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const dyushTests = useQuery(api.dyushTests.getAll, {}) ?? [];
  const createTraining = useMutation(api.trainings.create);
  const updateTraining = useMutation(api.trainings.update);
  const updateStatus = useMutation(api.trainings.updateStatus);
  const removeTraining = useMutation(api.trainings.remove);

  const [selectedId, setSelectedId] = useState<Id<"trainings"> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Id<"trainings"> | null>(null);
  const [showCriteriaModal, setShowCriteriaModal] = useState<{
    trainingId: Id<"trainings">;
    exerciseId?: string;
  } | null>(null);
  const [showAthletesModal, setShowAthletesModal] =
    useState<Id<"trainings"> | null>(null);
  const [showExerciseModal, setShowExerciseModal] =
    useState<Id<"trainings"> | null>(null);

  const [newTraining, setNewTraining] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
    type: "mixed" as TrainingType,
    preparationType: "ЗФП" as PreparationType,
    loadLevel: "С" as LoadLevel,
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

  const selectedTraining = selectedId
    ? (trainings.find((t) => t._id === selectedId) ?? null)
    : null;

  // ── Create training ──────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newTraining.name || !newTraining.date) return;

    if (editingId) {
      // Update existing training
      await updateTraining({
        id: editingId,
        name: newTraining.name,
        date: newTraining.date,
        time: newTraining.time || undefined,
        description: newTraining.description || undefined,
        type: newTraining.type,
        preparationType: newTraining.preparationType,
        loadLevel: newTraining.loadLevel,
      });
      setNewTraining({
        name: "",
        date: "",
        time: "",
        description: "",
        type: "mixed",
        preparationType: "ЗФП",
        loadLevel: "С",
      });
      setEditingId(null);
      setShowModal(false);
      toast({ title: "Тренування оновлено", description: newTraining.name });
    } else {
      // Create new training
      const id = await createTraining({
        name: newTraining.name,
        date: newTraining.date,
        time: newTraining.time || undefined,
        description: newTraining.description || undefined,
        type: newTraining.type,
        preparationType: newTraining.preparationType,
        loadLevel: newTraining.loadLevel,
        exercises: [],
        globalCriteria: [],
        athleteIds: [],
      });
      setNewTraining({
        name: "",
        date: "",
        time: "",
        description: "",
        type: "mixed",
        preparationType: "ЗФП",
        loadLevel: "С",
      });
      setShowModal(false);
      setSelectedId(id);
      toast({ title: "Тренування створено", description: newTraining.name });
    }
  };

  // ── Add exercise ─────────────────────────────────────────────────────────
  const addExercise = async (trainingId: Id<"trainings">) => {
    if (!newExercise.name) return;
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      description: newExercise.description || undefined,
      sets: Number(newExercise.sets) || 3,
      reps: newExercise.reps || "10",
      restSeconds: Number(newExercise.restSeconds) || 60,
      criteria: [],
    };
    await updateTraining({
      id: trainingId,
      exercises: [...training.exercises, ex],
    });
    setNewExercise({
      name: "",
      description: "",
      sets: "",
      reps: "",
      restSeconds: "",
    });
    toast({ title: "Вправу додано" });
  };

  // ── Remove exercise ──────────────────────────────────────────────────────
  const removeExercise = async (
    trainingId: Id<"trainings">,
    exerciseId: string,
  ) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    await updateTraining({
      id: trainingId,
      exercises: training.exercises.filter((e) => e.id !== exerciseId),
    });
  };

  // ── Add criterion ─────────────────────────────────────────────────────────
  const addCriterion = async () => {
    if (!newCriterion.name || !showCriteriaModal) return;
    const training = trainings.find(
      (t) => t._id === showCriteriaModal.trainingId,
    );
    if (!training) return;

    const criterion: Criterion = {
      id: Date.now().toString(),
      name: newCriterion.name,
      description: newCriterion.description || undefined,
      scale: newCriterion.scale,
      weight: Number(newCriterion.weight) || 3,
    };

    if (showCriteriaModal.exerciseId) {
      await updateTraining({
        id: showCriteriaModal.trainingId,
        exercises: training.exercises.map((e) =>
          e.id === showCriteriaModal.exerciseId
            ? { ...e, criteria: [...e.criteria, criterion] }
            : e,
        ),
      });
    } else {
      await updateTraining({
        id: showCriteriaModal.trainingId,
        globalCriteria: [...training.globalCriteria, criterion],
      });
    }
    setNewCriterion({ name: "", description: "", scale: "1-10", weight: "3" });
    toast({ title: "Критерій додано" });
  };

  // ── Remove criterion ──────────────────────────────────────────────────────
  const removeCriterion = async (
    trainingId: Id<"trainings">,
    criterionId: string,
    exerciseId?: string,
  ) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    if (exerciseId) {
      await updateTraining({
        id: trainingId,
        exercises: training.exercises.map((e) =>
          e.id === exerciseId
            ? { ...e, criteria: e.criteria.filter((c) => c.id !== criterionId) }
            : e,
        ),
      });
    } else {
      await updateTraining({
        id: trainingId,
        globalCriteria: training.globalCriteria.filter(
          (c) => c.id !== criterionId,
        ),
      });
    }
  };

  // ── Add/Remove athletes ───────────────────────────────────────────────────
  const addAthlete = async (
    trainingId: Id<"trainings">,
    athleteId: Id<"athletes">,
  ) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    if (training.athleteIds.includes(athleteId)) return;
    await updateTraining({
      id: trainingId,
      athleteIds: [...training.athleteIds, athleteId],
    });
    toast({ title: "Спортсмена додано до тренування" });
  };

  const removeAthlete = async (
    trainingId: Id<"trainings">,
    athleteId: Id<"athletes">,
  ) => {
    const training = trainings.find((t) => t._id === trainingId);
    if (!training) return;
    await updateTraining({
      id: trainingId,
      athleteIds: training.athleteIds.filter((id) => id !== athleteId),
    });
    toast({ title: "Спортсмена видалено" });
  };

  // ── Add exercise from DYUSH test ──────────────────────────────────────────
  const addExerciseFromTest = async (
    trainingId: Id<"trainings">,
    testId: Id<"dyush_tests">,
  ) => {
    const training = trainings.find((t) => t._id === trainingId);
    const test = dyushTests.find((t) => t._id === testId);
    if (!training || !test) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      name: test.name,
      description: test.description,
      sets: 1,
      reps: "1",
      restSeconds: 0,
      criteria: [],
    };
    await updateTraining({
      id: trainingId,
      exercises: [...training.exercises, ex],
    });
    setShowExerciseModal(null);
    toast({ title: `Вправу «${test.name}» додано` });
  };

  // ── Status changes ────────────────────────────────────────────────────────
  const startTraining = async (id: Id<"trainings">) => {
    await updateStatus({ id, status: "in_progress" });
    toast({ title: "Тренування розпочато!" });
  };

  const completeTraining = async (id: Id<"trainings">) => {
    await updateStatus({ id, status: "completed" });
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
            {trainings.length === 0 && (
              <div className="glass-card p-12 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Немає тренувань. Створіть перше!</p>
              </div>
            )}
            {trainings.map((t) => (
              <motion.div
                key={t._id}
                layout
                className={`glass-card p-5 space-y-3 cursor-pointer transition-all duration-300 ${selectedTraining?._id === t._id ? "glow-border" : "hover:border-border"}`}
                onClick={() => setSelectedId(t._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{t.name}</h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${trainingTypes[t.type as TrainingType]?.color ?? ""}`}
                    >
                      {trainingTypes[t.type as TrainingType]?.label}
                    </span>
                    {t.preparationType && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-secondary text-muted-foreground">
                        {t.preparationType}
                      </span>
                    )}
                    {t.loadLevel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-chart-4/10 text-chart-4">
                        {t.loadLevel}
                      </span>
                    )}
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
                  <span>{t.athleteIds.length} спортсменів</span>
                  {(t.globalCriteria.length > 0 ||
                    t.exercises.some((e) => e.criteria.length > 0)) && (
                    <span className="flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> критерії
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {t.status === "planned" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startTraining(t._id);
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
                        completeTraining(t._id);
                      }}
                      className="gap-1 bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 border-0"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Завершити
                    </Button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(t._id);
                      setNewTraining({
                        name: t.name,
                        date: t.date,
                        time: t.time || "",
                        description: t.description || "",
                        type: t.type,
                        preparationType: t.preparationType || "ЗФП",
                        loadLevel: t.loadLevel || "С",
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTraining({ id: t._id });
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Training Detail */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" /> Деталі тренування
            </h2>
            {selectedTraining ? (
              <div className="space-y-4">
                <div className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {selectedTraining.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${trainingTypes[selectedTraining.type as TrainingType]?.color}`}
                    >
                      {
                        trainingTypes[selectedTraining.type as TrainingType]
                          ?.label
                      }
                    </span>
                  </div>
                  {selectedTraining.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedTraining.description}
                    </p>
                  )}

                  {/* Athletes Section */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-400" /> Учасники (
                        {selectedTraining.athleteIds.length})
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowAthletesModal(selectedTraining._id)
                        }
                      >
                        <Plus className="w-3 h-3" /> Додати
                      </Button>
                    </div>
                    {selectedTraining.athleteIds.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedTraining.athleteIds.map((athleteId) => {
                          const athlete = athletes.find(
                            (a) => a._id === athleteId,
                          );
                          return (
                            <div
                              key={athleteId}
                              className="flex items-center justify-between p-2 rounded bg-secondary/20"
                            >
                              <span className="text-sm">
                                {athlete?.name || "Невідомий"}
                              </span>
                              <button
                                onClick={() =>
                                  removeAthlete(selectedTraining._id, athleteId)
                                }
                                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Спортсмени не додані
                      </p>
                    )}
                  </div>

                  {/* Global Criteria */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-chart-4" /> Критерії
                        оцінювання
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowCriteriaModal({
                            trainingId: selectedTraining._id,
                          })
                        }
                      >
                        <Plus className="w-3 h-3" /> Додати
                      </Button>
                    </div>
                    {selectedTraining.globalCriteria.map((c) => (
                      <CriterionBadge
                        key={c.id}
                        criterion={c}
                        onRemove={() =>
                          removeCriterion(selectedTraining._id, c.id)
                        }
                      />
                    ))}
                    {selectedTraining.globalCriteria.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Критерії не задані
                      </p>
                    )}
                  </div>
                </div>

                {/* Exercises */}
                <div className="space-y-3">
                  {selectedTraining.exercises.map((ex, i) => (
                    <div key={ex.id} className="glass-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{ex.name}</p>
                            {ex.description && (
                              <p className="text-xs text-muted-foreground">
                                {ex.description}
                              </p>
                            )}
                            {/* Exercise type badges */}
                            {(selectedTraining.type ||
                              selectedTraining.preparationType ||
                              selectedTraining.loadLevel) && (
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {selectedTraining.type && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${trainingTypes[selectedTraining.type as TrainingType]?.color ?? ""}`}
                                  >
                                    {
                                      trainingTypes[
                                        selectedTraining.type as TrainingType
                                      ]?.label
                                    }
                                  </span>
                                )}
                                {selectedTraining.preparationType && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-secondary text-muted-foreground">
                                    {selectedTraining.preparationType}
                                  </span>
                                )}
                                {selectedTraining.loadLevel && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-chart-4/10 text-chart-4">
                                    {selectedTraining.loadLevel}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground font-mono">
                            {ex.sets}×{ex.reps} · {ex.restSeconds}с відп.
                          </p>
                          <button
                            onClick={() =>
                              removeExercise(selectedTraining._id, ex.id)
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
                                trainingId: selectedTraining._id,
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
                              removeCriterion(selectedTraining._id, c.id, ex.id)
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
                    onClick={() => addExercise(selectedTraining._id)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 w-full"
                  >
                    <Plus className="w-3 h-3" /> Додати вправу вручну
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowExerciseModal(selectedTraining._id)}
                    className="w-full gap-1"
                  >
                    <Plus className="w-3 h-3" /> Додати з тестів ДЮСШ
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
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
                setNewTraining({
                  name: "",
                  date: "",
                  time: "",
                  description: "",
                  type: "mixed",
                  preparationType: "ЗФП",
                  loadLevel: "С",
                });
              }}
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
                    {editingId ? "Редагування тренування" : "Нове тренування"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setNewTraining({
                        name: "",
                        date: "",
                        time: "",
                        description: "",
                        type: "mixed",
                        preparationType: "ЗФП",
                        loadLevel: "С",
                      });
                    }}
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Тип
                      </Label>
                      <select
                        value={newTraining.type}
                        onChange={(e) =>
                          setNewTraining({
                            ...newTraining,
                            type: e.target.value as TrainingType,
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
                        Навантаження
                      </Label>
                      <select
                        value={newTraining.loadLevel}
                        onChange={(e) =>
                          setNewTraining({
                            ...newTraining,
                            loadLevel: e.target.value as LoadLevel,
                          })
                        }
                        className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                      >
                        {loadLevels.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Вид підготовки (Платонов)
                    </Label>
                    <select
                      value={newTraining.preparationType}
                      onChange={(e) =>
                        setNewTraining({
                          ...newTraining,
                          preparationType: e.target.value as PreparationType,
                        })
                      }
                      className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                    >
                      {preparationTypes.map((p) => (
                        <option key={p} value={p}>
                          {p}
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
                      Час (опціонально)
                    </Label>
                    <Input
                      type="time"
                      value={newTraining.time}
                      onChange={(e) =>
                        setNewTraining({ ...newTraining, time: e.target.value })
                      }
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">
                        Опис
                      </Label>
                      {newTraining.description && (
                        <button
                          onClick={() =>
                            setNewTraining({
                              ...newTraining,
                              description: "",
                            })
                          }
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Очистити
                        </button>
                      )}
                    </div>
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
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}
                    className="flex-1"
                  >
                    Скасувати
                  </Button>
                  <Button
                    onClick={handleCreate}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {editingId ? "Оновити" : "Створити"}
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
                    <Star className="w-5 h-5 text-chart-4" /> Новий критерій
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

        {/* Add Athletes Modal */}
        <AnimatePresence>
          {showAthletesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowAthletesModal(null)}
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
                    <Users className="w-5 h-5 text-blue-400" /> Додати
                    спортсменів
                  </h2>
                  <button
                    onClick={() => setShowAthletesModal(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {athletes.length > 0 ? (
                    athletes.map((athlete) => {
                      const isSelected = selectedTraining?.athleteIds.includes(
                        athlete._id,
                      );
                      return (
                        <div
                          key={athlete._id}
                          onClick={() => {
                            if (showAthletesModal && selectedTraining) {
                              if (isSelected) {
                                removeAthlete(showAthletesModal, athlete._id);
                              } else {
                                addAthlete(showAthletesModal, athlete._id);
                              }
                            }
                          }}
                          className={`p-3 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/20 border border-primary"
                              : "bg-secondary/30 border border-border/50 hover:border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {athlete.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {athlete.specialization}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Спортсменів не знайдено
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => setShowAthletesModal(null)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Готово
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Exercise from DYUSH Tests Modal */}
        <AnimatePresence>
          {showExerciseModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowExerciseModal(null)}
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
                    <ClipboardList className="w-5 h-5 text-primary" /> Тести
                    ДЮСШ
                  </h2>
                  <button
                    onClick={() => setShowExerciseModal(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
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
                        onClick={() => {
                          if (showExerciseModal) {
                            addExerciseFromTest(showExerciseModal, test._id);
                          }
                        }}
                        className="w-full text-left p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <p className="font-medium text-sm">{test.name}</p>
                        {test.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {test.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="bg-secondary px-2 py-0.5 rounded">
                            {test.unit}
                          </span>
                          <span className="bg-chart-4/10 text-chart-4 px-2 py-0.5 rounded">
                            {test.physicalQuality}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Тестів не знайдено
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

// ─── Helper component ────────────────────────────────────────────────────────

const CriterionBadge = ({
  criterion,
  compact,
  onRemove,
}: {
  criterion: Criterion;
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
