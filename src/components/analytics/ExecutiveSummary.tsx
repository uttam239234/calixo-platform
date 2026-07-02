import { TrendingUp } from "lucide-react";
import { summaryCards } from "./mock-data";

export function ExecutiveSummary() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <article key={card.label} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_10px_40px_rgba(2,8,23,0.25)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
            </div>
            <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${card.tone === "positive" ? "bg-emerald-500/10 text-emerald-300" : card.tone === "negative" ? "bg-rose-500/10 text-rose-300" : "bg-slate-800 text-slate-300"}`}>
              {card.trend}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-sm text-slate-400">{card.percentage}</p>
              <p className="mt-1 text-sm text-slate-500">{card.comparison}</p>
            </div>
            <div className="flex items-center gap-1 text-cyan-300">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="mt-4 flex h-8 items-end gap-1">
            {card.sparkline.map((point, index) => (
              <div key={`${card.label}-${index}`} className="flex-1 rounded-full bg-gradient-to-t from-cyan-500/70 to-cyan-300/30" style={{ height: `${point}%` }} />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
