import { useTranslation } from "react-i18next";
import { Plus, X, Star, Users, Dumbbell, Trash2 } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import CriterionBadge from "@/shared/ui/CriterionBadge";
import type { TrainingType } from "@/entities/training/types";
import { trainingTypes } from "@/entities/training/constants";

type AthleteDoc = { _id: Id<"athletes">; name: string; specialization?: string };

type TrainingFull = {
  _id: Id<"trainings">; name: string; type: string; description?: string;
  athleteIds: Id<"athletes">[];
  globalCriteria: { id: string; name: string; description?: string; scale: string; weight: number }[];
  exercises: {
    id: string; name: string; description?: string;
    sets: number; reps: string; restSeconds: number;
    criteria: { id: string; name: string; description?: string; scale: string; weight: number }[];
  }[];
  preparationType?: string;
  loadLevel?: string;
};

interface TrainingDetailPanelProps {
  training: TrainingFull;
  athletes: AthleteDoc[];
  onAddAthletes: () => void;
  onAddCriteria: () => void;
  onAddExerciseCriteria: (exerciseId: string) => void;
  onAddExercise: () => void;
  onRemoveAthlete: (athleteId: Id<"athletes">) => void;
  onRemoveCriterion: (criterionId: string, exerciseId?: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
}

const TrainingDetailPanel = ({
  training, athletes, onAddAthletes, onAddCriteria, onAddExerciseCriteria,
  onAddExercise, onRemoveAthlete, onRemoveCriterion, onRemoveExercise,
}: TrainingDetailPanelProps) => {
  const { t } = useTranslation(["training", "enums", "common"]);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{training.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${trainingTypes[training.type as TrainingType]?.color}`}>
            {t(`enums:trainingType.${training.type}`, trainingTypes[training.type as TrainingType]?.label ?? training.type)}
          </span>
        </div>
        {training.description && <p className="text-sm text-muted-foreground">{training.description}</p>}

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> {t("detail.participants", { count: training.athleteIds.length })}
            </p>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={onAddAthletes}>
              <Plus className="w-3 h-3" /> {t("common:actions.add")}
            </Button>
          </div>
          {training.athleteIds.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {training.athleteIds.map((athleteId) => {
                const athlete = athletes.find((a) => a._id === athleteId);
                return (
                  <div key={athleteId} className="flex items-center justify-between p-2 rounded bg-secondary/20">
                    <span className="text-sm">{athlete?.name || t("detail.unknown")}</span>
                    <button onClick={() => onRemoveAthlete(athleteId)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t("detail.noParticipants")}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Star className="w-4 h-4 text-chart-4" /> {t("detail.criteria")}
            </p>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={onAddCriteria}>
              <Plus className="w-3 h-3" /> {t("common:actions.add")}
            </Button>
          </div>
          {training.globalCriteria.map((c) => (
            <CriterionBadge key={c.id} criterion={c} onRemove={() => onRemoveCriterion(c.id)} />
          ))}
          {training.globalCriteria.length === 0 && (
            <p className="text-xs text-muted-foreground italic">{t("detail.noCriteria")}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {training.exercises.map((ex, i) => (
          <div key={ex.id} className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{ex.name}</p>
                  {ex.description && <p className="text-xs text-muted-foreground">{ex.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground font-mono">
                  {ex.sets}×{ex.reps} · {ex.restSeconds}с {t("rest")}
                </p>
                <button onClick={() => onRemoveExercise(ex.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="pl-10 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  {t("detail.exerciseCriteria")}
                </p>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-0.5 text-muted-foreground hover:text-foreground px-2" onClick={() => onAddExerciseCriteria(ex.id)}>
                  <Plus className="w-2.5 h-2.5" /> {t("detail.criterion")}
                </Button>
              </div>
              {ex.criteria.map((c) => (
                <CriterionBadge key={c.id} criterion={c} compact onRemove={() => onRemoveCriterion(c.id, ex.id)} />
              ))}
              {ex.criteria.length === 0 && (
                <p className="text-[11px] text-muted-foreground/60 italic">{t("detail.noCriterionForExercise")}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 space-y-2">
        <Button size="sm" variant="outline" onClick={onAddExercise} className="w-full gap-1">
          <Plus className="w-3 h-3" /> {t("detail.addExercise")}
        </Button>
      </div>
    </div>
  );
};

export default TrainingDetailPanel;
