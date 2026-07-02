"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "./types";

interface RevenueChartProps {
  data: RevenuePoint[];
  range: "7d" | "30d" | "90d" | "custom";
}

export function RevenueChart({ data, range }: RevenueChartProps) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Revenue Analytics</h2>
          <p className="mt-1 text-sm text-slate-400">Performance across {range === "7d" ? "the last 7 days" : range === "30d" ? "the last 30 days" : range === "90d" ? "the last 90 days" : "your custom date range"}</p>
        </div>
        <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">Interactive</div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#22d3ee" fillOpacity={1} fill="url(#revenueFill)" strokeWidth={3} />
            <Area type="monotone" dataKey="spend" stroke="#f59e0b" fillOpacity={0.06} fill="#f59e0b" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
