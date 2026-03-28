import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  User,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

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

const NORM_LEVEL_LABELS: Record<string, string> = {
  excellent: "Відмінно",
  good: "Добре",
  satisfactory: "Задовільно",
  below_norm: "Нижче норми",
};

const NORM_LEVEL_STYLES: Record<string, string> = {
  excellent: "bg-primary/20 text-primary",
  good: "bg-blue-500/20 text-blue-400",
  satisfactory: "bg-yellow-500/20 text-yellow-400",
  below_norm: "bg-red-500/20 text-red-400",
};

// ─── Add Result Modal ──────────────────────────────────────────────────────────
const AddResultModal = ({
  athleteId,
  testId,
  testName,
  testUnit,
  onClose,
}: {
  athleteId: Id<"athletes">;
  testId: Id<"dyush_tests">;
  testName: string;
  testUnit: string;
  onClose: () => void;
}) => {
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
              placeholder={`напр. 4.5`}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Дата тестування</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Примітки (необов'язково)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Умови, стан спортсмена..."
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Збереження..." : "Зберегти"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Test Detail Panel ─────────────────────────────────────────────────────────
const TestDetailPanel = ({
  athleteId,
  test,
  onAddResult,
}: {
  athleteId: Id<"athletes">;
  test: { _id: Id<"dyush_tests">; name: string; unit: string; lowerIsBetter: boolean; physicalQuality: string };
  onAddResult: () => void;
}) => {
  const results = useQuery(api.testResults.getByAthleteAndTest, {
    athleteId,
    testId: test._id,
  }) ?? [];

  const chartData = results.map((r) => ({
    date: r.date,
    value: r.value,
    normPercent: r.normPercent ? Math.round(r.normPercent) : undefined,
  }));

  const latest = results[results.length - 1];
  const prev = results[results.length - 2];

  const trend =
    latest && prev
      ? test.lowerIsBetter
        ? latest.value < prev.value
          ? "up"
          : latest.value > prev.value
          ? "down"
          : "flat"
        : latest.value > prev.value
        ? "up"
        : latest.value < prev.value
        ? "down"
        : "flat"
      : null;

  const color = QUALITY_COLORS[test.physicalQuality] ?? "hsl(84, 81%, 44%)";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">{test.name}</h3>
          <p className="text-sm text-muted-foreground">
            {QUALITY_LABELS[test.physicalQuality]} · одиниця: {test.unit}
            {test.lowerIsBetter && " · менше = краще"}
          </p>
        </div>
        <Button size="sm" onClick={onAddResult} className="gap-1">
          <Plus className="w-4 h-4" /> Результат
        </Button>
      </div>

      {/* Latest result card */}
      {latest && (
        <div className="flex gap-4">
          <div className="glass-card p-4 flex-1 text-center">
            <p className="text-xs text-muted-foreground mb-1">Останній результат</p>
            <p className="text-2xl font-display font-bold">
              {latest.value} <span className="text-sm font-normal text-muted-foreground">{test.unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{latest.date}</p>
          </div>
          {latest.normLevel && (
            <div className="glass-card p-4 flex-1 text-center">
              <p className="text-xs text-muted-foreground mb-1">Норматив</p>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  NORM_LEVEL_STYLES[latest.normLevel] ?? ""
                }`}
              >
                {NORM_LEVEL_LABELS[latest.normLevel]}
              </span>
              {latest.normPercent !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(latest.normPercent)}% від норми "Добре"
                </p>
              )}
            </div>
          )}
          {trend && (
            <div className="glass-card p-4 flex-1 text-center">
              <p className="text-xs text-muted-foreground mb-1">Динаміка</p>
              {trend === "up" && (
                <TrendingUp className="w-7 h-7 text-primary mx-auto" />
              )}
              {trend === "down" && (
                <TrendingDown className="w-7 h-7 text-destructive mx-auto" />
              )}
              {trend === "flat" && (
                <Minus className="w-7 h-7 text-muted-foreground mx-auto" />
              )}
              <p className="text-xs text-muted-foreground mt-1">
                vs попереднє: {prev ? prev.value : "—"} {test.unit}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="glass-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Динаміка результатів</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="date" stroke="hsl(220, 10%, 50%)" fontSize={11} />
              <YAxis stroke="hsl(220, 10%, 50%)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 11%)",
                  border: "1px solid hsl(220, 14%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(0, 0%, 95%)",
                }}
                formatter={(v: number) => [`${v} ${test.unit}`, "Результат"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, fill: color }}
                name="Результат"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : chartData.length === 1 ? (
        <div className="glass-card p-4 text-center text-sm text-muted-foreground">
          Потрібно щонайменше 2 виміри для відображення графіка
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Ще немає результатів</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Натисніть «Результат» щоб додати перший вимір
          </p>
        </div>
      )}

      {/* All results table */}
      {results.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Дата</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Результат</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Норматив</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">% норми</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Примітки</th>
              </tr>
            </thead>
            <tbody>
              {[...results].reverse().map((r) => (
                <tr key={r._id} className="border-b border-border/30">
                  <td className="px-4 py-2 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-2 font-mono font-semibold">
                    {r.value} {test.unit}
                  </td>
                  <td className="px-4 py-2">
                    {r.normLevel && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          NORM_LEVEL_STYLES[r.normLevel] ?? ""
                        }`}
                      >
                        {NORM_LEVEL_LABELS[r.normLevel]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                    {r.normPercent !== undefined ? `${Math.round(r.normPercent)}%` : "—"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{r.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TestsPage = () => {
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const tests = useQuery(api.dyushTests.getAll, {}) ?? [];

  const [selectedAthleteId, setSelectedAthleteId] = useState<Id<"athletes"> | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<Id<"dyush_tests"> | null>(null);
  const [addResultFor, setAddResultFor] = useState<Id<"dyush_tests"> | null>(null);
  const [qualityFilter, setQualityFilter] = useState<string>("all");

  const latestResults = useQuery(
    api.testResults.getLatestByAthlete,
    selectedAthleteId ? { athleteId: selectedAthleteId } : "skip"
  ) ?? [];

  const latestByTestId = useMemo(() => {
    const map = new Map<string, typeof latestResults[0]>();
    for (const r of latestResults) {
      map.set(r.testId, r);
    }
    return map;
  }, [latestResults]);

  const qualities = ["all", ...Object.keys(QUALITY_LABELS)];

  const filteredTests = useMemo(
    () =>
      qualityFilter === "all"
        ? tests
        : tests.filter((t) => t.physicalQuality === qualityFilter),
    [tests, qualityFilter]
  );

  const selectedAthlete = athletes.find((a) => a._id === selectedAthleteId);
  const selectedTest = tests.find((t) => t._id === selectedTestId);
  const addResultTest = tests.find((t) => t._id === addResultFor);

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
                      onAddResult={() => setAddResultFor(selectedTestId)}
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

      {/* Add Result Modal */}
      <AnimatePresence>
        {addResultFor && addResultTest && selectedAthleteId && (
          <AddResultModal
            athleteId={selectedAthleteId}
            testId={addResultFor}
            testName={addResultTest.name}
            testUnit={addResultTest.unit}
            onClose={() => setAddResultFor(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TestsPage;
