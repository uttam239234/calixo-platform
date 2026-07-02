import { FileText, Clock3, CalendarRange } from "lucide-react";
import { reports } from "./mock-data";

export function ReportsPanel() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
        <div className="mb-4 flex items-center gap-2 text-white">
          <FileText size={18} className="text-cyan-300" />
          <h2 className="text-xl font-semibold">Saved Reports</h2>
        </div>
        <div className="space-y-3">
          {reports.saved.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Clock3 size={18} className="text-cyan-300" />
          <h2 className="text-xl font-semibold">Recent Exports</h2>
        </div>
        <div className="space-y-3">
          {reports.recent.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
        <div className="mb-4 flex items-center gap-2 text-white">
          <CalendarRange size={18} className="text-cyan-300" />
          <h2 className="text-xl font-semibold">Schedule Reports</h2>
        </div>
        <div className="space-y-3">
          {reports.schedule.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
