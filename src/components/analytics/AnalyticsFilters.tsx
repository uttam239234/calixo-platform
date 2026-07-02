import { Filter, SlidersHorizontal } from "lucide-react";

const filters = ["Date Range", "Platform", "Campaign", "Region", "Device", "Audience"];

export function AnalyticsFilters() {
  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <SlidersHorizontal size={16} className="text-cyan-300" />
          Filters
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button key={filter} type="button" className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-white">
              {filter}
            </button>
          ))}
        </div>
        <button type="button" className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-200">
          <Filter size={14} />
          Apply
        </button>
      </div>
    </section>
  );
}
