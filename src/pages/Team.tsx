import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, X, User, ChevronRight, Activity, Calendar, Layers, Dumbbell, Save } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type CyclePhase =
  | "preparatory_general" | "preparatory_special" | "pre_competitive"
  | "competitive" | "restorative" | "transitional";

const cycleLabels: Record<CyclePhase, { label: string; color: string }> = {
  preparatory_general:  { label: "Підг. загальний",   color: "bg-blue-500/10 text-blue-400" },
  preparatory_special:  { label: "Підг. спеціальний", color: "bg-violet-500/10 text-violet-400" },
  pre_competitive:      { label: "Передзмагальний",   color: "bg-orange-500/10 text-orange-400" },
  competitive:          { label: "Змагальний",         color: "bg-yellow-500/10 text-yellow-400" },
  restorative:          { label: "Відновний",          color: "bg-green-500/10 text-green-400" },
  transitional:         { label: "Перехідний",         color: "bg-muted text-muted-foreground" },
};

type FormState = {
  name: string; dateOfBirth: string; gender: "male" | "female"; sport: string;
  specialization: string; qualification: string; phone: string; email: string;
  height: string; weight: string; trainingAge: string; currentCyclePhase: CyclePhase;
  bestResult: string; targetResult: string; injuryNotes: string; personalNotes: string;
};

const emptyForm: FormState = {
  name: "", dateOfBirth: "", gender: "male", sport: "handball", specialization: "",
  qualification: "", phone: "", email: "", height: "", weight: "", trainingAge: "",
  currentCyclePhase: "preparatory_general", bestResult: "", targetResult: "",
  injuryNotes: "", personalNotes: "",
};

const getAge = (dob: string) =>
  Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

// ─── MacroCycle Bar ──────────────────────────────────────────────────────────

type MacroDoc = {
  _id: Id<"macrocycles">;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  phases: {
    preparatoryGeneral: { startDate: string; endDate: string; hoursPercent: number };
    preparatorySpecial: { startDate: string; endDate: string; hoursPercent: number };
    competitive:        { startDate: string; endDate: string; hoursPercent: number };
    transitional:       { startDate: string; endDate: string; hoursPercent: number };
  };
  athleteIds: Id<"athletes">[];
};

const PHASE_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-yellow-500",
  "bg-green-500",
];

