import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MacroCycleBar from "@/widgets/MacroCycleBar";
import type { MacroForm } from "@/entities/macrocycle/types";

const defaultPhases = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const total = e - s;
  const fmt = (ms: number) => new Date(ms).toISOString().split("T")[0];
  return {
    preparatoryGeneral: {
      startDate: start,
      endDate: fmt(s + total * 0.28),
      hoursPercent: 28,
    },
    preparatorySpecial: {
      startDate: fmt(s + total * 0.28),
      endDate: fmt(s + total * 0.56),
      hoursPercent: 28,
    },
    competitive: {
      startDate: fmt(s + total * 0.56),
      endDate: fmt(s + total * 0.92),
      hoursPercent: 36,
    },
    transitional: {
      startDate: fmt(s + total * 0.92),
      endDate: end,
      hoursPercent: 8,
    },
  };
};

const emptyMacroForm = (): MacroForm => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 8, 1).toISOString().split("T")[0]; // Sep 1
  const end = new Date(now.getFullYear() + 1, 7, 31)
    .toISOString()
    .split("T")[0]; // Aug 31 next year
  const ph = defaultPhases(start, end);
  return {
    name: `${now.getFullYear()}-${now.getFullYear() + 1} Сезон`,
    sport: "handball",
    startDate: start,
    endDate: end,
    totalHoursPlanned: "300",
    pg_start: ph.preparatoryGeneral.startDate,
    pg_end: ph.preparatoryGeneral.endDate,
    ps_start: ph.preparatorySpecial.startDate,
    ps_end: ph.preparatorySpecial.endDate,
    comp_start: ph.competitive.startDate,
    comp_end: ph.competitive.endDate,
    trans_start: ph.transitional.startDate,
    trans_end: ph.transitional.endDate,
  };
};

