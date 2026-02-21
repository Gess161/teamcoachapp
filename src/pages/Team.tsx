import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, X, User, ChevronRight, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface PerformanceRecord {
  date: string;
  actual: number;
  predicted: number;
}

interface Athlete {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  sport: string;
  specialization: string;
  qualification: string;
  phone: string;
  email: string;
  height: number;
  weight: number;
  trainingAge: number; // years of training
  currentCycle: "preparatory" | "competitive" | "transition";
  microCycleWeek: number;
  macroCycleName: string;
  bestResult: string;
  targetResult: string;
  injuryNotes: string;
  performanceHistory: PerformanceRecord[];
}

const generatePrediction = (history: PerformanceRecord[], currentCycle: string, microWeek: number): PerformanceRecord[] => {
  if (history.length === 0) return [];
  const last = history[history.length - 1];
  const predictions: PerformanceRecord[] = [];
  for (let i = 1; i <= 8; i++) {
    let factor: number;
    if (currentCycle === "preparatory") {
      // Gradual improvement with periodization waves
      factor = 1 - (0.005 * i) + (Math.sin((microWeek + i) * 0.8) * 0.008);
    } else if (currentCycle === "competitive") {
      // Peak performance taper
      factor = 1 - (0.008 * i) + (Math.sin((microWeek + i) * 1.2) * 0.003);
    } else {
      // Transition - slight decline/maintenance
      factor = 1 + (0.002 * i);
    }
    predictions.push({
      date: `+${i}тж`,
      actual: 0,
      predicted: Math.round(last.actual * factor * 100) / 100,
    });
  }
  return predictions;
};

const cycleLabels = {
  preparatory: { label: "Підготовчий", color: "bg-chart-2/10 text-chart-2" },
  competitive: { label: "Змагальний", color: "bg-chart-4/10 text-chart-4" },
  transition: { label: "Перехідний", color: "bg-chart-3/10 text-chart-3" },
};

