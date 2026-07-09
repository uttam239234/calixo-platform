"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Share2,
  FileText,
  Bot,
  FileBarChart,
  Search,
  Bell,
  Sparkles,
  TrendingUp,
  CircleDollarSign,
  Users,
  Workflow,
  ArrowUpRight,
} from "lucide-react";

const railIcons = [
  { icon: LayoutDashboard, active: true },
  { icon: BarChart3, active: false },
  { icon: Megaphone, active: false },
  { icon: Share2, active: false },
  { icon: FileText, active: false },
  { icon: Bot, active: false, ai: true },
  { icon: FileBarChart, active: false },
];

const kpis = [
  { label: "Revenue", value: "$482K", change: "+18.2%", icon: CircleDollarSign },
  { label: "Marketing ROI", value: "4.8x", change: "+12.4%", icon: TrendingUp },
  { label: "Active Pipeline", value: "1,204", change: "+9.6%", icon: Users },
  { label: "Automations Live", value: "86", change: "steady", icon: Workflow },
];

const barHeights = [38, 52, 46, 64, 58, 74, 68, 82, 76, 92, 88, 100];

export function ProductScreenshot() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0F1225] shadow-[0_40px_120px_-20px_rgba(79,70,229,0.35)] ring-1 ring-white/[0.04]"
      >
        {/* Chrome bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <span className="hidden text-xs font-medium text-white/40 sm:inline">Calixo / Growth Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/40 md:flex">
              <Search size={12} />
              <span>Search or ask AI…</span>
              <kbd className="ml-2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/50">
              <Bell size={13} />
            </div>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A78BFA]" />
          </div>
        </div>

        <div className="flex">
          {/* Icon rail */}
          <div className="hidden w-16 flex-shrink-0 flex-col items-center gap-2 border-r border-white/[0.06] bg-white/[0.015] py-5 sm:flex">
            {railIcons.map(({ icon: Icon, active, ai }, i) => (
              <div
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-[#6366F1]/15 text-[#818CF8]"
                    : ai
                      ? "text-[#A78BFA]/70"
                      : "text-white/25"
                }`}
              >
                <Icon size={17} />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-white">Good morning, Alex 👋</p>
                <p className="text-xs text-white/40">Here&apos;s what&apos;s driving growth today</p>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full border border-[#A78BFA]/25 bg-[#A78BFA]/10 px-3 py-1.5 text-[11px] font-medium text-[#C4B5FD] sm:flex">
                <Sparkles size={12} />
                AI briefing ready
              </div>
            </div>

            {/* KPI grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-white/40">{kpi.label}</span>
                    <kpi.icon size={13} className="text-white/25" />
                  </div>
                  <p className="mt-1.5 text-lg font-bold text-white">{kpi.value}</p>
                  <span className={`text-[11px] font-semibold ${kpi.change === "steady" ? "text-white/35" : "text-[#34D399]"}`}>
                    {kpi.change !== "steady" && "↑ "}
                    {kpi.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart + AI panel */}
            <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">Marketing Performance</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/35">Last 30 days</span>
                </div>
                <div className="mt-4 flex h-24 items-end gap-1.5">
                  {barHeights.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#6366F1]/70 to-[#A78BFA]/70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#A78BFA]/15 bg-gradient-to-br from-white/[0.02] to-[#A78BFA]/[0.06] p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#A78BFA]">
                    <Bot size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/80">AI Copilot</span>
                </div>
                <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/55">
                  Shifting 12% of budget from Display to Search could lift ROAS by an estimated 0.6x this month.
                </p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-medium text-white/70">
                  Apply recommendation <ArrowUpRight size={11} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating accent card — top right */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.9 }, y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
        className="absolute -right-4 -top-6 hidden rounded-2xl border border-white/10 bg-[#131626]/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block md:-right-8"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#34D399]/15 text-[#34D399]">
            <TrendingUp size={15} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-white/40">Campaign live</p>
            <p className="text-[13px] font-bold text-white">CTR +24% this week</p>
          </div>
        </div>
      </motion.div>

      {/* Floating accent card — bottom left */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 1.1 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.6 } }}
        className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-white/10 bg-[#131626]/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block md:-left-8"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#A78BFA]">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-white/40">AI Copilot</p>
            <p className="text-[13px] font-bold text-white">3 optimizations found</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
