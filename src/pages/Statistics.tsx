import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Plus,
} from "lucide-react";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import ReadinessModal from "@/features/readiness-scoring";
import TrainingVolumeChart from "@/widgets/TrainingVolumeChart";
import PhysicalQualitiesChart from "@/widgets/PhysicalQualitiesChart";
import PrepTypeChart from "@/widgets/PrepTypeChart";
import LoadDistributionChart from "@/widgets/LoadDistributionChart";
import ReadinessSection from "@/widgets/ReadinessSection";
import PreparednessGrid from "@/widgets/PreparednessGrid";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Січ", "Лют", "Бер", "Кві", "Тра", "Чер",
  "Лип", "Серп", "Вер", "Жов", "Лис", "Гру",
];

const PREP_COLORS: Record<string, string> = {
  ЗФП:         "hsl(200, 70%, 50%)",
  СФП:         "hsl(270, 65%, 60%)",
  Технічна:    "hsl(45, 90%, 55%)",
  Тактична:    "hsl(20, 80%, 55%)",
  Психологічна:"hsl(340, 75%, 55%)",
  Теоретична:  "hsl(160, 60%, 45%)",
  Змішана:     "hsl(84, 81%, 44%)",
};

// ─── Statistics Main Page ─────────────────────────────────────────────────────

