import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Layers, User } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { emptyForm } from "@/entities/athlete/types";
import { getAge } from "@/entities/athlete/lib";
import type { CyclePhase, FormState, AthleteDoc } from "@/entities/athlete/types";
import type { TrainingDoc } from "@/entities/training/types";
import type { MacroDoc } from "@/entities/macrocycle/types";
import AthleteCard from "@/widgets/AthleteCard";
import TodayTrainingModal from "@/widgets/TodayTrainingModal";
import MacroCycleTab from "@/widgets/MacroCycleTab";
import AthleteProfile from "@/widgets/AthleteProfile";
import AthleteFormModal from "@/features/athlete-form";

// ─── Main Team Page ──────────────────────────────────────────────────────────

const Team = () => {
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const allTrainings = (useQuery(api.trainings.getAll) ?? []) as TrainingDoc[];
  const allReadinessScores = useQuery(api.readinessScores.getAll) ?? [];
  const activeMacro = (useQuery(api.macrocycles.getActive) ?? null) as MacroDoc | null;
  const createAthlete = useMutation(api.athletes.create);
  const updateAthlete = useMutation(api.athletes.update);
  const removeAthlete = useMutation(api.athletes.remove);

  const [tab, setTab] = useState<"athletes" | "macrocycle">("athletes");
  const [search, setSearch] = useState("");
  const [todayModalAthlete, setTodayModalAthlete] = useState<{
    id: Id<"athletes">;
    name: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"athletes"> | null>(null);
  const [editingId, setEditingId] = useState<Id<"athletes"> | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { toast } = useToast();

  const filtered = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.specialization.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedAthlete = selectedId
    ? (athletes.find((a) => a._id === selectedId) ?? null)
    : null;

  // Latest ІГС for each athlete
  const latestIGSByAthlete = useMemo(() => {
    const map = new Map<Id<"athletes">, number>();
    for (const score of allReadinessScores) {
      if (score.igs !== undefined && !map.has(score.athleteId)) {
        map.set(score.athleteId, score.igs);
      }
    }
    return map;
  }, [allReadinessScores]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };
  const openEdit = (a: (typeof athletes)[0]) => {
    setEditingId(a._id);
    setForm({
      name: a.name,
      dateOfBirth: a.dateOfBirth,
      gender: a.gender,
      sport: a.sport,
      specialization: a.specialization,
      qualification: a.qualification,
      phone: a.phone ?? "",
      email: a.email ?? "",
      height: String(a.height),
      weight: String(a.weight),
      trainingAge: String(a.trainingAge),
      currentCyclePhase:
        (a.currentCyclePhase as CyclePhase) ?? "preparatory_general",
      bestResult: a.bestResult ?? "",
      targetResult: a.targetResult ?? "",
      injuryNotes: a.injuryNotes ?? "",
      personalNotes: a.personalNotes ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const payload = {
      name: form.name,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      sport: form.sport,
      specialization: form.specialization,
      qualification: form.qualification,
      phone: form.phone || undefined,
      email: form.email || undefined,
      height: Number(form.height) || 0,
      weight: Number(form.weight) || 0,
      trainingAge: Number(form.trainingAge) || 0,
      currentCyclePhase: form.currentCyclePhase,
      bestResult: form.bestResult || undefined,
      targetResult: form.targetResult || undefined,
      injuryNotes: form.injuryNotes || undefined,
      personalNotes: form.personalNotes || undefined,
    };
    if (editingId) {
      await updateAthlete({ id: editingId, ...payload });
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
    if (
      today >= phases.preparatoryGeneral.startDate &&
      today <= phases.preparatoryGeneral.endDate
    )
      return "preparatory_general";
    if (
      today >= phases.preparatorySpecial.startDate &&
      today <= phases.preparatorySpecial.endDate
    )
      return "preparatory_special";
    if (
      today >= phases.competitive.startDate &&
      today <= phases.competitive.endDate
    )
      return "competitive";
    if (
      today >= phases.transitional.startDate &&
      today <= phases.transitional.endDate
    )
      return "transitional";
    return null;
  }, [activeMacro]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Команда</h1>
            <p className="text-muted-foreground mt-1">
              {athletes.length} спортсменів
            </p>
          </div>
          <div className="flex gap-2">
            {selectedAthlete && (
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                ← До списку
              </Button>
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
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "athletes" ? (
                  <>
                    <User className="w-4 h-4" /> Спортсмени
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" /> Макроцикл
                  </>
                )}
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50 h-11"
                />
              </div>
            )}

            {selectedAthlete ? (
              <AthleteProfile
                athlete={selectedAthlete as AthleteDoc}
                onEdit={() => openEdit(selectedAthlete)}
                getAge={getAge}
                activeMacro={activeMacro}
                latestIGSByAthlete={latestIGSByAthlete}
                onOpenTodayTraining={() =>
                  setTodayModalAthlete({
                    id: selectedAthlete._id,
                    name: selectedAthlete.name,
                  })
                }
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search ? "Нікого не знайдено" : "Додайте першого спортсмена"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((a) => (
                  <AthleteCard
                    key={a._id}
                    athlete={a as AthleteDoc}
                    activeMacro={activeMacro}
                    latestIGS={latestIGSByAthlete.get(a._id)}
                    onSelect={() => setSelectedId(a._id)}
                    onEdit={(e) => { e.stopPropagation(); openEdit(a); }}
                    onDelete={(e) => { e.stopPropagation(); handleDelete(a._id, a.name); }}
                    onTrainingClick={(e) => { e.stopPropagation(); setTodayModalAthlete({ id: a._id, name: a.name }); }}
                  />
                ))}
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
            <AthleteFormModal
              editingId={editingId}
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default Team;
