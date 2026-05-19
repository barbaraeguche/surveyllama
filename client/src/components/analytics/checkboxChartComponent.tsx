import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";

type CheckboxView = "individual" | "combinations";

type CheckboxResponse = readonly string[];

type CheckboxChartDatum = {
  name: string;
  value: number;
  fill: string;
};

type CheckboxYAxisTickProps = {
  x?: number | string;
  y?: number | string;
  payload?: {
    value?: string | number;
  };
};

type CheckboxChartComponentProps = {
  data: readonly CheckboxResponse[];
};

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

function mapCountsToChartData(
  counts: Record<string, number>,
): CheckboxChartDatum[] {
  return Object.entries(counts).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length],
  }));
}

function renderCombinationTick({
  x = 0,
  y = 0,
  payload,
}: CheckboxYAxisTickProps) {
  const label = String(payload?.value ?? "");
  const truncatedLabel =
    label.length > 20 ? `${label.substring(0, 20)}...` : label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-10}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#64748b"
        fontSize={10}
        fontWeight={500}
      >
        {truncatedLabel}
      </text>
    </g>
  );
}

export default function CheckboxChartComponent({
  data,
}: CheckboxChartComponentProps) {
  const [view, setView] = useState<CheckboxView>("individual");

  const { individualData, combinationData } = useMemo(() => {
    const individualCounts: Record<string, number> = {};
    const combinationCounts: Record<string, number> = {};

    data.forEach((response) => {
      response.forEach((value) => {
        individualCounts[value] = (individualCounts[value] || 0) + 1;
      });

      if (response.length > 0) {
        const combinationKey = [...response].sort().join(" + ");
        combinationCounts[combinationKey] =
          (combinationCounts[combinationKey] || 0) + 1;
      }
    });

    return {
      individualData: mapCountsToChartData(individualCounts),
      combinationData: mapCountsToChartData(combinationCounts)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    };
  }, [data]);

  if (individualData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-400">
        <p className="italic text-sm">No data to display.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-4">
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setView("individual")}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
              view === "individual"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setView("combinations")}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
              view === "combinations"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            Combinations
          </button>
        </div>
      </div>

      <div className="grow min-h-0">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          {view === "individual" ? (
            <PieChart>
              <Pie
                data={individualData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs text-neutral-600">{value}</span>
                )}
              />
            </PieChart>
          ) : (
            <BarChart
              data={combinationData}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
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
                width={150}
                tick={renderCombinationTick}
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
                barSize={20}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
