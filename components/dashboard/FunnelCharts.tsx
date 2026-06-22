"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ingestionData = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 6 },
  { day: "Fri", count: 5 },
  { day: "Sat", count: 2 },
  { day: "Sun", count: 4 },
];

const previewData = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 12 },
  { day: "Wed", count: 10 },
  { day: "Thu", count: 15 },
  { day: "Fri", count: 11 },
  { day: "Sat", count: 6 },
  { day: "Sun", count: 9 },
];

const downloadData = [
  { day: "Week 1", count: 3 },
  { day: "Week 2", count: 5 },
  { day: "Week 3", count: 4 },
  { day: "Week 4", count: 7 },
];

type ChartCardProps = {
  title: string;
  children: ReactNode;
};

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-lg border border-border-light bg-surface p-6 card-shadow">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <div className="h-[220px] w-full min-w-0">{children}</div>
    </article>
  );
}

export function FunnelCharts() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-text-primary">
          Funnel analytics
        </h2>
        <p className="text-sm text-text-secondary">
          Mock preview — real PostHog data wires in Feature 16.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <ChartCard title="Ingestions over time">
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <AreaChart data={ingestionData}>
              <CartesianGrid
                stroke="var(--color-border-light)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-primary)"
                fill="var(--color-primary-muted)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Previews rendered">
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <BarChart data={previewData}>
              <CartesianGrid
                stroke="var(--color-border-light)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Downloads completed">
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <BarChart data={downloadData}>
              <CartesianGrid
                stroke="var(--color-border-light)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-success)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
