"use client";

import { ArrowRight, Brain, CalendarDays, Sparkles } from "lucide-react";
import ActionButton from "./common/ActionButton";
import { welcomeHeroData } from "./mock-data";

export default function WelcomeBanner() {
  const { greeting, workspace, aiSummary, date } = welcomeHeroData;

  return (
    <section className="rounded-[28px] border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 shadow-[0_25px_80px_rgba(2,8,23,0.35)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
            <Sparkles size={16} />
            AI Marketing Copilot Active
          </div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{greeting}, {workspace}</h2>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">{aiSummary}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
              <CalendarDays size={14} className="text-cyan-300" />
              {date}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
              <Brain size={14} className="text-cyan-300" />
              Today&apos;s AI insight: budget efficiency up 18%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-sm text-slate-300 sm:min-w-[280px]">
          <p className="text-slate-500">Today&apos;s focus</p>
          <p className="font-semibold text-white">Scale the best-performing acquisition funnel</p>
          <ActionButton tone="accent" className="w-fit gap-2">
            Review plan
            <ArrowRight size={16} />
          </ActionButton>
        </div>
      </div>
    </section>
  );
}