"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WeightChartProps {
  data: { date: string; value: number }[];
  target: number;
}

export function WeightChart({ data, target }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data yet. Log your first weight!
      </div>
    );
  }

  const minValue = Math.min(...data.map((d) => d.value), target) - 5;
  const maxValue = Math.max(...data.map((d) => d.value), target) + 5;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          domain={[minValue, maxValue]}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value} lbs`, "Weight"]}
        />
        <ReferenceLine
          y={target}
          stroke="hsl(var(--primary))"
          strokeDasharray="5 5"
          label={{
            value: `Target: ${target}`,
            position: "right",
            fill: "hsl(var(--primary))",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
