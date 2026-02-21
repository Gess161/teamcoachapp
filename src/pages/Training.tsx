import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, CheckCircle2, X, ClipboardList, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
}

interface Training {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  status: "planned" | "in_progress" | "completed";
  athleteCount: number;
}

const initialTrainings: Training[] = [
  {
    id: "1", name: "Силове тренування", date: "2026-02-21", athleteCount: 8, status: "completed",
    exercises: [
      { id: "e1", name: "Присідання зі штангою", description: "Глибокий присід", sets: 4, reps: "8-10" },
      { id: "e2", name: "Жим лежачи", description: "Класичний жим", sets: 4, reps: "6-8" },
      { id: "e3", name: "Тяга в нахилі", description: "Тяга штанги", sets: 3, reps: "10-12" },
    ],
  },
  {
    id: "2", name: "Швидкісна витривалість", date: "2026-02-20", athleteCount: 12, status: "completed",
    exercises: [
      { id: "e4", name: "Інтервальний біг", description: "200м інтервали", sets: 6, reps: "200м" },
      { id: "e5", name: "Човниковий біг", description: "4x10м", sets: 5, reps: "4x10м" },
    ],
  },
  {
    id: "3", name: "Техніка бігу", date: "2026-02-22", athleteCount: 6, status: "planned",
    exercises: [
      { id: "e6", name: "Біг з високим підніманням стегна", description: "Техніка", sets: 4, reps: "30м" },
      { id: "e7", name: "Захлест гомілки", description: "Техніка", sets: 4, reps: "30м" },
    ],
  },
];

const statusMap = {
  planned: { label: "Заплановано", color: "bg-chart-2/10 text-chart-2" },
  in_progress: { label: "В процесі", color: "bg-chart-4/10 text-chart-4" },
  completed: { label: "Завершено", color: "bg-primary/10 text-primary" },
};

const Training = () => {
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
  const [showModal, setShowModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [newTraining, setNewTraining] = useState({ name: "", date: "" });
  const [newExercise, setNewExercise] = useState({ name: "", description: "", sets: "", reps: "" });
  const { toast } = useToast();

  const handleCreateTraining = () => {
    if (!newTraining.name || !newTraining.date) return;
    const t: Training = {
      id: Date.now().toString(),
      name: newTraining.name,
      date: newTraining.date,
      exercises: [],
      status: "planned",
      athleteCount: 0,
    };
    setTrainings((prev) => [t, ...prev]);
    setNewTraining({ name: "", date: "" });
    setShowModal(false);
    toast({ title: "Тренування створено", description: t.name });
  };

  const addExerciseToTraining = (trainingId: string) => {
    if (!newExercise.name) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      description: newExercise.description,
      sets: Number(newExercise.sets) || 3,
      reps: newExercise.reps || "10",
    };
    setTrainings((prev) =>
      prev.map((t) => t.id === trainingId ? { ...t, exercises: [...t.exercises, ex] } : t)
    );
    setNewExercise({ name: "", description: "", sets: "", reps: "" });
    toast({ title: "Вправу додано" });
  };

  const startTraining = (id: string) => {
    setTrainings((prev) => prev.map((t) => t.id === id ? { ...t, status: "in_progress" as const } : t));
    toast({ title: "Тренування розпочато! 💪" });
  };

  const completeTraining = (id: string) => {
    setTrainings((prev) => prev.map((t) => t.id === id ? { ...t, status: "completed" as const } : t));
    toast({ title: "Тренування завершено! ✅" });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Тренування</h1>
            <p className="text-muted-foreground mt-1">Створюйте та проводьте тренування</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Нове тренування
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Training List */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Всі тренування
            </h2>
            {trainings.map((t) => (
              <motion.div
                key={t.id}
                layout
                className={`glass-card p-5 space-y-3 cursor-pointer transition-all duration-300 ${selectedTraining?.id === t.id ? 'glow-border' : 'hover:border-border'}`}
                onClick={() => setSelectedTraining(t)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusMap[t.status].color}`}>
                    {statusMap[t.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{t.date}</span>
                  <span>{t.exercises.length} вправ</span>
                  <span>{t.athleteCount} спортсменів</span>
                </div>
                {t.status === "planned" && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); startTraining(t.id); }} className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Play className="w-3 h-3" /> Розпочати
                  </Button>
                )}
                {t.status === "in_progress" && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); completeTraining(t.id); }} className="gap-1 bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 border-0">
                    <CheckCircle2 className="w-3 h-3" /> Завершити
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Training Detail */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" /> Вправи
            </h2>
            {selectedTraining ? (
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-lg">{selectedTraining.name}</h3>
                <div className="space-y-2">
                  {selectedTraining.exercises.map((ex, i) => (
                    <div key={ex.id} className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{i + 1}</span>
                        <div>
                          <p className="font-medium text-sm">{ex.name}</p>
                          <p className="text-xs text-muted-foreground">{ex.description}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{ex.sets}×{ex.reps}</p>
                    </div>
                  ))}
                </div>

                {/* Add Exercise Form */}
                <div className="pt-3 border-t border-border/50 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Додати вправу</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Назва" value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} className="bg-secondary/50 border-border/50 text-sm" />
                    <Input placeholder="Опис" value={newExercise.description} onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })} className="bg-secondary/50 border-border/50 text-sm" />
                    <Input placeholder="Підходи" type="number" value={newExercise.sets} onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })} className="bg-secondary/50 border-border/50 text-sm" />
                    <Input placeholder="Повтори" value={newExercise.reps} onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })} className="bg-secondary/50 border-border/50 text-sm" />
                  </div>
                  <Button size="sm" onClick={() => addExerciseToTraining(selectedTraining.id)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1">
                    <Plus className="w-3 h-3" /> Додати
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Оберіть тренування зі списку</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Training Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 w-full max-w-md space-y-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">Нове тренування</h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Назва</Label>
                    <Input placeholder="Силове тренування" value={newTraining.name} onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })} className="bg-secondary/50 border-border/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Дата</Label>
                    <Input type="date" value={newTraining.date} onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })} className="bg-secondary/50 border-border/50" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Скасувати</Button>
                  <Button onClick={handleCreateTraining} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Створити</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default Training;
