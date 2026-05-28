import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface LoadDistributionChartProps {
  data: { name: string; value: number }[];
}

const LoadDistributionChart = ({ data }: LoadDistributionChartProps) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold">{t("charts.loadDistribution")}</h2>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("charts.noLoad")}</p>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" horizontal={false} />
            <XAxis type="number" stroke="hsl(220,10%,50%)" fontSize={12} allowDecimals={false} />
            <YAxis type="category" dataKey="name" stroke="hsl(220,10%,50%)" fontSize={13} width={50} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(220,18%,11%)", border: "1px solid hsl(220,14%,18%)", borderRadius: "8px", color: "hsl(0,0%,95%)" }}
              formatter={(v: number) => [v, t("charts.trainings")]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_e, i) => {
                const colors = ["hsl(340,75%,55%)", "hsl(20,80%,55%)", "hsl(45,90%,55%)", "hsl(160,60%,45%)"];
                return <Cell key={i} fill={colors[i % colors.length]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LoadDistributionChart;
