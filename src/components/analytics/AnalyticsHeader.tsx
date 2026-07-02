import { CalendarDays, Download, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsHeaderProps {
  selectedRange: "7d" | "30d" | "90d" | "custom";
  onRangeChange: (range: "7d" | "30d" | "90d" | "custom") => void;
}

export function AnalyticsHeader({ selectedRange, onRangeChange }: AnalyticsHeaderProps) {
  return (
    <div className="rounded-[28px] border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.35)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Analytics Command Center</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Unified Marketing Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Track revenue, traffic, campaign efficiency, and AI-led growth opportunities from one premium workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800">
            <FileText size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800">
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" className="border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
            <CalendarDays size={16} />
            <select
              aria-label="Date range"
              value={selectedRange}
              onChange={(event) => onRangeChange(event.target.value as "7d" | "30d" | "90d" | "custom")}
              className="bg-transparent text-sm outline-none"
            >
              <option className="bg-slate-950" value="7d">Last 7 Days</option>
              <option className="bg-slate-950" value="30d">Last 30 Days</option>
              <option className="bg-slate-950" value="90d">Last 90 Days</option>
              <option className="bg-slate-950" value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
