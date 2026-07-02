import { CalendarDays, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdsHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
          Unified advertising
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ads Manager</h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">Manage every advertising platform from one workspace.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="h-10 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><CalendarDays /> Jul 1–31</Button>
        <Button variant="outline" size="icon-lg" aria-label="Refresh data" className="border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><RefreshCw /></Button>
        <Button className="h-10 bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"><Download /> Export</Button>
      </div>
    </div>
  );
}