const MacroCycleTab = ({
  athletes,
}: {
  athletes: { _id: Id<"athletes">; name: string }[];
}) => {
  const macrocycles = useQuery(api.macrocycles.getAll) ?? [];
  const activeMacro = macrocycles.find((m) => m.isActive);
  const createMacro = useMutation(api.macrocycles.create);
  const updateMacro = useMutation(api.macrocycles.update);
  const deactivate = useMutation(api.macrocycles.deactivate);
  const updateAthlete = useMutation(api.athletes.update);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MacroForm>(emptyMacroForm);
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(
    new Set(),
  );
  const [editingId, setEditingId] = useState<Id<"macrocycles"> | null>(null);

  const f = (k: keyof MacroForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const recalcPhases = (start: string, end: string) => {
    if (!start || !end) return;
    const ph = defaultPhases(start, end);
    setForm((p) => ({
      ...p,
      startDate: start,
      endDate: end,
      pg_start: ph.preparatoryGeneral.startDate,
      pg_end: ph.preparatoryGeneral.endDate,
      ps_start: ph.preparatorySpecial.startDate,
      ps_end: ph.preparatorySpecial.endDate,
      comp_start: ph.competitive.startDate,
      comp_end: ph.competitive.endDate,
      trans_start: ph.transitional.startDate,
      trans_end: ph.transitional.endDate,
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

  const handleOpenEdit = (m: (typeof macrocycles)[0]) => {
    setEditingId(m._id);
    setForm({
      name: m.name,
      sport: m.sport,
      startDate: m.startDate,
      endDate: m.endDate,
      totalHoursPlanned: m.totalHoursPlanned ? String(m.totalHoursPlanned) : "",
      pg_start: m.phases.preparatoryGeneral.startDate,
      pg_end: m.phases.preparatoryGeneral.endDate,
      ps_start: m.phases.preparatorySpecial.startDate,
      ps_end: m.phases.preparatorySpecial.endDate,
      comp_start: m.phases.competitive.startDate,
      comp_end: m.phases.competitive.endDate,
      trans_start: m.phases.transitional.startDate,
      trans_end: m.phases.transitional.endDate,
    });
    setSelectedAthletes(new Set(m.athleteIds));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const phases = {
      preparatoryGeneral: {
        startDate: form.pg_start,
        endDate: form.pg_end,
        hoursPercent: 28,
      },
      preparatorySpecial: {
        startDate: form.ps_start,
        endDate: form.ps_end,
        hoursPercent: 28,
      },
      competitive: {
        startDate: form.comp_start,
        endDate: form.comp_end,
        hoursPercent: 36,
      },
      transitional: {
        startDate: form.trans_start,
        endDate: form.trans_end,
        hoursPercent: 8,
      },
    };
    const athleteIds = Array.from(selectedAthletes) as Id<"athletes">[];
    let macroId: Id<"macrocycles">;
    if (editingId) {
      await updateMacro({
        id: editingId,
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        phases,
        athleteIds,
        totalHoursPlanned: form.totalHoursPlanned
          ? Number(form.totalHoursPlanned)
          : undefined,
      });
      macroId = editingId;
      toast({ description: "Макроцикл оновлено" });
    } else {
      macroId = await createMacro({
        name: form.name,
        sport: form.sport,
        startDate: form.startDate,
        endDate: form.endDate,
        phases,
        athleteIds,
        totalHoursPlanned: form.totalHoursPlanned
          ? Number(form.totalHoursPlanned)
          : undefined,
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
    {
      key: "pg",
      label: "ЗФП — Загальна фізична підготовка",
      color: "bg-blue-500/20 border-blue-500/30",
    },
    {
      key: "ps",
      label: "СФП — Спеціальна фізична підготовка",
      color: "bg-violet-500/20 border-violet-500/30",
    },
    {
      key: "comp",
      label: "Змагальний період",
      color: "bg-yellow-500/20 border-yellow-500/30",
    },
    {
      key: "trans",
      label: "Перехідний період",
      color: "bg-green-500/20 border-green-500/30",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">Макроцикл</h2>
          <p className="text-sm text-muted-foreground">
            Річний план підготовки
          </p>
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
                {activeMacro.totalHoursPlanned &&
                  ` · ${activeMacro.totalHoursPlanned} год.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(activeMacro)}
              >
                Редагувати
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  deactivate({ id: activeMacro._id });
                  toast({ description: "Деактивовано" });
                }}
              >
                Деактивувати
              </Button>
            </div>
          </div>

          <MacroCycleBar macro={activeMacro} />

          {/* Phase legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              {
                label: "ЗФП",
                color: "bg-blue-500",
                start: activeMacro.phases.preparatoryGeneral.startDate,
                end: activeMacro.phases.preparatoryGeneral.endDate,
              },
              {
                label: "СФП",
                color: "bg-violet-500",
                start: activeMacro.phases.preparatorySpecial.startDate,
                end: activeMacro.phases.preparatorySpecial.endDate,
              },
              {
                label: "Змагальний",
                color: "bg-yellow-500",
                start: activeMacro.phases.competitive.startDate,
                end: activeMacro.phases.competitive.endDate,
              },
              {
                label: "Перехідний",
                color: "bg-green-500",
                start: activeMacro.phases.transitional.startDate,
                end: activeMacro.phases.transitional.endDate,
              },
            ].map((ph) => (
              <div key={ph.label} className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${ph.color}`}
                />
                <div>
                  <p className="font-medium">{ph.label}</p>
                  <p className="text-muted-foreground">
                    {ph.start.substring(5)} – {ph.end.substring(5)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Assigned athletes */}
          {activeMacro.athleteIds.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Спортсмени ({activeMacro.athleteIds.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {activeMacro.athleteIds.map((id) => {
                  const a = athletes.find((x) => x._id === id);
                  return a ? (
                    <span
                      key={id}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Архів
          </p>
          {macrocycles
            .filter((m) => !m.isActive)
            .map((m) => (
              <div
                key={m._id}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.startDate} → {m.endDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(m)}
                >
                  Переглянути
                </Button>
              </div>
            ))}
        </div>
      )}

      {macrocycles.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">Макроциклів ще немає</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Створіть річний план підготовки
          </p>
        </div>
      )}

      {/* Create / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
                  <Input
                    value={form.name}
                    onChange={(e) => f("name", e.target.value)}
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Початок сезону
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => recalcPhases(e.target.value, form.endDate)}
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Кінець сезону
                  </Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      recalcPhases(form.startDate, e.target.value)
                    }
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Плановий обсяг (год.)
                  </Label>
                  <Input
                    type="number"
                    value={form.totalHoursPlanned}
                    onChange={(e) => f("totalHoursPlanned", e.target.value)}
                    className="bg-secondary/50 border-border/50"
                    placeholder="300"
                  />
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Фази підготовки
                </p>
                {PHASE_LABELS.map((ph) => (
                  <div
                    key={ph.key}
                    className={`rounded-lg border p-3 space-y-2 ${ph.color}`}
                  >
                    <p className="text-xs font-medium">{ph.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Початок
                        </Label>
                        <Input
                          type="date"
                          value={form[`${ph.key}_start`]}
                          onChange={(e) => f(`${ph.key}_start`, e.target.value)}
                          className="bg-background/50 border-border/30 h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Кінець
                        </Label>
                        <Input
                          type="date"
                          value={form[`${ph.key}_end`]}
                          onChange={(e) => f(`${ph.key}_end`, e.target.value)}
                          className="bg-background/50 border-border/30 h-8 text-sm"
                        />
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
                      <label
                        key={a._id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer text-sm"
                      >
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
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Скасувати
                </Button>
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

export default MacroCycleTab;
