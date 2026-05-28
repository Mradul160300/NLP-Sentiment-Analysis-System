"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SentimentSummary } from "@/services/api";

interface SentimentChartProps {
  summary: SentimentSummary;
}

const COLORS = {
  positive: "#34d399",
  negative: "#f87171",
  neutral: "#fbbf24",
};

export default function SentimentChart({ summary }: SentimentChartProps) {
  const data = [
    { name: "Positive", value: summary.positive, color: COLORS.positive },
    { name: "Negative", value: summary.negative, color: COLORS.negative },
    { name: "Neutral", value: summary.neutral, color: COLORS.neutral },
  ].filter((d) => d.value > 0);

  return (
    <div className="glass p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-1">Sentiment Distribution</h3>
      <p className="text-muted text-sm mb-6">{summary.total} comments analyzed</p>

      <div className="flex items-center gap-8">
        {/* Chart */}
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1a1c2e",
                  border: "1px solid #2a2d4a",
                  borderRadius: "12px",
                  color: "#e8eaf6",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Stats */}
        <div className="flex flex-col gap-4 flex-1">
          {[
            { label: "Positive", count: summary.positive, pct: summary.positive_pct, color: "positive" },
            { label: "Negative", count: summary.negative, pct: summary.negative_pct, color: "negative" },
            { label: "Neutral", count: summary.neutral, pct: summary.neutral_pct, color: "neutral" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: COLORS[item.color as keyof typeof COLORS] }}
              />
              <span className="text-sm font-medium w-20">{item.label}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.pct}%`,
                    background: COLORS[item.color as keyof typeof COLORS],
                  }}
                />
              </div>
              <span className="text-muted text-sm w-14 text-right">
                {item.pct}%
              </span>
              <span className="text-muted text-xs w-10 text-right">
                ({item.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
