import { Zap } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PhysicalQualitiesChartProps {
  data: { quality: string; score: number }[];
}

const PhysicalQualitiesChart = ({ data }: PhysicalQualitiesChartProps) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-3">
      <Zap className="w-5 h-5 text-primary" />
      <h2 className="font-display font-semibold">5 фізичних якостей</h2>
    </div>
    <p className="text-xs text-muted-foreground mb-3">
      Акцент завершених тренувань за видом підготовки
    </p>
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(220,14%,18%)" />
        <PolarAngleAxis
          dataKey="quality"
          tick={{ fill: "hsl(220,10%,60%)", fontSize: 11 }}
        />
        <Radar
          name="%"
          dataKey="score"
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
          formatter={(v: number) => [`${v}%`, "Акцент"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

export default PhysicalQualitiesChart;
