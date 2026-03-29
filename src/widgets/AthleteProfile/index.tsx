import { motion } from "framer-motion";
import { User, Edit2, Dumbbell, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import MacroCycleBar from "@/widgets/MacroCycleBar";
import IGSColorBar from "@/shared/ui/IGSColorBar";
import { cycleLabels } from "@/entities/athlete/constants";
import type { AthleteDoc, CyclePhase } from "@/entities/athlete/types";
import type { MacroDoc } from "@/entities/macrocycle/types";
import type { Id } from "../../../convex/_generated/dataModel";

export const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
      {label}
    </h3>
    {children}
  </div>
);

export const FF = ({
  label,
  value,
  onChange,
  placeholder,
  type,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  span?: number;
}) => {
  // Import inline to avoid circular deps — use standard HTML input styling
  return (
    <div className={`space-y-1.5 ${span === 2 ? "col-span-2" : ""}`}>
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
};

export const InfoCell = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`font-semibold ${highlight ? "text-primary" : ""}`}>
      {value}
    </p>
  </div>
);

const AthleteProfile = ({
  athlete,
  onEdit,
  getAge,
  activeMacro,
  latestIGSByAthlete,
  onOpenTodayTraining,
}: {
  athlete: AthleteDoc;
  onEdit: () => void;
  getAge: (dob: string) => number;
  activeMacro: MacroDoc | null;
  latestIGSByAthlete: Map<Id<"athletes">, number>;
  onOpenTodayTraining: () => void;
}) => {
  const phase =
    (athlete.currentCyclePhase as CyclePhase) ?? "preparatory_general";
  const isInMacro = activeMacro?.athleteIds.includes(athlete._id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">
                {athlete.name}
              </h2>
              <p className="text-muted-foreground">
                {athlete.specialization} · {athlete.qualification}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTodayTraining}
              className="gap-1"
            >
              <Dumbbell className="w-3 h-3" /> Тренування сьогодні
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-1"
            >
              <Edit2 className="w-3 h-3" /> Редагувати
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <InfoCell label="Вік" value={`${getAge(athlete.dateOfBirth)} р.`} />
          <InfoCell label="Зріст" value={`${athlete.height} см`} />
          <InfoCell label="Вага" value={`${athlete.weight} кг`} />
          <InfoCell label="Стаж" value={`${athlete.trainingAge} р.`} />
          <InfoCell
            label="Кращий"
            value={athlete.bestResult ?? "—"}
            highlight
          />
          <InfoCell label="Ціль" value={athlete.targetResult ?? "—"} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Поточна фаза
          </p>
          <span
            className={`inline-block text-sm px-3 py-1.5 rounded-md font-semibold ${cycleLabels[phase]?.color ?? "bg-muted text-muted-foreground"}`}
          >
            {cycleLabels[phase]?.label ?? phase}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>{athlete.sport}</span>
          </div>
          {activeMacro && isInMacro && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-2">
                {activeMacro.name}
              </p>
              <MacroCycleBar macro={activeMacro} />
            </div>
          )}
        </div>

        {latestIGSByAthlete.has(athlete._id) && (
          <div className="glass-card p-5 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Індекс готовності (ІГС)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-primary">
                {latestIGSByAthlete.get(athlete._id)}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <IGSColorBar variant="full" />
            <p className="text-sm text-muted-foreground">
              {(() => {
                const igs = latestIGSByAthlete.get(athlete._id);
                if (igs === undefined) return "";
                if (igs >= 85) return "Відмінна готовність до змагань";
                if (igs >= 70) return "Добра готовність";
                if (igs >= 55) return "Задовільна готовність";
                return "Потребує підготовки";
              })()}
            </p>
          </div>
        )}

        {(athlete.injuryNotes || athlete.personalNotes) && (
          <div className="glass-card p-5 space-y-3">
            {athlete.injuryNotes && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Травми / обмеження
                </p>
                <p className="text-sm">{athlete.injuryNotes}</p>
              </div>
            )}
            {athlete.personalNotes && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Нотатки тренера
                </p>
                <p className="text-sm">{athlete.personalNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {(athlete.phone || athlete.email) && (
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Контакти
          </p>
          <div className="flex gap-6 text-sm">
            {athlete.phone && <span>{athlete.phone}</span>}
            {athlete.email && (
              <span className="text-muted-foreground">{athlete.email}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AthleteProfile;