const initialAthletes: Athlete[] = [
  {
    id: "1", name: "Олександр Петренко", dateOfBirth: "2004-03-15", gender: "male",
    sport: "Легка атлетика", specialization: "Спринт 100м", qualification: "КМС",
    phone: "+380991234567", email: "petrenko@mail.com", height: 182, weight: 78,
    trainingAge: 6, currentCycle: "preparatory", microCycleWeek: 3, macroCycleName: "Зимовий підготовчий 2026",
    bestResult: "10.45с", targetResult: "10.20с", injuryNotes: "",
    performanceHistory: [
      { date: "Тж1", actual: 10.82, predicted: 10.80 },
      { date: "Тж2", actual: 10.75, predicted: 10.74 },
      { date: "Тж3", actual: 10.68, predicted: 10.68 },
      { date: "Тж4", actual: 10.72, predicted: 10.62 },
      { date: "Тж5", actual: 10.60, predicted: 10.58 },
      { date: "Тж6", actual: 10.55, predicted: 10.53 },
      { date: "Тж7", actual: 10.50, predicted: 10.48 },
      { date: "Тж8", actual: 10.45, predicted: 10.44 },
    ],
  },
  {
    id: "2", name: "Марія Коваленко", dateOfBirth: "2006-07-22", gender: "female",
    sport: "Легка атлетика", specialization: "Стрибки в довжину", qualification: "I розряд",
    phone: "+380997654321", email: "kovalenko@mail.com", height: 172, weight: 62,
    trainingAge: 4, currentCycle: "competitive", microCycleWeek: 2, macroCycleName: "Зимовий змагальний 2026",
    bestResult: "6.12м", targetResult: "6.35м", injuryNotes: "Легке розтягнення правого стегна (жовтень 2025)",
    performanceHistory: [
      { date: "Тж1", actual: 5.80, predicted: 5.82 },
      { date: "Тж2", actual: 5.88, predicted: 5.90 },
      { date: "Тж3", actual: 5.95, predicted: 5.96 },
      { date: "Тж4", actual: 5.90, predicted: 6.00 },
      { date: "Тж5", actual: 6.02, predicted: 6.04 },
      { date: "Тж6", actual: 6.08, predicted: 6.07 },
      { date: "Тж7", actual: 6.10, predicted: 6.10 },
      { date: "Тж8", actual: 6.12, predicted: 6.13 },
    ],
  },
  {
    id: "3", name: "Іван Сидоренко", dateOfBirth: "2002-11-08", gender: "male",
    sport: "Легка атлетика", specialization: "Штовхання ядра", qualification: "КМС",
    phone: "+380991112233", email: "sydorenko@mail.com", height: 190, weight: 105,
    trainingAge: 7, currentCycle: "transition", microCycleWeek: 1, macroCycleName: "Перехідний період",
    bestResult: "18.3м", targetResult: "19.0м", injuryNotes: "Проблеми з правим плечем",
    performanceHistory: [
      { date: "Тж1", actual: 17.50, predicted: 17.55 },
      { date: "Тж2", actual: 17.70, predicted: 17.72 },
      { date: "Тж3", actual: 17.85, predicted: 17.88 },
      { date: "Тж4", actual: 18.00, predicted: 18.02 },
      { date: "Тж5", actual: 17.90, predicted: 18.10 },
      { date: "Тж6", actual: 18.10, predicted: 18.15 },
      { date: "Тж7", actual: 18.20, predicted: 18.22 },
      { date: "Тж8", actual: 18.30, predicted: 18.28 },
    ],
  },
  {
    id: "4", name: "Анна Шевченко", dateOfBirth: "2007-01-30", gender: "female",
    sport: "Легка атлетика", specialization: "Біг 400м", qualification: "II розряд",
    phone: "+380994445566", email: "shevchenko@mail.com", height: 168, weight: 58,
    trainingAge: 3, currentCycle: "preparatory", microCycleWeek: 5, macroCycleName: "Зимовий підготовчий 2026",
    bestResult: "52.1с", targetResult: "50.8с", injuryNotes: "",
    performanceHistory: [
      { date: "Тж1", actual: 54.20, predicted: 54.10 },
      { date: "Тж2", actual: 53.80, predicted: 53.70 },
      { date: "Тж3", actual: 53.50, predicted: 53.40 },
      { date: "Тж4", actual: 53.10, predicted: 53.00 },
      { date: "Тж5", actual: 52.80, predicted: 52.70 },
      { date: "Тж6", actual: 52.50, predicted: 52.40 },
      { date: "Тж7", actual: 52.30, predicted: 52.20 },
      { date: "Тж8", actual: 52.10, predicted: 52.00 },
    ],
  },
  {
    id: "5", name: "Дмитро Бондар", dateOfBirth: "2003-09-12", gender: "male",
    sport: "Легка атлетика", specialization: "Стрибки у висоту", qualification: "I розряд",
    phone: "+380997778899", email: "bondar@mail.com", height: 193, weight: 82,
    trainingAge: 5, currentCycle: "preparatory", microCycleWeek: 4, macroCycleName: "Зимовий підготовчий 2026",
    bestResult: "2.15м", targetResult: "2.20м", injuryNotes: "",
    performanceHistory: [
      { date: "Тж1", actual: 2.05, predicted: 2.06 },
      { date: "Тж2", actual: 2.07, predicted: 2.08 },
      { date: "Тж3", actual: 2.09, predicted: 2.10 },
      { date: "Тж4", actual: 2.10, predicted: 2.11 },
      { date: "Тж5", actual: 2.11, predicted: 2.12 },
      { date: "Тж6", actual: 2.12, predicted: 2.13 },
      { date: "Тж7", actual: 2.14, predicted: 2.14 },
      { date: "Тж8", actual: 2.15, predicted: 2.15 },
    ],
  },
];

