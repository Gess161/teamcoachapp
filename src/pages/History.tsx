import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History as HistoryIcon,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  X,
  User,
  ChevronDown,
  ChevronRight,
  Activity,
  Info,
} from "lucide-react";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

// ─── Color maps ───────────────────────────────────────────────────────────────

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

const CYCLE_LABELS: Record<string, { label: string; color: string }> = {
  preparatory_general: { label: "Підг. загальний",   color: "bg-blue-500/10 text-blue-400" },
  preparatory_special: { label: "Підг. спеціальний", color: "bg-violet-500/10 text-violet-400" },
  pre_competitive:     { label: "Передзмагальний",   color: "bg-orange-500/10 text-orange-400" },
  competitive:         { label: "Змагальний",        color: "bg-yellow-500/10 text-yellow-400" },
  restorative:         { label: "Відновний",         color: "bg-green-500/10 text-green-400" },
  transitional:        { label: "Перехідний",        color: "bg-muted text-muted-foreground" },
};

import { PLATONOV_DISTRIBUTION, PHASE_NAMES, BAR_COLORS } from "@/entities/macrocycle/constants";
import type { MacroPhaseKey } from "@/entities/macrocycle/types";

// ─── Platonov: recommended type distribution per preparation phase ────────────

type PrepType = "ЗФП" | "СФП" | "Технічна" | "Тактична";

// ─── Training Type Analysis Modal ─────────────────────────────────────────────

