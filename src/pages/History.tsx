import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  Calendar,
  Users,
  CheckCircle2,
  Eye,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ResultsDetailsModal from "@/components/ResultsDetailsModal";

const historyData = [
  {
    id: "1",
    name: "Силове тренування",
    date: "21.02.2026",
    athletes: 8,
    exercises: 6,
    duration: "1г 30хв",
    status: "Завершено",
  },
  {
    id: "2",
    name: "Швидкісна витривалість",
    date: "20.02.2026",
    athletes: 12,
    exercises: 4,
    duration: "1г 15хв",
    status: "Завершено",
  },
  {
    id: "3",
    name: "Техніка бігу",
    date: "19.02.2026",
    athletes: 6,
    exercises: 5,
    duration: "45хв",
    status: "Завершено",
  },
  {
    id: "4",
    name: "Кросфіт",
    date: "18.02.2026",
    athletes: 10,
    exercises: 8,
    duration: "1г",
    status: "Завершено",
  },
  {
    id: "5",
    name: "Відновлювальне тренування",
    date: "17.02.2026",
    athletes: 15,
    exercises: 3,
    duration: "40хв",
    status: "Завершено",
  },
  {
    id: "6",
    name: "Силове тренування #2",
    date: "16.02.2026",
    athletes: 8,
    exercises: 7,
    duration: "1г 45хв",
    status: "Завершено",
  },
  {
    id: "7",
    name: "Інтервальний біг",
    date: "15.02.2026",
    athletes: 10,
    exercises: 3,
    duration: "50хв",
    status: "Завершено",
  },
  {
    id: "8",
    name: "Стрибкове тренування",
    date: "14.02.2026",
    athletes: 7,
    exercises: 5,
    duration: "1г 10хв",
    status: "Завершено",
  },
];

const HistoryPage = () => {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(
    null,
  );
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const allResults = useMemo(() => {
    const stored = localStorage.getItem("trainingResults") || "{}";
    return JSON.parse(stored);
  }, []);

  const selectedTrainingResults = useMemo(() => {
    if (!selectedTrainingId) return null;
    const results = Object.values(allResults).filter(
      (r: any) => r.trainingId === selectedTrainingId,
    );
    return results.length > 0 ? results[0] : null;
  }, [selectedTrainingId, allResults]);

  const handleTrainingClick = (trainingId: string) => {
    setSelectedTrainingId(trainingId);
    setIsResultsModalOpen(true);
  };

  const selectedTraining = historyData.find((t) => t.id === selectedTrainingId);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-display font-bold">Історія тренувань</h1>
          <p className="text-muted-foreground mt-1">
            Всі завершені тренування • Клікніть на тренування для перегляду
            результатів
          </p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Тренування
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Дата
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Спортсмени
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Вправи
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Тривалість
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Статус
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-4">
                    Результати
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((t, i) => {
                  const hasResults = Object.values(allResults).some(
                    (r: any) => r.trainingId === t.id,
                  );
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-b border-border/30 transition-colors ${
                        hasResults
                          ? "hover:bg-primary/10 bg-primary/5"
                          : "hover:bg-secondary/20"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <HistoryIcon className="w-4 h-4 text-primary/60" />
                          <span className="font-medium text-sm">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {t.date}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {t.athletes}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {t.exercises}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground font-mono">
                        {t.duration}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {hasResults ? (
                          <button
                            onClick={() => handleTrainingClick(t.id)}
                            className="text-xs px-3 py-1 rounded-md bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Переглянути
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Нема результатів
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Results Details Modal */}
      <ResultsDetailsModal
        isOpen={isResultsModalOpen}
        trainingName={selectedTraining?.name}
        trainingDate={selectedTraining?.date}
        results={selectedTrainingResults}
        onClose={() => setIsResultsModalOpen(false)}
      />
    </DashboardLayout>
  );
};

export default HistoryPage;
