"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Clock3, LayoutTemplate, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_CATEGORIES } from "@/core/reports";
import type { ReportCategory, ReportDashboard, ReportDefinition } from "@/core/reports";
import { ReportCard } from "./ReportCard";
import { DashboardBrowser } from "./DashboardBrowser";
import { HistoryPanel } from "./HistoryPanel";
import type { HistoryRecordView } from "./types";

interface ReportsSidebarProps {
  reports: ReportDefinition[];
  favorites: ReportDefinition[];
  recent: ReportDefinition[];
  dashboards: ReportDashboard[];
  history: HistoryRecordView[];
  currentReportId: string | null;
  onSelectReport: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectDashboard: (dashboard: ReportDashboard) => void;
}

function Section({ title, icon, defaultOpen = false, children }: { title: string; icon: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-2 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-1 space-y-1 px-0.5">{children}</div>}
    </div>
  );
}

export function ReportsSidebar({
  reports,
  favorites,
  recent,
  dashboards,
  history,
  currentReportId,
  onSelectReport,
  onToggleFavorite,
  onSelectDashboard,
}: ReportsSidebarProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ReportCategory | "all">("all");

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter(r => category === "all" || r.category === category)
      .filter(r => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
  }, [reports, query, category]);

  return (
    <aside className="flex h-full w-[280px] flex-shrink-0 flex-col rounded-3xl border border-border bg-card">
      <div className="flex-shrink-0 space-y-2 p-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search reports..."
            className="h-8.5 w-full rounded-xl border border-border bg-accent/30 pl-8 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as ReportCategory | "all")}
          className="h-8.5 w-full rounded-xl border border-border bg-accent/30 px-2.5 text-xs text-foreground outline-none focus:border-primary/40"
        >
          <option value="all">All Categories</option>
          {REPORT_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        <Section title={`Reports (${filteredReports.length})`} icon={<Search size={11} />} defaultOpen>
          {filteredReports.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">No matches</p>
          ) : (
            filteredReports.slice(0, 40).map(r => (
              <ReportCard key={r.id} report={r} isActive={r.id === currentReportId} onSelect={onSelectReport} onToggleFavorite={onToggleFavorite} compact />
            ))
          )}
        </Section>

        <Section title={`Favorites (${favorites.length})`} icon={<Star size={11} />}>
          {favorites.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">No favorites yet</p>
          ) : (
            favorites.slice(0, 20).map(r => (
              <ReportCard key={r.id} report={r} isActive={r.id === currentReportId} onSelect={onSelectReport} onToggleFavorite={onToggleFavorite} compact />
            ))
          )}
        </Section>

        <Section title="Recent Reports" icon={<Clock3 size={11} />}>
          {recent.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">No recent reports</p>
          ) : (
            recent.map(r => <ReportCard key={r.id} report={r} isActive={r.id === currentReportId} onSelect={onSelectReport} onToggleFavorite={onToggleFavorite} compact />)
          )}
        </Section>

        <Section title="Dashboards" icon={<LayoutTemplate size={11} />}>
          <DashboardBrowser dashboards={dashboards} onSelectDashboard={onSelectDashboard} />
        </Section>

        <Section title="History" icon={<Clock3 size={11} />}>
          <HistoryPanel records={history} limit={8} />
        </Section>
      </div>
    </aside>
  );
}
