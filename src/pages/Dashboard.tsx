import { motion } from "framer-motion";
import { Users, Dumbbell, CalendarDays, TrendingUp, Clock, Trophy } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const stats = [
  { label: "Спортсменів", value: "24", icon: Users, change: "+3 цього місяця" },
  { label: "Тренувань проведено", value: "156", icon: Dumbbell, change: "12 цього тижня" },
  { label: "Заплановано", value: "8", icon: CalendarDays, change: "на цьому тижні" },
  { label: "Середній прогрес", value: "+12%", icon: TrendingUp, change: "за місяць" },
];

const recentTrainings = [
  { name: "Силове тренування", date: "Сьогодні, 10:00", athletes: 8, status: "Завершено" },
  { name: "Швидкісна витривалість", date: "Вчора, 16:00", athletes: 12, status: "Завершено" },
  { name: "Техніка бігу", date: "20.02.2026", athletes: 6, status: "Завершено" },
];

const topAthletes = [
  { name: "Олександр Петренко", sport: "Біг 100м", result: "10.45с", trend: "up" },
  { name: "Марія Коваленко", sport: "Стрибки в довжину", result: "6.12м", trend: "up" },
  { name: "Іван Сидоренко", sport: "Штовхання ядра", result: "18.3м", trend: "down" },
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
  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-3xl font-display font-bold">Привіт, Тренере! 👋</h1>
          <p className="text-muted-foreground mt-1">Ось огляд вашої команди та тренувань</p>
        </motion.div>

        {/* Stats Grid */}
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
          {/* Recent Trainings */}
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Останні тренування</h2>
            </div>
            <div className="space-y-3">
              {recentTrainings.map((t) => (
                <div key={t.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.date} · {t.athletes} спортсменів</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Athletes */}
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Кращі спортсмени</h2>
            </div>
            <div className="space-y-3">
              {topAthletes.map((a, i) => (
                <div key={a.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
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
                    <p className="font-mono font-semibold text-sm">{a.result}</p>
                    <TrendingUp className={`w-3 h-3 ml-auto ${a.trend === 'up' ? 'text-primary' : 'text-destructive rotate-180'}`} />
                  </div>
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
