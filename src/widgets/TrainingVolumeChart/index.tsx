import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrainingVolumeChartProps {
  data: { month: string; trainings: number }[];
}

const TrainingVolumeChart = ({ data }: TrainingVolumeChartProps) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-5">
      <BarChart3 className="w-5 h-5 text-primary" />
      <h2 className="font-display font-semibold">Обсяг тренувань (6 міс.)</h2>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
        <XAxis dataKey="month" stroke="hsl(220,10%,50%)" fontSize={12} />
        <YAxis stroke="hsl(220,10%,50%)" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(220,18%,11%)",
            border: "1px solid hsl(220,14%,18%)",
            borderRadius: "8px",
            color: "hsl(0,0%,95%)",
          }}
          formatter={(v: number) => [v, "Тренувань"]}
        />
        <Bar dataKey="trainings" fill="hsl(84,81%,44%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default TrainingVolumeChart;