const MacroCycleBar = ({ macro }: { macro: MacroDoc }) => {
  const today = new Date().toISOString().split("T")[0];
  const totalMs =
    new Date(macro.endDate).getTime() - new Date(macro.startDate).getTime();

  const phases = [
    { label: "ЗФП",   ...macro.phases.preparatoryGeneral },
    { label: "СФП",   ...macro.phases.preparatorySpecial },
    { label: "Змаг.", ...macro.phases.competitive },
    { label: "Перех.",...macro.phases.transitional },
  ];

  const todayMs = new Date(today).getTime() - new Date(macro.startDate).getTime();
  const todayPct = Math.max(0, Math.min(100, (todayMs / totalMs) * 100));
  const isInRange = today >= macro.startDate && today <= macro.endDate;

  return (
    <div className="space-y-1">
      <div className="relative flex h-2.5 rounded-full overflow-hidden">
        {phases.map((ph, i) => {
          const phMs =
            new Date(ph.endDate).getTime() - new Date(ph.startDate).getTime();
          const w = (phMs / totalMs) * 100;
          return (
            <div
              key={i}
              className={`${PHASE_COLORS[i]} opacity-70`}
              style={{ width: `${w}%` }}
              title={`${ph.label}: ${ph.startDate} – ${ph.endDate}`}
            />
          );
        })}
        {isInRange && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10"
            style={{ left: `${todayPct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{macro.startDate.substring(0, 7)}</span>
        <span>{macro.endDate.substring(0, 7)}</span>
      </div>
    </div>
  );
};

// ─── Today's Training Modal ──────────────────────────────────────────────────

type TrainingDoc = {
  _id: Id<"trainings">; name: string; date: string; status: string;
  preparationType?: string; loadLevel?: string; athleteIds: Id<"athletes">[];
  exercises: { id: string; name: string; sets: number; reps: string; restSeconds: number }[];
  durationMinutes?: number; description?: string;
};

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
      .filter((t) => t.athleteIds.includes(athleteId) && t.status !== "completed")
      .sort((a, b) => a.date.localeCompare(b.date));
    return eligible.find((t) => t.date === today) ?? eligible[0] ?? null;
  }, [allTrainings, athleteId, today]);

  const existingSession = useQuery(
    api.trainingSessions.getByAthleteAndTraining,
    activeTraining ? { athleteId, trainingId: activeTraining._id } : "skip"
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
  const updateSession = useMutation(api.trainingSessions.updatePersonalAdjustments);
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
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!activeTraining ? (
          <div className="text-center py-8 space-y-2">
            <Dumbbell className="w-12 h-12 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground">Немає запланованих тренувань</p>
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
                    {activeTraining.durationMinutes && ` · ${activeTraining.durationMinutes} хв`}
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
                    {PREP_TYPE_LABELS[activeTraining.preparationType] ?? activeTraining.preparationType}
                  </span>
                )}
                {activeTraining.loadLevel && (
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${LOAD_COLORS[activeTraining.loadLevel] ?? ""}`}>
                    Навантаження: {activeTraining.loadLevel}
                  </span>
                )}
              </div>
              {activeTraining.description && (
                <p className="text-sm text-muted-foreground">{activeTraining.description}</p>
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
                    <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.sets} × {ex.reps}
                          {ex.restSeconds > 0 && ` · відпочинок ${ex.restSeconds}с`}
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
              <Button variant="outline" onClick={onClose} className="flex-1">Закрити</Button>
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

// ─── MacroCycle Tab ──────────────────────────────────────────────────────────

const defaultPhases = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const total = e - s;
  const fmt = (ms: number) => new Date(ms).toISOString().split("T")[0];
  return {
    preparatoryGeneral: { startDate: start, endDate: fmt(s + total * 0.28), hoursPercent: 28 },
    preparatorySpecial: { startDate: fmt(s + total * 0.28), endDate: fmt(s + total * 0.56), hoursPercent: 28 },
    competitive:        { startDate: fmt(s + total * 0.56), endDate: fmt(s + total * 0.92), hoursPercent: 36 },
    transitional:       { startDate: fmt(s + total * 0.92), endDate: end,                   hoursPercent: 8 },
  };
};

type MacroForm = {
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  totalHoursPlanned: string;
  pg_start: string; pg_end: string;
  ps_start: string; ps_end: string;
  comp_start: string; comp_end: string;
  trans_start: string; trans_end: string;
};

const emptyMacroForm = (): MacroForm => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 8, 1).toISOString().split("T")[0]; // Sep 1
  const end   = new Date(now.getFullYear() + 1, 7, 31).toISOString().split("T")[0]; // Aug 31 next year
  const ph = defaultPhases(start, end);
  return {
    name: `${now.getFullYear()}-${now.getFullYear() + 1} Сезон`,
    sport: "handball", startDate: start, endDate: end,
    totalHoursPlanned: "300",
    pg_start: ph.preparatoryGeneral.startDate, pg_end: ph.preparatoryGeneral.endDate,
    ps_start: ph.preparatorySpecial.startDate, ps_end: ph.preparatorySpecial.endDate,
    comp_start: ph.competitive.startDate,      comp_end: ph.competitive.endDate,
    trans_start: ph.transitional.startDate,    trans_end: ph.transitional.endDate,
  };
};

