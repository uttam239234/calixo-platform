import { geoPerformance } from "./mock-data";

export function GeoPerformance() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Geographic Performance</h2>
        <p className="mt-1 text-sm text-slate-400">High-intent regions and urban clusters</p>
      </div>

      <div className="rounded-[24px] border border-dashed border-slate-700 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(2,8,23,0.95))] p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">World map placeholder</span>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">Live regions</span>
        </div>
        <div className="h-40 rounded-2xl border border-slate-800 bg-slate-950/40" />
      </div>

      <div className="mt-4 space-y-3">
        {geoPerformance.map((entry) => (
          <div key={`${entry.country}-${entry.city}`} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <div>
              <p className="font-medium text-white">{entry.city}, {entry.country}</p>
              <p className="text-sm text-slate-400">{entry.conversions} conversions</p>
            </div>
            <p className="text-sm font-semibold text-cyan-200">{entry.revenue}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
