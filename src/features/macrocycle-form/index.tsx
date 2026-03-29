import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MacroForm } from "@/entities/macrocycle/types";

export const defaultPhases = (start: string, end: string) => {
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

export const emptyMacroForm = (): MacroForm => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 8, 1).toISOString().split("T")[0];
  const end = new Date(now.getFullYear() + 1, 7, 31).toISOString().split("T")[0];
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

const PHASE_LABELS = [
  { key: "pg", label: "ЗФП — Загальна фізична підготовка", color: "bg-blue-500/20 border-blue-500/30" },
  { key: "ps", label: "СФП — Спеціальна фізична підготовка", color: "bg-violet-500/20 border-violet-500/30" },
  { key: "comp", label: "Змагальний період", color: "bg-yellow-500/20 border-yellow-500/30" },
  { key: "trans", label: "Перехідний період", color: "bg-green-500/20 border-green-500/30" },
] as const;

interface MacroCycleFormProps {
  editingId: Id<"macrocycles"> | null;
  initialData: MacroForm | null;
  athletes: { _id: Id<"athletes">; name: string }[];
  onSaved: () => void;
  onCancel: () => void;
}

const MacroCycleForm = ({ editingId, initialData, athletes, onSaved, onCancel }: MacroCycleFormProps) => {
  const createMacro = useMutation(api.macrocycles.create);
  const updateMacro = useMutation(api.macrocycles.update);
  const updateAthlete = useMutation(api.athletes.update);
  const { toast } = useToast();

  const [form, setForm] = useState<MacroForm>(initialData ?? emptyMacroForm());
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(
    new Set(athletes.map((a) => a._id).filter(() => false))
  );

  const f = (k: keyof MacroForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

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

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const phases = {
      preparatoryGeneral: { startDate: form.pg_start, endDate: form.pg_end, hoursPercent: 28 },
      preparatorySpecial: { startDate: form.ps_start, endDate: form.ps_end, hoursPercent: 28 },
      competitive: { startDate: form.comp_start, endDate: form.comp_end, hoursPercent: 36 },
      transitional: { startDate: form.trans_start, endDate: form.trans_end, hoursPercent: 8 },
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
        totalHoursPlanned: form.totalHoursPlanned ? Number(form.totalHoursPlanned) : undefined,
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
        totalHoursPlanned: form.totalHoursPlanned ? Number(form.totalHoursPlanned) : undefined,
      });
      toast({ description: "Макроцикл створено" });
    }
    for (const id of athleteIds) {
      await updateAthlete({ id, macroCycleId: macroId });
    }
    onSaved();
  };

  return (
    <AnimatePresence>
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
            <button onClick={onCancel}>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

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
              <Label className="text-sm text-muted-foreground">Початок сезону</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => recalcPhases(e.target.value, form.endDate)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Кінець сезону</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => recalcPhases(form.startDate, e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Плановий обсяг (год.)</Label>
              <Input
                type="number"
                value={form.totalHoursPlanned}
                onChange={(e) => f("totalHoursPlanned", e.target.value)}
                className="bg-secondary/50 border-border/50"
                placeholder="300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Фази підготовки
            </p>
            {PHASE_LABELS.map((ph) => (
              <div key={ph.key} className={`rounded-lg border p-3 space-y-2 ${ph.color}`}>
                <p className="text-xs font-medium">{ph.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Початок</Label>
                    <Input
                      type="date"
                      value={form[`${ph.key}_start`]}
                      onChange={(e) => f(`${ph.key}_start`, e.target.value)}
                      className="bg-background/50 border-border/30 h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Кінець</Label>
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
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Скасувати
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingId ? "Зберегти" : "Створити"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MacroCycleForm;
