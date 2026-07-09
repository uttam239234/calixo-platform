"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight, LayoutDashboard, Calculator, FileText, Bookmark, Sparkles, Target } from "lucide-react";
import type { AnalyticsDashboardLayout, AnalyticsInsight, AnalyticsMetricDefinition, AnalyticsSegment } from "@/core/analytics";
import type { GoalScorecardEntry } from "@/core/platform/goals";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Dashboards" | "Metrics" | "Segments" | "Reports" | "Recommendations" | "Goals";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Search> = {
  Dashboards: LayoutDashboard,
  Metrics: Calculator,
  Segments: Bookmark,
  Reports: FileText,
  Recommendations: Sparkles,
  Goals: Target,
};

interface AnalyticsReportLike {
  id: string;
  name: string;
}

interface AnalyticsCommandPaletteProps {
  open: boolean;
  onClose: () => void;
  layouts: AnalyticsDashboardLayout[];
  onSwitchLayout: (id: string) => void;
  metrics: AnalyticsMetricDefinition[];
  onSelectMetric: () => void;
  segments: AnalyticsSegment[];
  onSelectSegment: (segment: AnalyticsSegment) => void;
  reports: AnalyticsReportLike[];
  onSelectReport: () => void;
  insights: AnalyticsInsight[];
  onSelectInsight: () => void;
  goals: GoalScorecardEntry[];
  onSelectGoal: () => void;
}

/** Analytics' own instantiation of Dashboard's `CommandPalette` pattern — same interaction model, Analytics-shaped groups. */
export default function AnalyticsCommandPalette({
  open,
  onClose,
  layouts,
  onSwitchLayout,
  metrics,
  onSelectMetric,
  segments,
  onSelectSegment,
  reports,
  onSelectReport,
  insights,
  onSelectInsight,
  goals,
  onSelectGoal,
}: AnalyticsCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const layoutItems: CommandItem[] = layouts.map(l => ({
      id: `layout-${l.id}`,
      label: l.isFavorite ? `${l.name} (saved view)` : l.name,
      hint: l.description,
      group: "Dashboards",
      action: () => onSwitchLayout(l.id),
    }));
    const metricItems: CommandItem[] = metrics.map(m => ({
      id: `metric-${m.id}`,
      label: m.label,
      hint: m.custom ? "Custom metric" : `${m.field} (${m.aggregation})`,
      group: "Metrics",
      action: onSelectMetric,
    }));
    const segmentItems: CommandItem[] = segments.map(s => ({ id: `segment-${s.id}`, label: s.name, hint: s.description, group: "Segments", action: () => onSelectSegment(s) }));
    const reportItems: CommandItem[] = reports.map(r => ({ id: `report-${r.id}`, label: r.name, hint: "Analytics report", group: "Reports", action: onSelectReport }));
    const insightItems: CommandItem[] = insights.filter(i => i.status !== "dismissed").map(i => ({ id: `insight-${i.id}`, label: i.title, hint: i.description, group: "Recommendations", action: onSelectInsight }));
    const goalItems: CommandItem[] = goals.map(g => ({ id: `goal-${g.id}`, label: g.title, hint: `${Math.round(g.progress * 100)}% of target`, group: "Goals", action: onSelectGoal }));

    const all = [...layoutItems, ...metricItems, ...segmentItems, ...reportItems, ...insightItems, ...goalItems];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, layouts, onSwitchLayout, metrics, onSelectMetric, segments, onSelectSegment, reports, onSelectReport, insights, onSelectInsight, goals, onSelectGoal]);

  useEffect(() => {
    (async () => {
      setActiveIndex(0);
    })();
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const item = items[activeIndex];
        if (item) {
          item.action();
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, items, activeIndex, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search metrics, dashboards, segments, reports…"
            className="w-full bg-transparent text-sm outline-none"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</p>}
          {items.map((item, index) => {
            const GroupIcon = GROUP_ICON[item.group];
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-accent/60"}`}
              >
                <GroupIcon size={15} className="text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                </span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
