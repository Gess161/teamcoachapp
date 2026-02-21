import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface Athlete {
  id: string;
  name: string;
  age: number;
  sport: string;
  position: string;
  phone: string;
  bestResult: string;
}

const initialAthletes: Athlete[] = [
  { id: "1", name: "Олександр Петренко", age: 22, sport: "Легка атлетика", position: "Спринтер", phone: "+380991234567", bestResult: "10.45с (100м)" },
  { id: "2", name: "Марія Коваленко", age: 20, sport: "Легка атлетика", position: "Стрибки в довжину", phone: "+380997654321", bestResult: "6.12м" },
  { id: "3", name: "Іван Сидоренко", age: 24, sport: "Легка атлетика", position: "Ядро", phone: "+380991112233", bestResult: "18.3м" },
  { id: "4", name: "Анна Шевченко", age: 19, sport: "Легка атлетика", position: "400м", phone: "+380994445566", bestResult: "52.1с" },
  { id: "5", name: "Дмитро Бондар", age: 23, sport: "Легка атлетика", position: "Стрибки у висоту", phone: "+380997778899", bestResult: "2.15м" },
];

const Team = () => {
  const [athletes, setAthletes] = useState<Athlete[]>(initialAthletes);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [form, setForm] = useState({ name: "", age: "", sport: "", position: "", phone: "", bestResult: "" });
  const { toast } = useToast();

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.sport.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingAthlete(null);
    setForm({ name: "", age: "", sport: "", position: "", phone: "", bestResult: "" });
    setShowModal(true);
  };

  const openEdit = (a: Athlete) => {
    setEditingAthlete(a);
    setForm({ name: a.name, age: String(a.age), sport: a.sport, position: a.position, phone: a.phone, bestResult: a.bestResult });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.age) return;
    if (editingAthlete) {
      setAthletes((prev) => prev.map((a) => a.id === editingAthlete.id ? { ...a, ...form, age: Number(form.age) } : a));
      toast({ title: "Оновлено", description: `${form.name} змінено` });
    } else {
      const newAthlete: Athlete = { id: Date.now().toString(), ...form, age: Number(form.age) };
      setAthletes((prev) => [...prev, newAthlete]);
      toast({ title: "Додано", description: `${form.name} додано до команди` });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const a = athletes.find((x) => x.id === id);
    setAthletes((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Видалено", description: `${a?.name} видалено з команди` });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Команда</h1>
            <p className="text-muted-foreground mt-1">{athletes.length} спортсменів</p>
          </div>
          <Button onClick={openAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Додати спортсмена
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за ім'ям або видом спорту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 h-11"
          />
        </div>

        {/* Athletes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-5 space-y-4 group hover:glow-border transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">{a.position}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Вік</p>
                  <p className="font-medium">{a.age} років</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Спорт</p>
                  <p className="font-medium">{a.sport}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Телефон</p>
                  <p className="font-medium">{a.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Кращий результат</p>
                  <p className="font-medium text-primary">{a.bestResult}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card p-6 w-full max-w-md space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">
                    {editingAthlete ? "Редагувати" : "Новий спортсмен"}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "name", label: "Ім'я", placeholder: "Олександр Петренко" },
                    { key: "age", label: "Вік", placeholder: "22", type: "number" },
                    { key: "sport", label: "Вид спорту", placeholder: "Легка атлетика" },
                    { key: "position", label: "Спеціалізація", placeholder: "Спринтер" },
                    { key: "phone", label: "Телефон", placeholder: "+380991234567" },
                    { key: "bestResult", label: "Кращий результат", placeholder: "10.45с (100м)" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">{field.label}</Label>
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={(form as any)[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                  ))}
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

export default Team;
