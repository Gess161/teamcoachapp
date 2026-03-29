import { User, Brain, Plus } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import IGSColorBar from "@/shared/ui/IGSColorBar";
import type { Id } from "../../../convex/_generated/dataModel";

interface ScoreEntry {
  _id: string;
  athleteId: Id<"athletes">;
  date: string;
  igs?: number;
  physical?: number;
  technical?: number;
  tactical?: number;
  psychological?: number;
  functional?: number;
  coordination?: number;
  recovery?: number;
}

interface ReadinessSectionProps {
  allScores: ScoreEntry[];
  athletes: { _id: Id<"athletes">; name: string }[];
  onAddScore: () => void;
  selectedAthleteForRadar: string;
  onAthleteChange: (id: string) => void;
  readinessRadar: { axis: string; value: number }[] | null;
}

const ReadinessSection = ({
  allScores,
  athletes,
  onAddScore,
  selectedAthleteForRadar,
  onAthleteChange,
  readinessRadar,
}: ReadinessSectionProps) => {
  if (allScores.length === 0) {
    return (
      <div className="glass-card p-8 text-center border border-dashed border-border/50">
        <Brain className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-muted-foreground">Оцінок підготовленості ще немає</p>
        <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
          Додайте оцінку щоб побачити ІГС та radar-діаграму підготовленості
        </p>
        <Button onClick={onAddScore} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Додати оцінку
        </Button>
      </div>
    );
  }

  const getIgsValue = () => {
    if (selectedAthleteForRadar === "sum") {
      const latestByAthlete = new Map<string, ScoreEntry>();
      for (const score of allScores) {
        const athleteId = score.athleteId as string;
        if (!latestByAthlete.has(athleteId)) {
          latestByAthlete.set(athleteId, score);
        }
      }
      const sum = Array.from(latestByAthlete.values()).reduce(
        (acc, s) => acc + (s.igs ?? 0),
        0,
      );
      return Math.round(sum / latestByAthlete.size);
    } else {
      const latest = allScores.find((s) => s.athleteId === selectedAthleteForRadar);
      return latest?.igs;
    }
  };

  const igsValue = getIgsValue();

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">
            ІГС — Індекс готовності спортсмена
          </h2>
        </div>
        <select
          value={selectedAthleteForRadar}
          onChange={(e) => onAthleteChange(e.target.value)}
          className="h-8 rounded-md bg-secondary/50 border border-border/50 px-2 text-sm text-foreground"
        >
          <option value="sum">Середня ІГС команди</option>
          {athletes.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
      </div>

      {readinessRadar ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={readinessRadar}>
              <PolarGrid stroke="hsl(220,14%,18%)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "hsl(220,10%,60%)", fontSize: 11 }}
              />
              <Radar
                name="Підготовленість"
                dataKey="value"
                stroke="hsl(84,81%,44%)"
                fill="hsl(84,81%,44%)"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,18%,11%)",
                  border: "1px solid hsl(220,14%,18%)",
                  borderRadius: "8px",
                  color: "hsl(0,0%,95%)",
                }}
                formatter={(v: number) => [`${v}/100`, ""]}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {readinessRadar.map((r) => (
              <div key={r.axis} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  {r.axis}
                </span>
                <div className="flex-1 bg-secondary/50 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${r.value}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-medium w-10 text-right">
                  {r.value}
                </span>
              </div>
            ))}
            {igsValue ? (
              <div className="mt-4 p-4 rounded-lg bg-primary/10 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    ІГС{" "}
                    {selectedAthleteForRadar === "sum"
                      ? "(Середня команди)"
                      : "(Індекс готовності)"}
                  </p>
                  <p className="text-3xl font-display font-bold text-primary mt-1">
                    {igsValue}
                    <span className="text-sm font-normal text-muted-foreground">
                      {selectedAthleteForRadar === "sum" ? "" : "/100"}
                    </span>
                  </p>
                </div>
                {selectedAthleteForRadar !== "sum" && (
                  <IGSColorBar variant="full" />
                )}
                <p className="text-xs text-muted-foreground">
                  {selectedAthleteForRadar === "sum"
                    ? `Середній рівень ${athletes.length} спортсменів`
                    : igsValue >= 85
                      ? "Відмінна готовність до змагань"
                      : igsValue >= 70
                        ? "Добра готовність"
                        : igsValue >= 55
                          ? "Задовільна готовність"
                          : "Потребує підготовки"}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Немає даних для обраного спортсмена
        </p>
      )}
    </div>
  );
};

export default ReadinessSection;
