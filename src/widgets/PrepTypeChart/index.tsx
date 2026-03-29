import { Target } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PrepTypeChartProps {
  data: { name: string; value: number; color: string }[];
}

const PrepTypeChart = ({ data }: PrepTypeChartProps) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-5">
      <Target className="w-5 h-5 text-primary" />
      <h2 className="font-display font-semibold">Вид підготовки</h2>
    </div>
    {data.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        Немає тренувань з вказаним видом підготовки
      </p>
    ) : (
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={190}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              dataKey="value"
              stroke="none"
            >
              {data.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220,18%,11%)",
                border: "1px solid hsl(220,14%,18%)",
                borderRadius: "8px",
                color: "hsl(0,0%,95%)",
              }}
              formatter={(v: number) => [`${v}%`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default PrepTypeChart;
