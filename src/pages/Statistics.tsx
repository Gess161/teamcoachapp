import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

const trainingVolume = [
  { month: "Вер", trainings: 18 },
  { month: "Жов", trainings: 22 },
  { month: "Лис", trainings: 20 },
  { month: "Гру", trainings: 16 },
  { month: "Січ", trainings: 24 },
  { month: "Лют", trainings: 21 },
];

const performanceData = [
  { week: "Тижд 1", sprint: 11.2, endurance: 65, strength: 78 },
  { week: "Тижд 2", sprint: 11.0, endurance: 68, strength: 80 },
  { week: "Тижд 3", sprint: 10.8, endurance: 70, strength: 82 },
  { week: "Тижд 4", sprint: 10.7, endurance: 72, strength: 85 },
  { week: "Тижд 5", sprint: 10.6, endurance: 75, strength: 83 },
  { week: "Тижд 6", sprint: 10.5, endurance: 74, strength: 87 },
  { week: "Тижд 7", sprint: 10.45, endurance: 78, strength: 88 },
  { week: "Тижд 8", sprint: 10.4, endurance: 80, strength: 90 },
];

const exerciseDistribution = [
  { name: "Сила", value: 35, color: "hsl(84, 81%, 44%)" },
  { name: "Витривалість", value: 25, color: "hsl(200, 70%, 50%)" },
  { name: "Швидкість", value: 20, color: "hsl(45, 90%, 55%)" },
  { name: "Техніка", value: 12, color: "hsl(340, 75%, 55%)" },
  { name: "Відновлення", value: 8, color: "hsl(160, 60%, 45%)" },
];

const athleteResults = [
  { name: "О. Петренко", result100: "10.45", result200: "21.3", jump: "-", progress: "+5%" },
  { name: "М. Коваленко", result100: "-", result200: "-", jump: "6.12м", progress: "+3%" },
  { name: "І. Сидоренко", result100: "-", result200: "-", jump: "-", progress: "-2%" },
  { name: "А. Шевченко", result100: "-", result200: "52.1 (400м)", jump: "-", progress: "+8%" },
  { name: "Д. Бондар", result100: "-", result200: "-", jump: "2.15м", progress: "+4%" },
];

const Statistics = () => {
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Статистика</h1>
            <p className="text-muted-foreground mt-1">Аналіз результатів та прогресу</p>
          </div>
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
            {(["week", "month", "quarter"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "week" ? "Тиждень" : p === "month" ? "Місяць" : "Квартал"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Volume */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">Обсяг тренувань</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trainingVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)" }}
                />
                <Bar dataKey="trainings" fill="hsl(84, 81%, 44%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Trends */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">Динаміка результатів</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="week" stroke="hsl(220, 10%, 50%)" fontSize={11} />
                <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)" }}
                />
                <Line type="monotone" dataKey="strength" stroke="hsl(84, 81%, 44%)" strokeWidth={2} dot={{ r: 3 }} name="Сила" />
                <Line type="monotone" dataKey="endurance" stroke="hsl(200, 70%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Витривалість" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Exercise Distribution */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">Розподіл вправ</h2>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={exerciseDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {exerciseDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {exerciseDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Athlete Results Table */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold mb-4">Результати спортсменів</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Спортсмен</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">100м</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">200м/400м</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Стрибки</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Прогрес</th>
                  </tr>
                </thead>
                <tbody>
                  {athleteResults.map((a) => (
                    <tr key={a.name} className="border-b border-border/30">
                      <td className="py-3 font-medium">{a.name}</td>
                      <td className="py-3 font-mono text-muted-foreground">{a.result100}</td>
                      <td className="py-3 font-mono text-muted-foreground">{a.result200}</td>
                      <td className="py-3 font-mono text-muted-foreground">{a.jump}</td>
                      <td className={`py-3 font-mono font-semibold ${a.progress.startsWith('+') ? 'text-primary' : 'text-destructive'}`}>
                        {a.progress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Statistics;
