"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---- Status donut chart ---- */

const STATUS_COLORS: Record<string, string> = {
  "运行中": "#10b981",
  "已暂停": "#f59e0b",
  "已归档": "#a1a1aa",
};

export function StatusPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] ?? "#a1a1aa"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => [`${value ?? 0} 个`, ""]}
              contentStyle={{
                background: "var(--color-zinc-900, #18181b)",
                border: "1px solid var(--color-zinc-700, #3f3f46)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data
          .filter((d) => d.value > 0)
          .map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[d.name] ?? "#a1a1aa" }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">{d.name}</span>
              <span className="font-medium">{d.value}</span>
              <span className="text-xs text-zinc-400">
                ({Math.round((d.value / total) * 100)}%)
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ---- Deployment type bar chart ---- */

const DEPLOY_COLORS: Record<string, string> = {
  docker: "#3b82f6",
  vercel: "#000000",
  reverse_proxy: "#8b5cf6",
  static: "#06b6d4",
  other: "#a1a1aa",
};

export function DeployBarChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 13, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number | undefined) => [`${value ?? 0} 个`, "应用数"]}
            contentStyle={{
              background: "var(--color-zinc-900, #18181b)",
              border: "1px solid var(--color-zinc-700, #3f3f46)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
            }}
            cursor={{ fill: "rgba(59,130,246,0.08)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={DEPLOY_COLORS[entry.name] ?? "#3b82f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- Server load chart ---- */

export function ServerLoadChart({
  data,
}: {
  data: { name: string; services: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            formatter={(value: number | undefined) => [`${value ?? 0} 个`, "应用数"]}
            contentStyle={{
              background: "var(--color-zinc-900, #18181b)",
              border: "1px solid var(--color-zinc-700, #3f3f46)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
            }}
            cursor={{ fill: "rgba(59,130,246,0.08)" }}
          />
          <Bar dataKey="services" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
