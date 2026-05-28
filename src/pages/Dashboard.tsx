import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, Dumbbell, CalendarDays, TrendingUp, Clock, Trophy } from "lucide-react";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { t } = useTranslation(["dashboard", "enums"]);
  const trainings = useQuery(api.trainings.getAll) ?? [];
  const athletes = useQuery(api.athletes.getAll) ?? [];

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const completedCount = trainings.filter((tr) => tr.status === "completed").length;
    const plannedThisWeek = (() => {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return trainings.filter((tr) => {
        const d = new Date(tr.date);
        return d >= monday && d <= sunday;
      }).length;
    })();

    return [
      { label: t("stats.athletes"), value: String(athletes.length), icon: Users, change: t("stats.athletesNote") },
      { label: t("stats.completed"), value: String(completedCount), icon: Dumbbell, change: t("stats.completedNote") },
      { label: t("stats.planned"), value: String(plannedThisWeek), icon: CalendarDays, change: t("stats.plannedNote") },
      { label: t("stats.total"), value: String(trainings.length), icon: TrendingUp, change: t("stats.totalNote") },
    ];
  }, [trainings, athletes, t]);

  const recentTrainings = useMemo(
    () => [...trainings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [trainings]
  );

  const upcomingTrainings = useMemo(
    () =>
      trainings
        .filter((tr) => tr.status === "planned" && tr.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3),
    [trainings, today]
  );

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={item}>
          <h1 className="text-3xl font-display font-bold">{t("greeting")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-5 space-y-3 group hover:glow-border transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">{t("recent")}</h2>
            </div>
            <div className="space-y-3">
              {recentTrainings.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("noTrainings")}</p>
              )}
              {recentTrainings.map((tr) => (
                <div key={tr._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tr.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tr.date}
                      {tr.preparationType && ` · ${t(`enums:prepType.${tr.preparationType}`, tr.preparationType)}`}
                      {" · "}{tr.exercises.length} {t("exercises")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                    {t(`enums:status.${tr.status}`, tr.status)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">{t("upcoming")}</h2>
            </div>
            <div className="space-y-3">
              {upcomingTrainings.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("noUpcoming")}</p>
              )}
              {upcomingTrainings.map((tr, i) => (
                <div key={tr._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{tr.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tr.date}
                        {tr.loadLevel && ` · ${t("loadPrefix")} ${tr.loadLevel}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                    {tr.athleteIds.length} {t("athletesSuffix")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
