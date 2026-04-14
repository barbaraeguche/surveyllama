import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

type BarChartValue = string | number;

type BarChartDatum = {
  name: string;
  value: number;
};

type BarChartComponentProps = {
  data: readonly BarChartValue[];
  options?: readonly string[];
};

function sortChartData(a: BarChartDatum, b: BarChartDatum) {
  const numA = Number.parseFloat(a.name);
  const numB = Number.parseFloat(b.name);

  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return numA - numB;
  }

  return a.name.localeCompare(b.name, undefined, { numeric: true });
}

export default function BarChartComponent({
  data,
  options,
}: BarChartComponentProps) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};

    options?.forEach((option) => {
      counts[option] = 0;
    });

    data.forEach((value) => {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort(sortChartData);
  }, [data, options]);

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={100}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={true}
          vertical={false}
          stroke="#f0f0f0"
        />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          width={120}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Bar
          dataKey="value"
          fill="#6366f1"
          radius={[0, 4, 4, 0]}
          barSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
