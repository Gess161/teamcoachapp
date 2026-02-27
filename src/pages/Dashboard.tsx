import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Dumbbell,
  CalendarDays,
  TrendingUp,
  Clock,
  Trophy,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import RecordingResultsModal from "@/components/RecordingResultsModal";
import ResultsDetailsModal from "@/components/ResultsDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { storage, type Training, type Athlete } from "@/lib/storage";

const stats = [
  { label: "Спортсменів", value: "24", icon: Users, change: "+3 цього місяця" },
  {
    label: "Тренувань проведено",
    value: "156",
    icon: Dumbbell,
    change: "12 цього тижня",
  },
  {
    label: "Заплановано",
    value: "8",
    icon: CalendarDays,
    change: "на цьому тижні",
  },
  {
    label: "Середній прогрес",
    value: "+12%",
    icon: TrendingUp,
    change: "за місяць",
  },
];

const topAthletes = [
  {
    name: "Олександр Петренко",
    sport: "Біг 100м",
    result: "10.45с",
    trend: "up",
  },
  {
    name: "Марія Коваленко",
    sport: "Стрибки в довжину",
    result: "6.12м",
    trend: "up",
  },
  {
    name: "Іван Сидоренко",
    sport: "Штовхання ядра",
    result: "18.3м",
    trend: "down",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const [trainings, setTrainings] = useState<Training[]>(storage.getTrainings());
  const [athletes, setAthletes] = useState<Athlete[]>(storage.getAthletes());
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const selectedTraining = trainings.find((t) => t.id === selectedTrainingId);

  const handleViewResults = (trainingId: string) => {
    setSelectedTrainingId(trainingId);
    setIsViewResultsModalOpen(true);
  };

  useEffect(() => {
    storage.setTrainings(trainings);
  }, [trainings]);

  useEffect(() => {
    storage.setAthletes(athletes);
  }, [athletes]);

  const handleSaveResults = (results: any) => {
    const trainingName = trainings.find((t) => t.id === results.trainingId)?.name || "Unknown";

    // Get existing results from localStorage
    const existingResults = JSON.parse(localStorage.getItem("trainingResults") || "{}");

    // Add new results with timestamp
    const sessionKey = `${results.trainingId}_${new Date().getTime()}`;
    existingResults[sessionKey] = {
      ...results,
      trainingName,
      recordedAt: new Date().toISOString(),
    };

    // Save back to localStorage
    localStorage.setItem("trainingResults", JSON.stringify(existingResults));

    toast({
      description: "Результати тренування успішно записано!",
    });
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-3xl font-display font-bold">
            Привіт, Тренере! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ось огляд вашої команди та тренувань
          </p>
        </motion.div>

        {/* Record Results Button */}
        <motion.div variants={item}>
          <Button
            onClick={() => setIsResultsModalOpen(true)}
            className="gap-2 w-full sm:w-auto"
            size="lg"
          >
            <FileText className="h-5 w-5" />
            Записати результати тренування
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-5 space-y-3 group hover:glow-border transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Trainings */}
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">
                Останні тренування
              </h2>
            </div>
            <div className="space-y-3">
              {trainings.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.date} · {t.exercises.length} вправ
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {t.status === "completed" ? "Завершено" : t.status === "planned" ? "Заплановано" : "В процесі"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewResults(t.id)}
                      title="Переглянути результати"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Athletes */}
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">
                Кращі спортсмени
              </h2>
            </div>
            <div className="space-y-3">
              {topAthletes.map((a, i) => (
                <div
                  key={a.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.sport}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-sm">
                      {a.result}
                    </p>
                    <TrendingUp
                      className={`w-3 h-3 ml-auto ${a.trend === "up" ? "text-primary" : "text-destructive rotate-180"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recording Results Modal */}
        <RecordingResultsModal
          isOpen={isResultsModalOpen}
          trainings={trainings}
          athletes={athletes}
          onClose={() => setIsResultsModalOpen(false)}
          onSave={handleSaveResults}
        />

        {/* View Results Modal */}
        {selectedTraining && selectedTrainingResults && (
          <ResultsDetailsModal
            isOpen={isViewResultsModalOpen}
            trainingName={selectedTraining.name}
            trainingDate={selectedTraining.date}
            results={selectedTrainingResults}
            onClose={() => setIsViewResultsModalOpen(false)}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
