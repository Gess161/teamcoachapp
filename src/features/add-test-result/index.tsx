import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AddTestResultProps {
  athleteId: Id<"athletes">;
  testId: Id<"dyush_tests">;
  testName: string;
  testUnit: string;
  onClose: () => void;
}

const AddTestResult = ({ athleteId, testId, testName, testUnit, onClose }: AddTestResultProps) => {
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const createResult = useMutation(api.testResults.create);
  const { toast } = useToast();

  const handleSave = async () => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      toast({ description: "Введіть числовий результат", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createResult({
        athleteId,
        testId,
        date,
        value: numVal,
        notes: notes || undefined,
        testingContext: "поточне",
      });
      toast({ description: "Результат записано!" });
      onClose();
    } catch {
      toast({ description: "Помилка при збереженні", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Записати результат</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm">{testName}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Результат ({testUnit})
            </label>
            <Input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="напр. 4.5"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Дата тестування</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Примітки (необов'язково)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Умови, стан спортсмена..."
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Скасувати</Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Збереження..." : "Зберегти"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTestResult;
