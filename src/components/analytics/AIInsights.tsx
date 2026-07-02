import { aiInsights } from "./mock-data";

export function AIInsights() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        <p className="mt-1 text-sm text-slate-400">Data-driven recommendations to accelerate growth</p>
      </div>

      <div className="space-y-4">
        {aiInsights.map((insight) => (
          <div key={insight.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{insight.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{insight.description}</p>
              </div>
              <div className="flex gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${insight.priority === "High" ? "bg-rose-500/10 text-rose-300" : insight.priority === "Medium" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                  {insight.priority}
                </span>
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                  {insight.confidence}% confidence
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">Expected uplift: <span className="font-semibold text-white">{insight.uplift}</span></p>
              <button type="button" className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-200 transition hover:border-cyan-500/40 hover:text-white">
                Apply Recommendation
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
