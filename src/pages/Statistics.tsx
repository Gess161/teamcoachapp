import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Target, Activity, Plus } from "lucide-react";
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

const PREP_COLORS: Record<string, string> = {
  ЗФП: "hsl(200, 70%, 50%)",
  СФП: "hsl(270, 65%, 60%)",
  Технічна: "hsl(45, 90%, 55%)",
  Тактична: "hsl(20, 80%, 55%)",
  Психологічна: "hsl(340, 75%, 55%)",
  Теоретична: "hsl(160, 60%, 45%)",
  Змішана: "hsl(84, 81%, 44%)",
};

const Statistics = () => {
  const { t } = useTranslation(["statistics", "calendar", "enums"]);
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

  const isLoading = trainingsRaw === undefined || athletesRaw === undefined || allScoresRaw === undefined;

  const monthsShort = t("calendar:monthsShort", { returnObjects: true }) as string[];

  const trainingVolume = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: monthsShort[d.getMonth()],
        trainings: trainings.filter((tr) => tr.date.startsWith(key)).length,
      };
    });
  }, [trainings, monthsShort]);

  const prepDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tr of trainings)
      if (tr.preparationType)
        counts[tr.preparationType] = (counts[tr.preparationType] ?? 0) + 1;
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name: t(`enums:prepType.${name}`, name),
      value: Math.round((count / total) * 100),
      color: PREP_COLORS[name] ?? "hsl(84,81%,44%)",
    }));
  }, [trainings, t]);

  const physicalQualities = useMemo(() => {
    const map: Record<string, number> = { speed: 0, strength: 0, endurance: 0, flexibility: 0, coordination: 0 };
    const prepToQ: Record<string, string[]> = {
      ЗФП: ["endurance", "strength"],
      СФП: ["speed", "strength"],
      Технічна: ["coordination"],
      Тактична: ["coordination", "speed"],
      Змішана: ["endurance"],
    };
    const done = trainings.filter((tr) => tr.status === "completed");
    for (const tr of done)
      for (const q of prepToQ[tr.preparationType ?? ""] ?? []) map[q]++;
    const total = done.length || 1;
    return [
      { quality: t("enums:preparedness.physical.label"), score: Math.round((map.speed / total) * 100) },
      { quality: t("enums:preparedness.technical.label"), score: Math.round((map.strength / total) * 100) },
      { quality: t("enums:preparedness.tactical.label"), score: Math.round((map.endurance / total) * 100) },
      { quality: t("enums:preparedness.recovery.label"), score: Math.round((map.flexibility / total) * 100) },
      { quality: t("enums:preparedness.coordination.label"), score: Math.round((map.coordination / total) * 100) },
    ];
  }, [trainings, t]);

  const readinessRadar = useMemo(() => {
    if (selectedAthleteForRadar === "sum") {
      const latestByAthlete = new Map<string, typeof allScores[0]>();
      for (const score of allScores) {
        const athleteId = (score as any).athleteId as string;
        if (!latestByAthlete.has(athleteId)) latestByAthlete.set(athleteId, score);
      }
      if (latestByAthlete.size === 0) return null;
      let physical = 0, technical = 0, tactical = 0, psychological = 0, functional = 0, coordination = 0, recovery = 0;
      for (const score of latestByAthlete.values()) {
        physical += score.physical ?? 0; technical += score.technical ?? 0;
        tactical += score.tactical ?? 0; psychological += score.psychological ?? 0;
        functional += score.functional ?? 0; coordination += score.coordination ?? 0;
        recovery += score.recovery ?? 0;
      }
      const count = latestByAthlete.size;
      return [
        { axis: t("enums:preparedness.physical.label"), value: Math.round(physical / count) },
        { axis: t("enums:preparedness.technical.label"), value: Math.round(technical / count) },
        { axis: t("enums:preparedness.tactical.label"), value: Math.round(tactical / count) },
        { axis: t("enums:preparedness.psychological.label"), value: Math.round(psychological / count) },
        { axis: t("enums:preparedness.functional.label"), value: Math.round(functional / count) },
        { axis: t("enums:preparedness.coordination.label"), value: Math.round(coordination / count) },
        { axis: t("enums:preparedness.recovery.label"), value: Math.round(recovery / count) },
      ];
    } else {
      const filtered = allScores.filter((s) => (s as any).athleteId === selectedAthleteForRadar);
      if (filtered.length === 0) return null;
      const latest = filtered[0] as any;
      return [
        { axis: t("enums:preparedness.physical.label"), value: latest.physical ?? 0 },
        { axis: t("enums:preparedness.technical.label"), value: latest.technical ?? 0 },
        { axis: t("enums:preparedness.tactical.label"), value: latest.tactical ?? 0 },
        { axis: t("enums:preparedness.psychological.label"), value: latest.psychological ?? 0 },
        { axis: t("enums:preparedness.functional.label"), value: latest.functional ?? 0 },
        { axis: t("enums:preparedness.coordination.label"), value: latest.coordination ?? 0 },
        { axis: t("enums:preparedness.recovery.label"), value: latest.recovery ?? 0 },
      ];
    }
  }, [allScores, selectedAthleteForRadar, t]);

  const summary = useMemo(
    () => ({
      completed: trainings.filter((tr) => tr.status === "completed").length,
      planned: trainings.filter((tr) => tr.status === "planned").length,
      totalExercises: trainings.reduce((s, tr) => s + tr.exercises.length, 0),
      athletes: athletes.length,
    }),
    [trainings, athletes]
  );

  const loadDistribution = useMemo(() => {
    const c: Record<string, number> = { В: 0, ЗН: 0, С: 0, М: 0 };
    for (const tr of trainings) if (tr.loadLevel) c[tr.loadLevel] = (c[tr.loadLevel] ?? 0) + 1;
    return Object.entries(c)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: t(`enums:loadLevel.${name}`, name), value }));
  }, [trainings, t]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          {t("loading")}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <Button onClick={() => setShowReadinessModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> {t("assess")}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("summary.athletes"), value: summary.athletes, icon: Activity },
            { label: t("summary.completed"), value: summary.completed, icon: BarChart3 },
            { label: t("summary.planned"), value: summary.planned, icon: TrendingUp },
            { label: t("summary.exercises"), value: summary.totalExercises, icon: Target },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrainingVolumeChart data={trainingVolume} />
          <PhysicalQualitiesChart data={physicalQualities} />
          <PrepTypeChart data={prepDistribution} />
          <LoadDistributionChart data={loadDistribution} />
        </div>

        <PreparednessGrid />

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
          <ReadinessModal athletes={athletes} onClose={() => setShowReadinessModal(false)} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Statistics;
