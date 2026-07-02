import { audienceInsights } from "./mock-data";

export function AudienceInsights() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Audience Insights</h2>
        <p className="mt-1 text-sm text-slate-400">Who is converting and what they care about</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {audienceInsights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
