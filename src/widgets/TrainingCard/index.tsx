import { motion } from "framer-motion";
import { Play, CheckCircle2, Edit, Trash2, ListChecks } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import type { TrainingType, PreparationType, LoadLevel } from "@/entities/training/types";
import { trainingTypes, statusMap } from "@/entities/training/constants";

type TrainingItem = {
  _id: Id<"trainings">;
  name: string;
  date: string;
  time?: string;
  description?: string;
  type: string;
  status: string;
  preparationType?: string;
  loadLevel?: string;
  athleteIds: Id<"athletes">[];
  exercises: { id: string; criteria: unknown[] }[];
  globalCriteria: unknown[];
};

interface TrainingCardProps {
  training: TrainingItem;
  isSelected: boolean;
  onSelect: () => void;
  onStart: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

const TrainingCard = ({
  training: t,
  isSelected,
  onSelect,
  onStart,
  onComplete,
  onEdit,
  onRemove,
}: TrainingCardProps) => (
  <motion.div
    layout
    className={`glass-card p-5 space-y-3 cursor-pointer transition-all duration-300 ${
      isSelected ? "glow-border" : "hover:border-border"
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-semibold">{t.name}</h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${trainingTypes[t.type as TrainingType]?.color ?? ""}`}>
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
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusMap[t.status].color}`}>
        {statusMap[t.status].label}
      </span>
    </div>

    {t.description && (
      <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
    )}

    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span>{t.date}</span>
      <span>{t.exercises.length} вправ</span>
      <span>{t.athleteIds.length} спортсменів</span>
      {(t.globalCriteria.length > 0 || t.exercises.some((e) => e.criteria.length > 0)) && (
        <span className="flex items-center gap-1">
          <ListChecks className="w-3 h-3" /> критерії
        </span>
      )}
    </div>

    <div className="flex gap-2">
      {t.status === "planned" && (
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="w-3 h-3" /> Розпочати
        </Button>
      )}
      {t.status === "in_progress" && (
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="gap-1 bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 border-0"
        >
          <CheckCircle2 className="w-3 h-3" /> Завершити
        </Button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </motion.div>
);

export default TrainingCard;
