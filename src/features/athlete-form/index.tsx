import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, FF } from "@/widgets/AthleteProfile";
import type { FormState, CyclePhase } from "@/entities/athlete/types";
import type { Id } from "../../../convex/_generated/dataModel";

const AthleteFormModal = ({
  editingId,
  form,
  setForm,
  onSave,
  onClose,
}: {
  editingId: Id<"athletes"> | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
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
            {editingId ? "Редагувати" : "Новий спортсмен"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          <Section label="Особисті дані">
            <div className="grid grid-cols-2 gap-3">
              <FF
                label="ПІБ"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Олена Коваленко"
                span={2}
              />
              <FF
                label="Дата народження"
                value={form.dateOfBirth}
                onChange={(v) => setForm({ ...form, dateOfBirth: v })}
                type="date"
              />
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">
                  Стать
                </Label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as "male" | "female",
                    })
                  }
                  className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  <option value="male">Чоловіча</option>
                  <option value="female">Жіноча</option>
                </select>
              </div>
              <FF
                label="Телефон"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="+380..."
              />
              <FF
                label="Email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="email@mail.com"
              />
            </div>
          </Section>
          <Section label="Фізичні дані">
            <div className="grid grid-cols-3 gap-3">
              <FF
                label="Зріст (см)"
                value={form.height}
                onChange={(v) => setForm({ ...form, height: v })}
                type="number"
                placeholder="170"
              />
              <FF
                label="Вага (кг)"
                value={form.weight}
                onChange={(v) => setForm({ ...form, weight: v })}
                type="number"
                placeholder="65"
              />
              <FF
                label="Стаж (років)"
                value={form.trainingAge}
                onChange={(v) => setForm({ ...form, trainingAge: v })}
                type="number"
                placeholder="4"
              />
            </div>
          </Section>
          <Section label="Спортивні дані">
            <div className="grid grid-cols-2 gap-3">
              <FF
                label="Вид спорту"
                value={form.sport}
                onChange={(v) => setForm({ ...form, sport: v })}
                placeholder="Гандбол"
              />
              <FF
                label="Спеціалізація"
                value={form.specialization}
                onChange={(v) =>
                  setForm({ ...form, specialization: v })
                }
                placeholder="Лівий крайній"
              />
              <FF
                label="Кваліфікація"
                value={form.qualification}
                onChange={(v) => setForm({ ...form, qualification: v })}
                placeholder="КМС"
              />
              <FF
                label="Кращий результат"
                value={form.bestResult}
                onChange={(v) => setForm({ ...form, bestResult: v })}
                placeholder="—"
              />
              <FF
                label="Цільовий результат"
                value={form.targetResult}
                onChange={(v) => setForm({ ...form, targetResult: v })}
                placeholder="—"
              />
            </div>
          </Section>
          <Section label="Тренувальний цикл">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Поточна фаза підготовки
              </Label>
              <select
                value={form.currentCyclePhase}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentCyclePhase: e.target.value as CyclePhase,
                  })
                }
                className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground"
              >
                <option value="preparatory_general">
                  Підготовчий загальний
                </option>
                <option value="preparatory_special">
                  Підготовчий спеціальний
                </option>
                <option value="pre_competitive">Передзмагальний</option>
                <option value="competitive">Змагальний</option>
                <option value="restorative">Відновний</option>
                <option value="transitional">Перехідний</option>
              </select>
            </div>
          </Section>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Травми / обмеження
              </Label>
              <Textarea
                value={form.injuryNotes}
                onChange={(e) =>
                  setForm({ ...form, injuryNotes: e.target.value })
                }
                placeholder="Інформація про травми..."
                className="bg-secondary/50 border-border/50 min-h-[60px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Нотатки тренера
              </Label>
              <Textarea
                value={form.personalNotes}
                onChange={(e) =>
                  setForm({ ...form, personalNotes: e.target.value })
                }
                placeholder="Особливості роботи з цим спортсменом..."
                className="bg-secondary/50 border-border/50 min-h-[60px]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Скасувати
          </Button>
          <Button onClick={onSave} className="flex-1">
            {editingId ? "Зберегти" : "Додати"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteFormModal;
