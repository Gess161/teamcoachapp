import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  User,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import TestDetailPanel from "@/widgets/TestDetailPanel";

const QUALITY_LABELS: Record<string, string> = {
  speed: "Швидкість",
  strength: "Сила",
  endurance: "Витривалість",
  flexibility: "Гнучкість",
  coordination: "Координація",
};

const QUALITY_COLORS: Record<string, string> = {
  speed: "hsl(45, 90%, 55%)",
  strength: "hsl(340, 75%, 55%)",
  endurance: "hsl(200, 70%, 50%)",
  flexibility: "hsl(160, 60%, 45%)",
  coordination: "hsl(270, 65%, 60%)",
};

const NORM_LEVEL_STYLES: Record<string, string> = {
  excellent: "bg-primary/20 text-primary",
  good: "bg-blue-500/20 text-blue-400",
  satisfactory: "bg-yellow-500/20 text-yellow-400",
  below_norm: "bg-red-500/20 text-red-400",
};

const NORM_LEVEL_LABELS: Record<string, string> = {
  excellent: "Відмінно",
  good: "Добре",
  satisfactory: "Задовільно",
  below_norm: "Нижче норми",
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TestsPage = () => {
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const tests = useQuery(api.dyushTests.getAll, {}) ?? [];

  const [selectedAthleteId, setSelectedAthleteId] = useState<Id<"athletes"> | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<Id<"dyush_tests"> | null>(null);
  const [qualityFilter, setQualityFilter] = useState<string>("all");

  const latestResults =
    useQuery(
      api.testResults.getLatestByAthlete,
      selectedAthleteId ? { athleteId: selectedAthleteId } : "skip",
    ) ?? [];

  const latestByTestId = useMemo(() => {
    const map = new Map<string, (typeof latestResults)[0]>();
    for (const r of latestResults) map.set(r.testId, r);
    return map;
  }, [latestResults]);

  const qualities = ["all", ...Object.keys(QUALITY_LABELS)];

  const filteredTests = useMemo(
    () =>
      qualityFilter === "all"
        ? tests
        : tests.filter((t) => t.physicalQuality === qualityFilter),
    [tests, qualityFilter],
  );

  const selectedAthlete = athletes.find((a) => a._id === selectedAthleteId);
  const selectedTest = tests.find((t) => t._id === selectedTestId);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-display font-bold">Тести ДЮСШ</h1>
          <p className="text-muted-foreground mt-1">
            Нормативи та динаміка результатів · {tests.length} тестів
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Athlete list */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Спортсмени
            </p>
            {athletes.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">Ще немає спортсменів</p>
            )}
            {athletes.map((a) => (
              <button
                key={a._id}
                onClick={() => {
                  setSelectedAthleteId(a._id);
                  setSelectedTestId(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedAthleteId === a._id
                    ? "bg-primary/10 text-primary glow-border"
                    : "text-foreground hover:bg-secondary/50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.dateOfBirth.substring(0, 4)} · {a.gender === "male" ? "♂" : "♀"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Right: Tests panel */}
          <div className="lg:col-span-3">
            {!selectedAthleteId ? (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
                <ClipboardCheck className="w-14 h-14 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">Оберіть спортсмена зліва</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  щоб переглянути нормативи та динаміку
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Athlete header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold">{selectedAthlete?.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedAthlete?.sport} · {selectedAthlete?.qualification}
                    </p>
                  </div>
                </div>

                {selectedTestId && selectedTest ? (
                  <>
                    <button
                      onClick={() => setSelectedTestId(null)}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      ← Назад до тестів
                    </button>
                    <TestDetailPanel
                      athleteId={selectedAthleteId}
                      test={selectedTest}
                      onAddResult={() => {}}
                    />
                  </>
                ) : (
                  <>
                    {/* Quality filter tabs */}
                    <div className="flex gap-1 flex-wrap">
                      {qualities.map((q) => (
                        <button
                          key={q}
                          onClick={() => setQualityFilter(q)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            qualityFilter === q
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {q === "all" ? "Всі" : QUALITY_LABELS[q]}
                        </button>
                      ))}
                    </div>

                    {/* Test cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredTests.map((test) => {
                        const latest = latestByTestId.get(test._id);
                        const color = QUALITY_COLORS[test.physicalQuality] ?? "hsl(84, 81%, 44%)";
                        return (
                          <motion.button
                            key={test._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setSelectedTestId(test._id)}
                            className="glass-card p-4 text-left hover:glow-border transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{test.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  <span
                                    className="inline-block w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: color }}
                                  />
                                  {QUALITY_LABELS[test.physicalQuality]} · {test.unit}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                            </div>

                            {latest ? (
                              <div className="mt-3 flex items-center justify-between">
                                <span className="font-mono font-semibold text-sm">
                                  {latest.value} {test.unit}
                                </span>
                                {latest.normLevel && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      NORM_LEVEL_STYLES[latest.normLevel] ?? ""
                                    }`}
                                  >
                                    {NORM_LEVEL_LABELS[latest.normLevel]}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="mt-3 text-xs text-muted-foreground/60">
                                Немає результатів
                              </p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TestsPage;
