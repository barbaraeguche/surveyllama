import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, Input } from "../UI";
import { AnalyticsDateRange, AnalyticsTrend } from "../../types";

const DATE_RANGE_OPTIONS: Array<{
  value: AnalyticsDateRange;
  label: string;
}> = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom" },
];

type ResponseTrendsCardProps = {
  trends: AnalyticsTrend[];
  dateRange: AnalyticsDateRange;
  customStart: string;
  customEnd: string;
  onDateRangeChange: (range: AnalyticsDateRange) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
};

export default function ResponseTrendsCard({
  trends,
  dateRange,
  customStart,
  customEnd,
  onDateRangeChange,
  onCustomStartChange,
  onCustomEndChange,
}: ResponseTrendsCardProps) {
  if (trends.length === 0) {
    return null;
  }

  return (
    <Card className="p-8 mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold">Response Trends</h2>
          <p className="text-sm text-neutral-500">
            Daily response volume over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onDateRangeChange(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  dateRange === option.value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Input
                type="date"
                value={customStart}
                onChange={(event) => onCustomStartChange(event.target.value)}
                className="h-8 text-xs py-1"
              />
              <span className="text-neutral-400 text-xs">to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(event) => onCustomEndChange(event.target.value)}
                className="h-8 text-xs py-1"
              />
            </motion.div>
          )}
        </div>
      </div>

      <div className="h-75 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <AreaChart data={trends}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
