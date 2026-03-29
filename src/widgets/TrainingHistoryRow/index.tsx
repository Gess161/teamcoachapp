import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History as HistoryIcon,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import type { MacroPhaseKey } from "@/entities/macrocycle/types";
import TrainingTypeModal from "@/widgets/TrainingTypeModal";
import AthleteProfileModal from "@/widgets/AthleteProfileModal";

const PREP_TYPE_COLORS: Record<string, string> = {
  ЗФП:          "bg-blue-500/20 text-blue-400",
  СФП:          "bg-violet-500/20 text-violet-400",
  Технічна:     "bg-yellow-500/20 text-yellow-400",
  Тактична:     "bg-orange-500/20 text-orange-400",
  Психологічна: "bg-pink-500/20 text-pink-400",
  Теоретична:   "bg-cyan-500/20 text-cyan-400",
  Змішана:      "bg-primary/20 text-primary",
};

const LOAD_LEVEL_COLORS: Record<string, string> = {
  В:  "bg-red-500/20 text-red-400",
  ЗН: "bg-orange-500/20 text-orange-400",
  С:  "bg-yellow-500/20 text-yellow-400",
  М:  "bg-green-500/20 text-green-400",
};

type TrainingRow = {
  _id: Id<"trainings">; name: string; date: string; status: string;
  preparationType?: string; loadLevel?: string; athleteIds: Id<"athletes">[];
  exercises: { id: string }[]; durationMinutes?: number;
};

type AthleteDoc = {
  _id: Id<"athletes">; name: string; dateOfBirth: string; gender: "male" | "female";
  sport: string; specialization: string; qualification: string; phone?: string; email?: string;
  height: number; weight: number; trainingAge: number; currentCyclePhase?: string;
  bestResult?: string; targetResult?: string; injuryNotes?: string; personalNotes?: string;
};

interface TrainingHistoryRowProps {
  training: TrainingRow;
  athleteMap: Map<string, AthleteDoc>;
  activeMacroPhase: MacroPhaseKey | null;
  index: number;
}

const TrainingHistoryRow = ({
  training,
  athleteMap,
  activeMacroPhase,
  index,
}: TrainingHistoryRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [profileAthlete, setProfileAthlete] = useState<AthleteDoc | null>(null);

  const participants = training.athleteIds
    .map((id) => athleteMap.get(id))
    .filter(Boolean) as AthleteDoc[];

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTypeModal(true)}
              className="flex items-center gap-2 hover:text-primary transition-colors text-left group"
              title="Переглянути типи підготовки"
            >
              <HistoryIcon className="w-4 h-4 text-primary/60 shrink-0 group-hover:text-primary" />
              <span className="font-medium text-sm underline-offset-2 group-hover:underline">
                {training.name}
              </span>
            </button>
            {participants.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="ml-1 text-muted-foreground hover:text-foreground"
                title="Учасники"
              >
                {expanded
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </td>
        <td className="px-5 py-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {training.date}
          </span>
        </td>
        <td className="px-5 py-4">
          {training.preparationType ? (
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 w-fit ${
                PREP_TYPE_COLORS[training.preparationType] ?? "bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Layers className="w-3 h-3" />{training.preparationType}
            </span>
          ) : (
            <button
              onClick={() => setShowTypeModal(true)}
              className="text-xs px-2 py-1 rounded-md border border-dashed border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              + Вказати тип
            </button>
          )}
        </td>
        <td className="px-5 py-4">
          {training.loadLevel ? (
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium w-fit block ${
                LOAD_LEVEL_COLORS[training.loadLevel] ?? "bg-secondary/50 text-muted-foreground"
              }`}
            >
              {training.loadLevel}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-5 py-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {training.athleteIds.length}
          </span>
        </td>
        <td className="px-5 py-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {training.exercises.length} вправ
            {training.durationMinutes && ` · ${training.durationMinutes} хв`}
          </span>
        </td>
        <td className="px-5 py-4">
          <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Завершено
          </span>
        </td>
      </motion.tr>

      <AnimatePresence>
        {expanded && participants.length > 0 && (
          <tr>
            <td colSpan={7} className="px-5 pb-3 pt-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-secondary/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Учасники ({participants.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((a) => (
                      <button
                        key={a._id}
                        onClick={() => setProfileAthlete(a)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <User className="w-3 h-3" />
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTypeModal && (
          <TrainingTypeModal
            training={training}
            activeMacroPhase={activeMacroPhase}
            onClose={() => setShowTypeModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileAthlete && (
          <AthleteProfileModal
            athlete={profileAthlete}
            onClose={() => setProfileAthlete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TrainingHistoryRow;