const Statistics = () => {
  const trainingsRaw = useQuery(api.trainings.getAll);
  const athletesRaw = useQuery(api.athletes.getAll);
  const allScoresRaw = useQuery(api.readinessScores.getAll);

  const trainings = trainingsRaw ?? [];
  const athletes = athletesRaw ?? [];
  const allScores = (allScoresRaw ?? []) as {
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
  }[];
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [selectedAthleteForRadar, setSelectedAthleteForRadar] = useState<string>("sum");

  const isLoading =
    trainingsRaw === undefined ||
    athletesRaw === undefined ||
    allScoresRaw === undefined;

  // ─── Training volume per month ──────────────────────────────────────────────
  const trainingVolume = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: MONTH_NAMES[d.getMonth()],
        trainings: trainings.filter((t) => t.date.startsWith(key)).length,
      };
    });
  }, [trainings]);

  // ─── Prep type distribution ─────────────────────────────────────────────────
  const prepDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of trainings)
      if (t.preparationType)
        counts[t.preparationType] = (counts[t.preparationType] ?? 0) + 1;
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: PREP_COLORS[name] ?? "hsl(84,81%,44%)",
    }));
  }, [trainings]);

  // ─── 5 physical qualities ───────────────────────────────────────────────────
  const physicalQualities = useMemo(() => {
    const map: Record<string, number> = {
      speed: 0, strength: 0, endurance: 0, flexibility: 0, coordination: 0,
    };
    const prepToQ: Record<string, string[]> = {
      ЗФП: ["endurance", "strength"],
      СФП: ["speed", "strength"],
      Технічна: ["coordination"],
      Тактична: ["coordination", "speed"],
      Змішана: ["endurance"],
    };
    const done = trainings.filter((t) => t.status === "completed");
    for (const t of done)
      for (const q of prepToQ[t.preparationType ?? ""] ?? []) map[q]++;
    const total = done.length || 1;
    return [
      { quality: "Швидкість", score: Math.round((map.speed / total) * 100) },
      { quality: "Сила", score: Math.round((map.strength / total) * 100) },
      { quality: "Витривалість", score: Math.round((map.endurance / total) * 100) },
      { quality: "Гнучкість", score: Math.round((map.flexibility / total) * 100) },
      { quality: "Координація", score: Math.round((map.coordination / total) * 100) },
    ];
  }, [trainings]);

  // ─── Readiness radar ───────────────────────────────────────────────────────
  const readinessRadar = useMemo(() => {
    if (selectedAthleteForRadar === "sum") {
      const latestByAthlete = new Map<string, { physical?: number; technical?: number; tactical?: number; psychological?: number; functional?: number; coordination?: number; recovery?: number }>();
      for (const score of allScores) {
        const athleteId = (score as any).athleteId as string;
        if (!latestByAthlete.has(athleteId)) latestByAthlete.set(athleteId, score);
      }
      if (latestByAthlete.size === 0) return null;
      let physical = 0, technical = 0, tactical = 0, psychological = 0, functional = 0, coordination = 0, recovery = 0;
      for (const score of latestByAthlete.values()) {
        physical += score.physical ?? 0;
        technical += score.technical ?? 0;
        tactical += score.tactical ?? 0;
        psychological += score.psychological ?? 0;
        functional += score.functional ?? 0;
        coordination += score.coordination ?? 0;
        recovery += score.recovery ?? 0;
      }
      const count = latestByAthlete.size;
      return [
        { axis: "Фізична", value: Math.round(physical / count) },
        { axis: "Технічна", value: Math.round(technical / count) },
        { axis: "Тактична", value: Math.round(tactical / count) },
        { axis: "Психол.", value: Math.round(psychological / count) },
        { axis: "Функц.", value: Math.round(functional / count) },
        { axis: "Координ.", value: Math.round(coordination / count) },
        { axis: "Відновл.", value: Math.round(recovery / count) },
      ];
    } else {
      const filtered = allScores.filter((s) => (s as any).athleteId === selectedAthleteForRadar);
      if (filtered.length === 0) return null;
      const latest = filtered[0] as any;
      return [
        { axis: "Фізична", value: latest.physical ?? 0 },
        { axis: "Технічна", value: latest.technical ?? 0 },
        { axis: "Тактична", value: latest.tactical ?? 0 },
        { axis: "Психол.", value: latest.psychological ?? 0 },
        { axis: "Функц.", value: latest.functional ?? 0 },
        { axis: "Координ.", value: latest.coordination ?? 0 },
        { axis: "Відновл.", value: latest.recovery ?? 0 },
      ];
    }
  }, [allScores, selectedAthleteForRadar]);

  // ─── Summary ────────────────────────────────────────────────────────────────
  const summary = useMemo(
    () => ({
      completed: trainings.filter((t) => t.status === "completed").length,
      planned: trainings.filter((t) => t.status === "planned").length,
      totalExercises: trainings.reduce((s, t) => s + t.exercises.length, 0),
      athletes: athletes.length,
    }),
    [trainings, athletes],
  );

  const loadDistribution = useMemo(() => {
    const c: Record<string, number> = { В: 0, ЗН: 0, С: 0, М: 0 };
    for (const t of trainings)
      if (t.loadLevel) c[t.loadLevel] = (c[t.loadLevel] ?? 0) + 1;
    return Object.entries(c)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [trainings]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Завантаження...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Статистика</h1>
            <p className="text-muted-foreground mt-1">Аналіз тренувального процесу</p>
          </div>
          <Button onClick={() => setShowReadinessModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Оцінити підготовленість
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Спортсменів", value: summary.athletes, icon: Activity },
            { label: "Завершено", value: summary.completed, icon: BarChart3 },
            { label: "Заплановано", value: summary.planned, icon: TrendingUp },
            { label: "Всього вправ", value: summary.totalExercises, icon: Target },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className="w-4 h-4 text-primary/60" />
              </div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrainingVolumeChart data={trainingVolume} />
          <PhysicalQualitiesChart data={physicalQualities} />
          <PrepTypeChart data={prepDistribution} />
          <LoadDistributionChart data={loadDistribution} />
        </div>

        {/* 12 Types of Preparedness */}
        <PreparednessGrid />

        {/* Readiness Section */}
        <ReadinessSection
          allScores={allScores}
          athletes={athletes}
          onAddScore={() => setShowReadinessModal(true)}
          selectedAthleteForRadar={selectedAthleteForRadar}
          onAthleteChange={setSelectedAthleteForRadar}
          readinessRadar={readinessRadar}
        />
      </motion.div>

      <AnimatePresence>
        {showReadinessModal && (
          <ReadinessModal
            athletes={athletes}
            onClose={() => setShowReadinessModal(false)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Statistics;