const TrainingTypeModal = ({
  training,
  activeMacroPhase,
  onClose,
}: {
  training: {
    _id: Id<"trainings">;
    name: string;
    date: string;
    preparationType?: string;
  };
  activeMacroPhase: MacroPhaseKey | null;
  onClose: () => void;
}) => {
  const updateTraining = useMutation(api.trainings.update);
  const [selected, setSelected] = useState<PrepType | undefined>(
    training.preparationType as PrepType | undefined
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (type: PrepType) => {
    setSaving(true);
    await updateTraining({ id: training._id, preparationType: type });
    setSaving(false);
    onClose();
  };

  const ALL_PHASES = Object.keys(PLATONOV_DISTRIBUTION) as MacroPhaseKey[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl">{training.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{training.date} · Вид підготовки за Платоновим</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platonov distribution table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Рекомендований розподіл за Платоновим (% від тижневого обсягу)</p>
          </div>

          {ALL_PHASES.map((phase) => {
            const dist = PLATONOV_DISTRIBUTION[phase];
            const isCurrentPhase = phase === activeMacroPhase;
            return (
              <div
                key={phase}
                className={`rounded-lg p-4 space-y-3 ${isCurrentPhase ? "border border-primary/30 bg-primary/5" : "bg-secondary/20"}`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{PHASE_NAMES[phase]}</p>
                  {isCurrentPhase && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Поточна фаза
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {(Object.entries(dist) as [PrepType, number][]).map(([type, pct]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">{type}</span>
                      <div className="flex-1 bg-secondary/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${BAR_COLORS[type]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current + Select type */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Вид підготовки для цього тренування</p>
          {training.preparationType && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Зараз:</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${PREP_TYPE_COLORS[training.preparationType] ?? ""}`}>
                {training.preparationType}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["ЗФП", "СФП", "Технічна", "Тактична", "Психологічна", "Теоретична", "Змішана"] as const).map((type) => (
              <button
                key={type}
                disabled={saving}
                onClick={() => { setSelected(type as PrepType); handleSave(type as PrepType); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  selected === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Натисніть щоб змінити та зберегти</p>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">Закрити</Button>
      </motion.div>
    </div>
  );
};

// ─── Athlete Profile Modal ────────────────────────────────────────────────────

type AthleteDoc = {
  _id: Id<"athletes">; name: string; dateOfBirth: string; gender: "male" | "female";
  sport: string; specialization: string; qualification: string; phone?: string; email?: string;
  height: number; weight: number; trainingAge: number; currentCyclePhase?: string;
  bestResult?: string; targetResult?: string; injuryNotes?: string; personalNotes?: string;
};

const getAge = (dob: string) =>
  Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

const AthleteProfileModal = ({
  athlete,
  onClose,
}: {
  athlete: AthleteDoc;
  onClose: () => void;
}) => {
  const phase = athlete.currentCyclePhase ?? "preparatory_general";
  const cycleInfo = CYCLE_LABELS[phase] ?? { label: phase, color: "bg-muted text-muted-foreground" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-lg space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{athlete.name}</h2>
              <p className="text-muted-foreground text-sm">{athlete.specialization} · {athlete.qualification}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Вік", value: `${getAge(athlete.dateOfBirth)} р.` },
            { label: "Зріст", value: `${athlete.height} см` },
            { label: "Вага", value: `${athlete.weight} кг` },
            { label: "Стаж", value: `${athlete.trainingAge} р.` },
            { label: "Кращий результат", value: athlete.bestResult ?? "—" },
            { label: "Ціль", value: athlete.targetResult ?? "—" },
          ].map((c) => (
            <div key={c.label} className="glass-card p-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="font-semibold text-sm mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${cycleInfo.color}`}>
            {cycleInfo.label}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> {athlete.sport}
          </span>
          <span className="text-xs text-muted-foreground">
            {athlete.gender === "male" ? "♂ Чоловік" : "♀ Жінка"}
          </span>
        </div>

        {(athlete.injuryNotes || athlete.personalNotes) && (
          <div className="space-y-2">
            {athlete.injuryNotes && (
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground mb-1">Травми / обмеження</p>
                <p className="text-sm">{athlete.injuryNotes}</p>
              </div>
            )}
            {athlete.personalNotes && (
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground mb-1">Нотатки тренера</p>
                <p className="text-sm">{athlete.personalNotes}</p>
              </div>
            )}
          </div>
        )}

        {(athlete.phone || athlete.email) && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            {athlete.phone && <span>{athlete.phone}</span>}
            {athlete.email && <span>{athlete.email}</span>}
          </div>
        )}

        <Button variant="outline" onClick={onClose} className="w-full">Закрити</Button>
      </motion.div>
    </div>
  );
};

// ─── Training Row (expandable) ─────────────────────────────────────────────────

type TrainingRow = {
  _id: Id<"trainings">; name: string; date: string; status: string;
  preparationType?: string; loadLevel?: string; athleteIds: Id<"athletes">[];
  exercises: { id: string }[]; durationMinutes?: number;
};

const TrainingRowItem = ({
  training,
  athleteMap,
  activeMacroPhase,
  index,
}: {
  training: TrainingRow;
  athleteMap: Map<string, AthleteDoc>;
  activeMacroPhase: MacroPhaseKey | null;
  index: number;
}) => {
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
        {/* Training name — click for type analysis */}
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
            {/* expand athletes */}
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
            <span className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 w-fit ${PREP_TYPE_COLORS[training.preparationType] ?? "bg-secondary/50 text-muted-foreground"}`}>
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
            <span className={`text-xs px-2 py-1 rounded-md font-medium w-fit block ${LOAD_LEVEL_COLORS[training.loadLevel] ?? "bg-secondary/50 text-muted-foreground"}`}>
              {training.loadLevel}
            </span>
          ) : <span className="text-xs text-muted-foreground">—</span>}
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

      {/* Expanded: participants */}
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

      {/* Training type modal */}
      <AnimatePresence>
        {showTypeModal && (
          <TrainingTypeModal
            training={training}
            activeMacroPhase={activeMacroPhase}
            onClose={() => setShowTypeModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Athlete profile modal */}
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

// ─── Main History Page ─────────────────────────────────────────────────────────

const HistoryPage = () => {
  const trainings = useQuery(api.trainings.getAll) ?? [];
  const athletes  = useQuery(api.athletes.getAll) ?? [];
  const activeMacro = useQuery(api.macrocycles.getActive) ?? null;

  const athleteMap = useMemo(() => {
    const m = new Map<string, AthleteDoc>();
    for (const a of athletes) m.set(a._id, a);
    return m;
  }, [athletes]);

  // Compute current macro phase
  const activeMacroPhase = useMemo((): MacroPhaseKey | null => {
    if (!activeMacro) return null;
    const today = new Date().toISOString().split("T")[0];
    const { phases } = activeMacro;
    if (today >= phases.preparatoryGeneral.startDate && today <= phases.preparatoryGeneral.endDate)
      return "preparatory_general";
    if (today >= phases.preparatorySpecial.startDate && today <= phases.preparatorySpecial.endDate)
      return "preparatory_special";
    if (today >= phases.competitive.startDate && today <= phases.competitive.endDate)
      return "competitive";
    if (today >= phases.transitional.startDate && today <= phases.transitional.endDate)
      return "transitional";
    return null;
  }, [activeMacro]);

  const completed = useMemo(
    () => [...trainings]
      .filter((t) => t.status === "completed")
      .sort((a, b) => b.date.localeCompare(a.date)),
    [trainings]
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-display font-bold">Історія тренувань</h1>
          <p className="text-muted-foreground mt-1">
            {completed.length} записів · Клікніть назву тренування → аналіз типу підготовки · Клікніть → щоб розгорнути учасників
          </p>
        </div>

        {activeMacroPhase && (
          <div className="flex items-center gap-2 text-sm px-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">
              Поточна фаза:{" "}
              <span className="text-foreground font-medium">
                {PHASE_NAMES[activeMacroPhase]}
              </span>
            </span>
          </div>
        )}

        {completed.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Завершених тренувань ще немає</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Змініть статус тренування на «Завершено» у розділі Тренування
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {["Тренування", "Дата", "Вид підготовки", "Навантаження", "Спортсмени", "Тривалість", "Статус"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completed.map((t, i) => (
                    <TrainingRowItem
                      key={t._id}
                      training={t}
                      athleteMap={athleteMap}
                      activeMacroPhase={activeMacroPhase}
                      index={i}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default HistoryPage;
