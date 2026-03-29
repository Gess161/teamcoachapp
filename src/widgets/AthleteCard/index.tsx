import { motion } from "framer-motion";
import { User, Edit2, Trash2, ChevronRight } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { cycleLabels } from "@/entities/athlete/constants";
import { getAge } from "@/entities/athlete/lib";
import type { CyclePhase, AthleteDoc } from "@/entities/athlete/types";
import type { MacroDoc } from "@/entities/macrocycle/types";
import MacroCycleBar from "@/widgets/MacroCycleBar";
import IGSColorBar from "@/shared/ui/IGSColorBar";

interface AthleteCardProps {
  athlete: AthleteDoc;
  activeMacro: MacroDoc | null;
  latestIGS: number | undefined;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTrainingClick: (e: React.MouseEvent) => void;
}

const AthleteCard = ({
  athlete,
  activeMacro,
  latestIGS,
  onSelect,
  onEdit,
  onDelete,
  onTrainingClick,
}: AthleteCardProps) => {
  const phase = (athlete.currentCyclePhase as CyclePhase) ?? "preparatory_general";
  const isInMacro = activeMacro?.athleteIds.includes(athlete._id as Id<"athletes">);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 space-y-4 group hover:glow-border transition-all duration-300 cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{athlete.name}</h3>
            <p className="text-sm text-muted-foreground">{athlete.specialization}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Вік</p>
          <p className="font-medium">{getAge(athlete.dateOfBirth)} р.</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Кваліфікація</p>
          <p className="font-medium">{athlete.qualification}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Кращий</p>
          <p className="font-medium text-primary">{athlete.bestResult ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Ціль</p>
          <p className="font-medium">{athlete.targetResult ?? "—"}</p>
        </div>
      </div>

      {activeMacro && isInMacro && (
        <div className="space-y-1">
          <MacroCycleBar macro={activeMacro} />
        </div>
      )}

      {latestIGS !== undefined && (
        <div className="space-y-2 p-3 rounded-lg bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">ІГС</span>
            <span className="text-sm font-semibold text-primary">{latestIGS}/100</span>
          </div>
          <IGSColorBar variant="compact" />
          <p className="text-xs text-muted-foreground text-center">
            {latestIGS >= 85 ? "Відмінна" : latestIGS >= 70 ? "Добра" : latestIGS >= 55 ? "Задовільна" : "Потребує роботи"}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onTrainingClick}
          className={`text-xs px-2 py-1 rounded-md font-medium hover:brightness-125 transition-all ${cycleLabels[phase]?.color ?? "bg-muted text-muted-foreground"}`}
          title="Тренування сьогодні"
        >
          {cycleLabels[phase]?.label ?? phase}
        </button>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.div>
  );
};

export default AthleteCard;
