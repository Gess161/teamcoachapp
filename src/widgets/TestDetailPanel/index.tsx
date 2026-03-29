import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AddTestResult from "@/features/add-test-result";

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

interface TestDetailPanelProps {
  athleteId: Id<"athletes">;
  test: {
    _id: Id<"dyush_tests">;
    name: string;
    unit: string;
    lowerIsBetter: boolean;
    physicalQuality: string;
  };
  onAddResult: () => void;
}

const TestDetailPanel = ({ athleteId, test, onAddResult }: TestDetailPanelProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const results =
    useQuery(api.testResults.getByAthleteAndTest, { athleteId, testId: test._id }) ?? [];

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
        ? latest.value < prev.value ? "up" : latest.value > prev.value ? "down" : "flat"
        : latest.value > prev.value ? "up" : latest.value < prev.value ? "down" : "flat"
      : null;

  const color = QUALITY_COLORS[test.physicalQuality] ?? "hsl(84, 81%, 44%)";

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold">{test.name}</h3>
            <p className="text-sm text-muted-foreground">
              {QUALITY_LABELS[test.physicalQuality]} · одиниця: {test.unit}
              {test.lowerIsBetter && " · менше = краще"}
            </p>
          </div>
          <Button size="sm" onClick={() => { setShowAddModal(true); onAddResult(); }} className="gap-1">
            <Plus className="w-4 h-4" /> Результат
          </Button>
        </div>

        {latest && (
          <div className="flex gap-4">
            <div className="glass-card p-4 flex-1 text-center">
              <p className="text-xs text-muted-foreground mb-1">Останній результат</p>
              <p className="text-2xl font-display font-bold">
                {latest.value}{" "}
                <span className="text-sm font-normal text-muted-foreground">{test.unit}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{latest.date}</p>
            </div>
            {latest.normLevel && (
              <div className="glass-card p-4 flex-1 text-center">
                <p className="text-xs text-muted-foreground mb-1">Норматив</p>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${NORM_LEVEL_STYLES[latest.normLevel] ?? ""}`}>
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
                {trend === "up" && <TrendingUp className="w-7 h-7 text-primary mx-auto" />}
                {trend === "down" && <TrendingDown className="w-7 h-7 text-destructive mx-auto" />}
                {trend === "flat" && <Minus className="w-7 h-7 text-muted-foreground mx-auto" />}
                <p className="text-xs text-muted-foreground mt-1">
                  vs попереднє: {prev ? prev.value : "—"} {test.unit}
                </p>
              </div>
            )}
          </div>
        )}

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
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} name="Результат" />
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

        {results.length > 0 && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Дата", "Результат", "Норматив", "% норми", "Примітки"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((r) => (
                  <tr key={r._id} className="border-b border-border/30">
                    <td className="px-4 py-2 text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-2 font-mono font-semibold">{r.value} {test.unit}</td>
                    <td className="px-4 py-2">
                      {r.normLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NORM_LEVEL_STYLES[r.normLevel] ?? ""}`}>
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

      <AnimatePresence>
        {showAddModal && (
          <AddTestResult
            athleteId={athleteId}
            testId={test._id}
            testName={test.name}
            testUnit={test.unit}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TestDetailPanel;
