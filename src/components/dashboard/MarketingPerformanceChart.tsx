"use client";

import { Download, Filter, TrendingUp } from "lucide-react";
import { ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import Card from "./common/Card";
import SectionTitle from "./common/SectionTitle";
import { performanceSeries } from "./mock-data";

const chartData = performanceSeries.map((point) => ({
  name: point.label,
  revenue: point.value + 18,
  leads: point.value + 8,
  conversions: point.value - 4,
  impressions: point.value + 30,
}));

export default function MarketingPerformanceChart() {
  return (
    <Card className="xl:col-span-2">
      <SectionTitle
        title="Marketing performance"
        subtitle="Cross-channel growth for the last 7 days"
        action={
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-slate-300 transition hover:border-cyan-500/40 hover:text-white">
              <Filter size={16} />
            </button>
            <button className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20">
              <span className="flex items-center gap-2">
                <Download size={14} /> Export
              </span>
            </button>
          </div>
        }
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { label: "Revenue", value: "$104.2K", tone: "text-cyan-300" },
          { label: "Leads", value: "1,340", tone: "text-emerald-300" },
          { label: "Conversions", value: "7.8%", tone: "text-amber-300" },
          { label: "Impressions", value: "2.4M", tone: "text-rose-300" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300">
            <span className={metric.tone}>{metric.label}</span> • {metric.value}
          </div>
        ))}
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.36} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#22d3ee" fill="url(#revenue)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
        <TrendingUp size={16} className="text-cyan-300" />
        Conversion velocity is improving ahead of the next launch window.
      </div>
    </Card>
  );
}
