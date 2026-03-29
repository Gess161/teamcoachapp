import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Dumbbell, Save } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { TrainingDoc } from "@/entities/training/types";

const PREP_TYPE_LABELS: Record<string, string> = {
  ЗФП: "Загальна фізична підготовка",
  СФП: "Спеціальна фізична підготовка",
  Технічна: "Технічна підготовка",
  Тактична: "Тактична підготовка",
  Психологічна: "Психологічна підготовка",
  Теоретична: "Теоретична підготовка",
  Змішана: "Змішана підготовка",
};

const LOAD_COLORS: Record<string, string> = {
  В: "bg-red-500/20 text-red-400",
  ЗН: "bg-orange-500/20 text-orange-400",
  С: "bg-yellow-500/20 text-yellow-400",
  М: "bg-green-500/20 text-green-400",
};

const TodayTrainingModal = ({
  athleteId,
  athleteName,
  allTrainings,
  onClose,
}: {
  athleteId: Id<"athletes">;
  athleteName: string;
  allTrainings: TrainingDoc[];
  onClose: () => void;
}) => {
  const today = new Date().toISOString().split("T")[0];

  const activeTraining = useMemo(() => {
    const eligible = allTrainings
      .filter(
        (t) => t.athleteIds.includes(athleteId) && t.status !== "completed",
      )
      .sort((a, b) => a.date.localeCompare(b.date));
    return eligible.find((t) => t.date === today) ?? eligible[0] ?? null;
  }, [allTrainings, athleteId, today]);

  const existingSession = useQuery(
    api.trainingSessions.getByAthleteAndTraining,
    activeTraining ? { athleteId, trainingId: activeTraining._id } : "skip",
  );

  const [adjustments, setAdjustments] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && existingSession !== undefined) {
      setAdjustments(existingSession?.personalAdjustments ?? "");
      setCoachNotes(existingSession?.coachNotes ?? "");
      setInitialized(true);
    }
  }, [existingSession, initialized]);

  const createSession = useMutation(api.trainingSessions.create);
  const updateSession = useMutation(
    api.trainingSessions.updatePersonalAdjustments,
  );
  const { toast } = useToast();

  const handleSave = async () => {
    if (!activeTraining) return;
    if (existingSession) {
      await updateSession({
        id: existingSession._id,
        personalAdjustments: adjustments,
        coachNotes: coachNotes || undefined,
      });
    } else {
      await createSession({
        trainingId: activeTraining._id,
        athleteId,
        date: today,
        criteriaResults: [],
        exerciseResults: [],
        personalAdjustments: adjustments || undefined,
        coachNotes: coachNotes || undefined,
      });
    }
    toast({ description: `Корективи для ${athleteName} збережено` });
    onClose();
  };

  const isToday = activeTraining?.date === today;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-xl">
                {isToday ? "Тренування сьогодні" : "Наступне тренування"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Персональний план для {athleteName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!activeTraining ? (
          <div className="text-center py-8 space-y-2">
            <Dumbbell className="w-12 h-12 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground">
              Немає запланованих тренувань
            </p>
            <p className="text-sm text-muted-foreground/60">
              Додайте спортсмена до тренування у розділі «Тренування»
            </p>
          </div>
        ) : (
          <>
            {/* Training info */}
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{activeTraining.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTraining.date}
                    {activeTraining.durationMinutes &&
                      ` · ${activeTraining.durationMinutes} хв`}
                  </p>
                </div>
                {isToday && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium shrink-0">
                    Сьогодні
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {activeTraining.preparationType && (
                  <span className="text-xs px-2 py-1 rounded-md bg-secondary/60">
                    {PREP_TYPE_LABELS[activeTraining.preparationType] ??
                      activeTraining.preparationType}
                  </span>
                )}
                {activeTraining.loadLevel && (
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-medium ${LOAD_COLORS[activeTraining.loadLevel] ?? ""}`}
                  >
                    Навантаження: {activeTraining.loadLevel}
                  </span>
                )}
              </div>
              {activeTraining.description && (
                <p className="text-sm text-muted-foreground">
                  {activeTraining.description}
                </p>
              )}
            </div>

            {/* Exercises */}
            {activeTraining.exercises.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Вправи ({activeTraining.exercises.length})
                </p>
                <div className="space-y-1.5">
                  {activeTraining.exercises.map((ex, i) => (
                    <div
                      key={ex.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 text-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.sets} × {ex.reps}
                          {ex.restSeconds > 0 &&
                            ` · відпочинок ${ex.restSeconds}с`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal adjustments */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Персональні корективи для {athleteName}
              </label>
              <Textarea
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder="Зменшити навантаження на 20%, пропустити вправу 3 (травма), акцент на техніці..."
                className="bg-secondary/50 border-border/50 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Нотатки після тренування
              </label>
              <Textarea
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Спостереження під час тренування..."
                className="bg-secondary/50 border-border/50 min-h-[70px]"
              />
            </div>

            {existingSession && (
              <p className="text-xs text-primary/70 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Корективи вже збережено · {existingSession.date}
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Закрити
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="w-4 h-4" /> Зберегти корективи
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TodayTrainingModal;
