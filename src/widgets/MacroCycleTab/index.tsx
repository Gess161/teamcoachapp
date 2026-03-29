import { useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MacroCycleBar from "@/widgets/MacroCycleBar";
import { AnimatePresence } from "framer-motion";
import MacroCycleForm, { emptyMacroForm } from "@/features/macrocycle-form";
import type { MacroForm } from "@/entities/macrocycle/types";

const MacroCycleTab = ({
  athletes,
}: {
  athletes: { _id: Id<"athletes">; name: string }[];
}) => {
  const macrocycles = useQuery(api.macrocycles.getAll) ?? [];
  const activeMacro = macrocycles.find((m) => m.isActive);
  const deactivate = useMutation(api.macrocycles.deactivate);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"macrocycles"> | null>(null);
  const [formInitialData, setFormInitialData] = useState<MacroForm | null>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormInitialData(emptyMacroForm());
    setShowForm(true);
  };

  const handleOpenEdit = (m: (typeof macrocycles)[0]) => {
    setEditingId(m._id);
    setFormInitialData({
      name: m.name,
      sport: m.sport ?? "handball",
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
    setShowForm(true);
  };

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
                <span className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${ph.color}`} />
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
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(m)}>
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

      {/* Create / Edit Form Modal */}
      <AnimatePresence>
        {showForm && formInitialData && (
          <MacroCycleForm
            editingId={editingId}
            initialData={formInitialData}
            athletes={athletes}
            onSaved={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MacroCycleTab;
