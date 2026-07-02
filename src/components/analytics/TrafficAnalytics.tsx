import { trafficMetrics } from "./mock-data";

export function TrafficAnalytics() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Traffic Analytics</h2>
        <p className="mt-1 text-sm text-slate-400">Pulse of acquisition and engagement</p>
      </div>

      <div className="space-y-3">
        {trafficMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <span className="text-sm font-semibold text-emerald-300">{metric.change}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