const MacroCycleTab = ({ athletes }: { athletes: { _id: Id<"athletes">; name: string }[] }) => {
  const macrocycles = useQuery(api.macrocycles.getAll) ?? [];
  const activeMacro = macrocycles.find((m) => m.isActive);
  const createMacro = useMutation(api.macrocycles.create);
  const updateMacro = useMutation(api.macrocycles.update);
  const deactivate  = useMutation(api.macrocycles.deactivate);
  const updateAthlete = useMutation(api.athletes.update);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MacroForm>(emptyMacroForm);
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<Id<"macrocycles"> | null>(null);

  const f = (k: keyof MacroForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const recalcPhases = (start: string, end: string) => {
    if (!start || !end) return;
    const ph = defaultPhases(start, end);
    setForm((p) => ({
      ...p, startDate: start, endDate: end,
      pg_start: ph.preparatoryGeneral.startDate, pg_end: ph.preparatoryGeneral.endDate,
      ps_start: ph.preparatorySpecial.startDate, ps_end: ph.preparatorySpecial.endDate,
      comp_start: ph.competitive.startDate,      comp_end: ph.competitive.endDate,
      trans_start: ph.transitional.startDate,    trans_end: ph.transitional.endDate,
    }));
  };

  const toggleAthlete = (id: string) => {
    setSelectedAthletes((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyMacroForm());
    setSelectedAthletes(new Set());
    setShowForm(true);
  };

  const handleOpenEdit = (m: typeof macrocycles[0]) => {
    setEditingId(m._id);
    setForm({
      name: m.name, sport: m.sport, startDate: m.startDate, endDate: m.endDate,
      totalHoursPlanned: m.totalHoursPlanned ? String(m.totalHoursPlanned) : "",
      pg_start: m.phases.preparatoryGeneral.startDate, pg_end: m.phases.preparatoryGeneral.endDate,
      ps_start: m.phases.preparatorySpecial.startDate, ps_end: m.phases.preparatorySpecial.endDate,
      comp_start: m.phases.competitive.startDate,      comp_end: m.phases.competitive.endDate,
      trans_start: m.phases.transitional.startDate,    trans_end: m.phases.transitional.endDate,
    });
    setSelectedAthletes(new Set(m.athleteIds));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const phases = {
      preparatoryGeneral: { startDate: form.pg_start, endDate: form.pg_end, hoursPercent: 28 },
      preparatorySpecial: { startDate: form.ps_start, endDate: form.ps_end, hoursPercent: 28 },
      competitive:        { startDate: form.comp_start, endDate: form.comp_end, hoursPercent: 36 },
      transitional:       { startDate: form.trans_start, endDate: form.trans_end, hoursPercent: 8 },
    };
    const athleteIds = Array.from(selectedAthletes) as Id<"athletes">[];
    let macroId: Id<"macrocycles">;
    if (editingId) {
      await updateMacro({ id: editingId, name: form.name, startDate: form.startDate,
        endDate: form.endDate, phases, athleteIds,
        totalHoursPlanned: form.totalHoursPlanned ? Number(form.totalHoursPlanned) : undefined });
      macroId = editingId;
      toast({ description: "Макроцикл оновлено" });
    } else {
      macroId = await createMacro({
        name: form.name, sport: form.sport, startDate: form.startDate, endDate: form.endDate,
        phases, athleteIds,
        totalHoursPlanned: form.totalHoursPlanned ? Number(form.totalHoursPlanned) : undefined,
      });
      toast({ description: "Макроцикл створено" });
    }
    // Link athletes
    for (const id of athleteIds) {
      await updateAthlete({ id, macroCycleId: macroId });
    }
    setShowForm(false);
  };

  const PHASE_LABELS = [
    { key: "pg",   label: "ЗФП — Загальна фізична підготовка",   color: "bg-blue-500/20 border-blue-500/30" },
    { key: "ps",   label: "СФП — Спеціальна фізична підготовка", color: "bg-violet-500/20 border-violet-500/30" },
    { key: "comp", label: "Змагальний період",                    color: "bg-yellow-500/20 border-yellow-500/30" },
    { key: "trans",label: "Перехідний період",                    color: "bg-green-500/20 border-green-500/30" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">Макроцикл</h2>
          <p className="text-sm text-muted-foreground">Річний план підготовки</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Новий макроцикл
        </Button>
      </div>

      {/* Active macrocycle preview */}
      {activeMacro && !showForm && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-semibold">{activeMacro.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeMacro.startDate} → {activeMacro.endDate}
                {activeMacro.totalHoursPlanned && ` · ${activeMacro.totalHoursPlanned} год.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleOpenEdit(activeMacro)}>
                Редагувати
              </Button>
              <Button
                variant="ghost" size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => { deactivate({ id: activeMacro._id }); toast({ description: "Деактивовано" }); }}
              >
                Деактивувати
              </Button>
            </div>
          </div>

          <MacroCycleBar macro={activeMacro} />

          {/* Phase legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: "ЗФП", color: "bg-blue-500",   start: activeMacro.phases.preparatoryGeneral.startDate, end: activeMacro.phases.preparatoryGeneral.endDate },
              { label: "СФП", color: "bg-violet-500", start: activeMacro.phases.preparatorySpecial.startDate, end: activeMacro.phases.preparatorySpecial.endDate },
              { label: "Змагальний", color: "bg-yellow-500", start: activeMacro.phases.competitive.startDate, end: activeMacro.phases.competitive.endDate },
              { label: "Перехідний", color: "bg-green-500",  start: activeMacro.phases.transitional.startDate, end: activeMacro.phases.transitional.endDate },
            ].map((ph) => (
              <div key={ph.label} className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${ph.color}`} />
                <div>
                  <p className="font-medium">{ph.label}</p>
                  <p className="text-muted-foreground">{ph.start.substring(5)} – {ph.end.substring(5)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assigned athletes */}
          {activeMacro.athleteIds.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Спортсмени ({activeMacro.athleteIds.length})</p>
              <div className="flex flex-wrap gap-1">
                {activeMacro.athleteIds.map((id) => {
                  const a = athletes.find((x) => x._id === id);
                  return a ? (
                    <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {a.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past macrocycles */}
      {!showForm && macrocycles.filter((m) => !m.isActive).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Архів</p>
          {macrocycles.filter((m) => !m.isActive).map((m) => (
            <div key={m._id} className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.startDate} → {m.endDate}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(m)}>Переглянути</Button>
            </div>
          ))}
        </div>
      )}

      {macrocycles.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">Макроциклів ще немає</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Створіть річний план підготовки</p>
        </div>
      )}

      {/* Create / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">
                  {editingId ? "Редагувати макроцикл" : "Новий макроцикл"}
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Назва</Label>
                  <Input value={form.name} onChange={(e) => f("name", e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Початок сезону</Label>
                  <Input type="date" value={form.startDate}
                    onChange={(e) => recalcPhases(e.target.value, form.endDate)}
                    className="bg-secondary/50 border-border/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Кінець сезону</Label>
                  <Input type="date" value={form.endDate}
                    onChange={(e) => recalcPhases(form.startDate, e.target.value)}
                    className="bg-secondary/50 border-border/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Плановий обсяг (год.)</Label>
                  <Input type="number" value={form.totalHoursPlanned} onChange={(e) => f("totalHoursPlanned", e.target.value)} className="bg-secondary/50 border-border/50" placeholder="300" />
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Фази підготовки</p>
                {PHASE_LABELS.map((ph) => (
                  <div key={ph.key} className={`rounded-lg border p-3 space-y-2 ${ph.color}`}>
                    <p className="text-xs font-medium">{ph.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Початок</Label>
                        <Input type="date" value={form[`${ph.key}_start`]}
                          onChange={(e) => f(`${ph.key}_start`, e.target.value)}
                          className="bg-background/50 border-border/30 h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Кінець</Label>
                        <Input type="date" value={form[`${ph.key}_end`]}
                          onChange={(e) => f(`${ph.key}_end`, e.target.value)}
                          className="bg-background/50 border-border/30 h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Athletes */}
              {athletes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Спортсмени ({selectedAthletes.size} обрано)
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                    {athletes.map((a) => (
                      <label key={a._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedAthletes.has(a._id)}
                          onChange={() => toggleAthlete(a._id)}
                          className="accent-primary"
                        />
                        {a.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Скасувати</Button>
                <Button onClick={handleSave} className="flex-1">
                  {editingId ? "Зберегти" : "Створити"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Team Page ──────────────────────────────────────────────────────────

const Team = () => {
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const allTrainings = (useQuery(api.trainings.getAll) ?? []) as TrainingDoc[];
  const activeMacro = useQuery(api.macrocycles.getActive) ?? null;
  const createAthlete = useMutation(api.athletes.create);
  const updateAthlete = useMutation(api.athletes.update);
  const removeAthlete = useMutation(api.athletes.remove);

  const [tab, setTab] = useState<"athletes" | "macrocycle">("athletes");
  const [search, setSearch] = useState("");
  const [todayModalAthlete, setTodayModalAthlete] = useState<{ id: Id<"athletes">; name: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"athletes"> | null>(null);
  const [editingId, setEditingId] = useState<Id<"athletes"> | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { toast } = useToast();

  const filtered = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAthlete = selectedId ? athletes.find((a) => a._id === selectedId) ?? null : null;

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a: typeof athletes[0]) => {
    setEditingId(a._id);
    setForm({
      name: a.name, dateOfBirth: a.dateOfBirth, gender: a.gender,
      sport: a.sport, specialization: a.specialization, qualification: a.qualification,
      phone: a.phone ?? "", email: a.email ?? "",
      height: String(a.height), weight: String(a.weight), trainingAge: String(a.trainingAge),
      currentCyclePhase: (a.currentCyclePhase as CyclePhase) ?? "preparatory_general",
      bestResult: a.bestResult ?? "", targetResult: a.targetResult ?? "",
      injuryNotes: a.injuryNotes ?? "", personalNotes: a.personalNotes ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const payload = {
      name: form.name, dateOfBirth: form.dateOfBirth, gender: form.gender,
      sport: form.sport, specialization: form.specialization, qualification: form.qualification,
      phone: form.phone || undefined, email: form.email || undefined,
      height: Number(form.height) || 0, weight: Number(form.weight) || 0,
      trainingAge: Number(form.trainingAge) || 0,
      bestResult: form.bestResult || undefined, targetResult: form.targetResult || undefined,
      injuryNotes: form.injuryNotes || undefined, personalNotes: form.personalNotes || undefined,
    };
    if (editingId) {
      await updateAthlete({ id: editingId, ...payload, currentCyclePhase: form.currentCyclePhase });
      toast({ description: `${form.name} оновлено` });
    } else {
      await createAthlete(payload);
      toast({ description: `${form.name} додано до команди` });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: Id<"athletes">, name: string) => {
    await removeAthlete({ id });
    if (selectedId === id) setSelectedId(null);
    toast({ description: `${name} видалено з команди` });
  };

  // Auto-compute current phase from activeMacro for each athlete card
  const computeCurrentPhase = useMemo(() => {
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

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Команда</h1>
            <p className="text-muted-foreground mt-1">{athletes.length} спортсменів</p>
          </div>
          <div className="flex gap-2">
            {selectedAthlete && (
              <Button variant="outline" onClick={() => setSelectedId(null)}>← До списку</Button>
            )}
            {tab === "athletes" && !selectedAthlete && (
              <Button onClick={openAdd} className="gap-2">
                <Plus className="w-4 h-4" /> Додати спортсмена
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {!selectedAthlete && (
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
            {(["athletes", "macrocycle"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "athletes" ? <><User className="w-4 h-4" /> Спортсмени</> : <><Layers className="w-4 h-4" /> Макроцикл</>}
              </button>
            ))}
          </div>
        )}

        {/* Macrocycle Tab */}
        {tab === "macrocycle" && !selectedAthlete && (
          <MacroCycleTab athletes={athletes} />
        )}

        {/* Athletes Tab */}
        {(tab === "athletes" || selectedAthlete) && (
          <>
            {!selectedAthlete && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук за ім'ям або спеціалізацією..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50 h-11"
                />
              </div>
            )}

            {selectedAthlete ? (
              <AthleteProfile athlete={selectedAthlete} onEdit={() => openEdit(selectedAthlete)} getAge={getAge} activeMacro={activeMacro} onOpenTodayTraining={() => setTodayModalAthlete({ id: selectedAthlete._id, name: selectedAthlete.name })} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search ? "Нікого не знайдено" : "Додайте першого спортсмена"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((a) => {
                  const phase = (a.currentCyclePhase as CyclePhase) ?? computeCurrentPhase ?? "preparatory_general";
                  const isInMacro = activeMacro?.athleteIds.includes(a._id);
                  return (
                    <motion.div
                      key={a._id} layout
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-5 space-y-4 group hover:glow-border transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedId(a._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{a.name}</h3>
                            <p className="text-sm text-muted-foreground">{a.specialization}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(a._id, a.name); }}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><p className="text-muted-foreground text-xs">Вік</p><p className="font-medium">{getAge(a.dateOfBirth)} р.</p></div>
                        <div><p className="text-muted-foreground text-xs">Кваліфікація</p><p className="font-medium">{a.qualification}</p></div>
                        <div><p className="text-muted-foreground text-xs">Кращий</p><p className="font-medium text-primary">{a.bestResult ?? "—"}</p></div>
                        <div><p className="text-muted-foreground text-xs">Ціль</p><p className="font-medium">{a.targetResult ?? "—"}</p></div>
                      </div>

                      {/* MacroCycleBar on card */}
                      {activeMacro && isInMacro && (
                        <div className="space-y-1">
                          <MacroCycleBar macro={activeMacro} />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTodayModalAthlete({ id: a._id, name: a.name });
                          }}
                          className={`text-xs px-2 py-1 rounded-md font-medium hover:brightness-125 transition-all ${cycleLabels[phase as CyclePhase]?.color ?? "bg-muted text-muted-foreground"}`}
                          title="Тренування сьогодні"
                        >
                          {cycleLabels[phase as CyclePhase]?.label ?? phase}
                        </button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Today's Training Modal */}
        <AnimatePresence>
          {todayModalAthlete && (
            <TodayTrainingModal
              athleteId={todayModalAthlete.id}
              athleteName={todayModalAthlete.name}
              allTrainings={allTrainings}
              onClose={() => setTodayModalAthlete(null)}
            />
          )}
        </AnimatePresence>

        {/* Athlete Form Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">{editingId ? "Редагувати" : "Новий спортсмен"}</h2>
                  <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
                </div>

                <div className="space-y-6">
                  <Section label="Особисті дані">
                    <div className="grid grid-cols-2 gap-3">
                      <FF label="ПІБ" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Олена Коваленко" span={2} />
                      <FF label="Дата народження" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} type="date" />
                      <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Стать</Label>
                        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
                          className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
                          <option value="male">Чоловіча</option>
                          <option value="female">Жіноча</option>
                        </select>
                      </div>
                      <FF label="Телефон" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+380..." />
                      <FF label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="email@mail.com" />
                    </div>
                  </Section>
                  <Section label="Фізичні дані">
                    <div className="grid grid-cols-3 gap-3">
                      <FF label="Зріст (см)" value={form.height} onChange={(v) => setForm({ ...form, height: v })} type="number" placeholder="170" />
                      <FF label="Вага (кг)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} type="number" placeholder="65" />
                      <FF label="Стаж (років)" value={form.trainingAge} onChange={(v) => setForm({ ...form, trainingAge: v })} type="number" placeholder="4" />
                    </div>
                  </Section>
                  <Section label="Спортивні дані">
                    <div className="grid grid-cols-2 gap-3">
                      <FF label="Вид спорту" value={form.sport} onChange={(v) => setForm({ ...form, sport: v })} placeholder="Гандбол" />
                      <FF label="Спеціалізація" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} placeholder="Лівий крайній" />
                      <FF label="Кваліфікація" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} placeholder="КМС" />
                      <FF label="Кращий результат" value={form.bestResult} onChange={(v) => setForm({ ...form, bestResult: v })} placeholder="—" />
                      <FF label="Цільовий результат" value={form.targetResult} onChange={(v) => setForm({ ...form, targetResult: v })} placeholder="—" />
                    </div>
                  </Section>
                  <Section label="Тренувальний цикл">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Поточна фаза підготовки</Label>
                      <select value={form.currentCyclePhase} onChange={(e) => setForm({ ...form, currentCyclePhase: e.target.value as CyclePhase })}
                        className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
                        <option value="preparatory_general">Підготовчий загальний</option>
                        <option value="preparatory_special">Підготовчий спеціальний</option>
                        <option value="pre_competitive">Передзмагальний</option>
                        <option value="competitive">Змагальний</option>
                        <option value="restorative">Відновний</option>
                        <option value="transitional">Перехідний</option>
                      </select>
                    </div>
                  </Section>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Травми / обмеження</Label>
                      <Textarea value={form.injuryNotes} onChange={(e) => setForm({ ...form, injuryNotes: e.target.value })}
                        placeholder="Інформація про травми..." className="bg-secondary/50 border-border/50 min-h-[60px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Нотатки тренера</Label>
                      <Textarea value={form.personalNotes} onChange={(e) => setForm({ ...form, personalNotes: e.target.value })}
                        placeholder="Особливості роботи з цим спортсменом..." className="bg-secondary/50 border-border/50 min-h-[60px]" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Скасувати</Button>
                  <Button onClick={handleSave} className="flex-1">{editingId ? "Зберегти" : "Додати"}</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

// ─── Helper UI ───────────────────────────────────────────────────────────────

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{label}</h3>
    {children}
  </div>
);

const FF = ({ label, value, onChange, placeholder, type, span }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; span?: number;
}) => (
  <div className={`space-y-1.5 ${span === 2 ? "col-span-2" : ""}`}>
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <Input type={type || "text"} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)} className="bg-secondary/50 border-border/50" />
  </div>
);

type AthleteDoc = {
  _id: Id<"athletes">; name: string; dateOfBirth: string; gender: "male" | "female";
  sport: string; specialization: string; qualification: string; phone?: string; email?: string;
  height: number; weight: number; trainingAge: number; currentCyclePhase?: string;
  bestResult?: string; targetResult?: string; injuryNotes?: string; personalNotes?: string;
  isActive: boolean; macroCycleId?: Id<"macrocycles">;
};

const AthleteProfile = ({
  athlete, onEdit, getAge, activeMacro, onOpenTodayTraining,
}: {
  athlete: AthleteDoc;
  onEdit: () => void;
  getAge: (dob: string) => number;
  activeMacro: MacroDoc | null;
  onOpenTodayTraining: () => void;
}) => {
  const phase = (athlete.currentCyclePhase as CyclePhase) ?? "preparatory_general";
  const isInMacro = activeMacro?.athleteIds.includes(athlete._id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">{athlete.name}</h2>
              <p className="text-muted-foreground">{athlete.specialization} · {athlete.qualification}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onOpenTodayTraining} className="gap-1">
              <Dumbbell className="w-3 h-3" /> Тренування сьогодні
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
              <Edit2 className="w-3 h-3" /> Редагувати
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <InfoCell label="Вік" value={`${getAge(athlete.dateOfBirth)} р.`} />
          <InfoCell label="Зріст" value={`${athlete.height} см`} />
          <InfoCell label="Вага" value={`${athlete.weight} кг`} />
          <InfoCell label="Стаж" value={`${athlete.trainingAge} р.`} />
          <InfoCell label="Кращий" value={athlete.bestResult ?? "—"} highlight />
          <InfoCell label="Ціль" value={athlete.targetResult ?? "—"} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Поточна фаза</p>
          <span className={`inline-block text-sm px-3 py-1.5 rounded-md font-semibold ${cycleLabels[phase]?.color ?? "bg-muted text-muted-foreground"}`}>
            {cycleLabels[phase]?.label ?? phase}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" /><span>{athlete.sport}</span>
          </div>
          {activeMacro && isInMacro && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-2">{activeMacro.name}</p>
              <MacroCycleBar macro={activeMacro} />
            </div>
          )}
        </div>

        {(athlete.injuryNotes || athlete.personalNotes) && (
          <div className="glass-card p-5 space-y-3">
            {athlete.injuryNotes && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Травми / обмеження</p>
                <p className="text-sm">{athlete.injuryNotes}</p>
              </div>
            )}
            {athlete.personalNotes && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Нотатки тренера</p>
                <p className="text-sm">{athlete.personalNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {(athlete.phone || athlete.email) && (
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Контакти</p>
          <div className="flex gap-6 text-sm">
            {athlete.phone && <span>{athlete.phone}</span>}
            {athlete.email && <span className="text-muted-foreground">{athlete.email}</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const InfoCell = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
  </div>
);

export default Team;
