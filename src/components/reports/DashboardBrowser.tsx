"use client";

import { LayoutDashboard } from "lucide-react";
import type { ReportDashboard } from "@/core/reports";

interface DashboardBrowserProps {
  dashboards: ReportDashboard[];
  onSelectDashboard: (dashboard: ReportDashboard) => void;
}

export function DashboardBrowser({ dashboards, onSelectDashboard }: DashboardBrowserProps) {
  if (dashboards.length === 0) {
    return <p className="px-1 py-3 text-xs text-muted-foreground">No dashboards yet.</p>;
  }

  return (
    <div className="space-y-1">
      {dashboards.map(dashboard => (
        <button
          key={dashboard.id}
          type="button"
          onClick={() => onSelectDashboard(dashboard)}
          className="flex w-full items-start gap-2 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
        >
          <LayoutDashboard size={15} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{dashboard.name}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{dashboard.description}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {dashboard.reportIds.length} report{dashboard.reportIds.length === 1 ? "" : "s"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