type FormState = {
  name: string; dateOfBirth: string; gender: Athlete["gender"]; sport: string; specialization: string;
  qualification: string; phone: string; email: string; height: string; weight: string; trainingAge: string;
  currentCycle: Athlete["currentCycle"]; microCycleWeek: string; macroCycleName: string; bestResult: string;
  targetResult: string; injuryNotes: string;
};

const emptyForm: FormState = {
  name: "", dateOfBirth: "", gender: "male", sport: "", specialization: "", qualification: "",
  phone: "", email: "", height: "", weight: "", trainingAge: "", currentCycle: "preparatory",
  microCycleWeek: "", macroCycleName: "", bestResult: "", targetResult: "", injuryNotes: "",
};

const Team = () => {
  const [athletes, setAthletes] = useState<Athlete[]>(initialAthletes);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingAthlete(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (a: Athlete) => {
    setEditingAthlete(a);
    setForm({
      name: a.name, dateOfBirth: a.dateOfBirth, gender: a.gender, sport: a.sport,
      specialization: a.specialization, qualification: a.qualification, phone: a.phone,
      email: a.email, height: String(a.height), weight: String(a.weight),
      trainingAge: String(a.trainingAge), currentCycle: a.currentCycle,
      microCycleWeek: String(a.microCycleWeek), macroCycleName: a.macroCycleName,
      bestResult: a.bestResult, targetResult: a.targetResult, injuryNotes: a.injuryNotes,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editingAthlete) {
      setAthletes((prev) => prev.map((a) => a.id === editingAthlete.id ? {
        ...a, ...form, height: Number(form.height), weight: Number(form.weight),
        trainingAge: Number(form.trainingAge), microCycleWeek: Number(form.microCycleWeek),
      } : a));
      toast({ title: "Оновлено", description: `${form.name} змінено` });
    } else {
      const newAthlete: Athlete = {
        id: Date.now().toString(), ...form, height: Number(form.height), weight: Number(form.weight),
        trainingAge: Number(form.trainingAge), microCycleWeek: Number(form.microCycleWeek),
        performanceHistory: [],
      };
      setAthletes((prev) => [...prev, newAthlete]);
      toast({ title: "Додано", description: `${form.name} додано до команди` });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const a = athletes.find((x) => x.id === id);
    setAthletes((prev) => prev.filter((x) => x.id !== id));
    if (selectedAthlete?.id === id) setSelectedAthlete(null);
    toast({ title: "Видалено", description: `${a?.name} видалено з команди` });
  };

  const getAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getPerformanceTrend = (history: PerformanceRecord[]) => {
    if (history.length < 2) return "stable";
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    const diff = ((last.actual - prev.actual) / prev.actual) * 100;
    if (Math.abs(diff) < 0.3) return "stable";
    // For time-based events (sprint), lower = better. For distance, higher = better.
    return diff < 0 ? "improving" : "declining";
  };

  const getDeviationFromPrediction = (history: PerformanceRecord[]) => {
    if (history.length === 0) return 0;
    const last = history[history.length - 1];
    if (last.predicted === 0) return 0;
    return Math.round(((last.actual - last.predicted) / last.predicted) * 10000) / 100;
  };

  // Build chart data with predictions
  const getChartData = (athlete: Athlete) => {
    const predictions = generatePrediction(athlete.performanceHistory, athlete.currentCycle, athlete.microCycleWeek);
    return [
      ...athlete.performanceHistory,
      ...predictions.map((p) => ({ ...p, actual: undefined as any })),
    ];
  };

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
              <Button variant="outline" onClick={() => setSelectedAthlete(null)} className="gap-1 text-sm">
                ← До списку
              </Button>
            )}
            <Button onClick={openAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> Додати спортсмена
            </Button>
          </div>
        </div>

        {/* Search */}
        {!selectedAthlete && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Пошук за ім'ям або спеціалізацією..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border/50 h-11" />
          </div>
        )}

        {/* Athletes List or Detail View */}
        {selectedAthlete ? (
          <AthleteProfile
            athlete={selectedAthlete}
            onEdit={() => openEdit(selectedAthlete)}
            getAge={getAge}
            getChartData={getChartData}
            getDeviationFromPrediction={getDeviationFromPrediction}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const trend = getPerformanceTrend(a.performanceHistory);
              return (
                <motion.div
                  key={a.id} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-5 space-y-4 group hover:glow-border transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedAthlete(a)}
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
                    <div className="flex items-center gap-1">
                      {trend === "improving" && <TrendingUp className="w-4 h-4 text-primary" />}
                      {trend === "declining" && <TrendingDown className="w-4 h-4 text-destructive" />}
                      {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(a); }} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-muted-foreground text-xs">Вік</p><p className="font-medium">{getAge(a.dateOfBirth)} р.</p></div>
                    <div><p className="text-muted-foreground text-xs">Кваліфікація</p><p className="font-medium">{a.qualification}</p></div>
                    <div><p className="text-muted-foreground text-xs">Кращий</p><p className="font-medium text-primary">{a.bestResult}</p></div>
                    <div><p className="text-muted-foreground text-xs">Ціль</p><p className="font-medium">{a.targetResult}</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${cycleLabels[a.currentCycle].color}`}>
                      {cycleLabels[a.currentCycle].label} · мікро {a.microCycleWeek}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">{editingAthlete ? "Редагувати" : "Новий спортсмен"}</h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-6">
                  {/* Personal */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Особисті дані</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="ПІБ" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Олександр Петренко" span={2} />
                      <FormField label="Дата народження" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} type="date" />
                      <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Стать</Label>
                        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })} className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
                          <option value="male">Чоловіча</option>
                          <option value="female">Жіноча</option>
                        </select>
                      </div>
                      <FormField label="Телефон" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+380..." />
                      <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="email@mail.com" />
                    </div>
                  </div>

                  {/* Physical */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Фізичні дані</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField label="Зріст (см)" value={form.height} onChange={(v) => setForm({ ...form, height: v })} type="number" placeholder="182" />
                      <FormField label="Вага (кг)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} type="number" placeholder="78" />
                      <FormField label="Стаж (років)" value={form.trainingAge} onChange={(v) => setForm({ ...form, trainingAge: v })} type="number" placeholder="6" />
                    </div>
                  </div>

                  {/* Sport */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Спортивні дані</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Вид спорту" value={form.sport} onChange={(v) => setForm({ ...form, sport: v })} placeholder="Легка атлетика" />
                      <FormField label="Спеціалізація" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} placeholder="Спринт 100м" />
                      <FormField label="Кваліфікація" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} placeholder="КМС" />
                      <FormField label="Кращий результат" value={form.bestResult} onChange={(v) => setForm({ ...form, bestResult: v })} placeholder="10.45с" />
                      <FormField label="Цільовий результат" value={form.targetResult} onChange={(v) => setForm({ ...form, targetResult: v })} placeholder="10.20с" />
                    </div>
                  </div>

                  {/* Training Cycle */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Тренувальний цикл</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Поточний цикл</Label>
                        <select value={form.currentCycle} onChange={(e) => setForm({ ...form, currentCycle: e.target.value as any })} className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
                          <option value="preparatory">Підготовчий</option>
                          <option value="competitive">Змагальний</option>
                          <option value="transition">Перехідний</option>
                        </select>
                      </div>
                      <FormField label="Тиждень мікроциклу" value={form.microCycleWeek} onChange={(v) => setForm({ ...form, microCycleWeek: v })} type="number" placeholder="3" />
                      <FormField label="Назва макроциклу" value={form.macroCycleName} onChange={(v) => setForm({ ...form, macroCycleName: v })} placeholder="Зимовий підготовчий 2026" span={2} />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Примітки / Травми</Label>
                    <Textarea value={form.injuryNotes} onChange={(e) => setForm({ ...form, injuryNotes: e.target.value })} placeholder="Інформація про травми, обмеження..." className="bg-secondary/50 border-border/50 min-h-[60px]" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Скасувати</Button>
                  <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    {editingAthlete ? "Зберегти" : "Додати"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

// Helper components
const FormField = ({ label, value, onChange, placeholder, type, span }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; span?: number;
}) => (
  <div className={`space-y-1.5 ${span === 2 ? 'col-span-2' : ''}`}>
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <Input type={type || "text"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="bg-secondary/50 border-border/50" />
  </div>
);

const AthleteProfile = ({ athlete, onEdit, getAge, getChartData, getDeviationFromPrediction }: {
  athlete: Athlete; onEdit: () => void; getAge: (dob: string) => number;
  getChartData: (a: Athlete) => any[]; getDeviationFromPrediction: (h: PerformanceRecord[]) => number;
}) => {
  const deviation = getDeviationFromPrediction(athlete.performanceHistory);
  const chartData = getChartData(athlete);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
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
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1"><Edit2 className="w-3 h-3" /> Редагувати</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <InfoCell label="Вік" value={`${getAge(athlete.dateOfBirth)} р.`} />
          <InfoCell label="Зріст" value={`${athlete.height} см`} />
          <InfoCell label="Вага" value={`${athlete.weight} кг`} />
          <InfoCell label="Стаж" value={`${athlete.trainingAge} р.`} />
          <InfoCell label="Кращий" value={athlete.bestResult} highlight />
          <InfoCell label="Ціль" value={athlete.targetResult} />
        </div>
      </div>

      {/* Cycle Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Поточний цикл</p>
          <span className={`text-sm px-3 py-1.5 rounded-md font-semibold ${cycleLabels[athlete.currentCycle].color}`}>
            {cycleLabels[athlete.currentCycle].label}
          </span>
          <p className="text-sm text-muted-foreground mt-2">{athlete.macroCycleName}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Мікроцикл</p>
          <p className="text-2xl font-display font-bold">Тиждень {athlete.microCycleWeek}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Відхилення від прогнозу</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-display font-bold ${Math.abs(deviation) < 0.5 ? 'text-primary' : deviation > 0 ? 'text-destructive' : 'text-chart-2'}`}>
              {deviation > 0 ? '+' : ''}{deviation}%
            </p>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.abs(deviation) < 0.5 ? "В межах очікувань" : deviation > 0 ? "Нижче прогнозу — потребує корекції" : "Краще за прогноз"}
          </p>
        </div>
      </div>

      {/* Performance Chart with Prediction */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Динаміка результатів та прогноз</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Суцільна лінія — факт, пунктирна — прогноз на основі мікро/макроциклів</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="date" stroke="hsl(220, 10%, 50%)" fontSize={11} />
            <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)" }} />
            <Line type="monotone" dataKey="actual" stroke="hsl(84, 81%, 44%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(84, 81%, 44%)" }} name="Факт" connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="hsl(200, 70%, 50%)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "hsl(200, 70%, 50%)" }} name="Прогноз" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-primary rounded" /> Факт</span>
          <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-chart-2 rounded" style={{ borderTop: '2px dashed' }} /> Прогноз</span>
        </div>
      </div>

      {/* Injury Notes */}
      {athlete.injuryNotes && (
        <div className="glass-card p-5 border-l-4 border-chart-4">
          <p className="text-xs text-muted-foreground mb-1">⚠️ Примітки / Травми</p>
          <p className="text-sm">{athlete.injuryNotes}</p>
        </div>
      )}

      {/* Contact */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-3">Контакти</h3>
        <div className="flex gap-6 text-sm">
          <div><p className="text-xs text-muted-foreground">Телефон</p><p className="font-medium">{athlete.phone}</p></div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{athlete.email}</p></div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoCell = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`font-semibold text-sm ${highlight ? 'text-primary' : ''}`}>{value}</p>
  </div>
);

export default Team;
