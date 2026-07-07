"use client";

import { useState } from "react";
import { CalendarDays, Check, Download, FileText, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsHeaderProps {
  selectedRange: "7d" | "30d" | "90d" | "custom";
  onRangeChange: (range: "7d" | "30d" | "90d" | "custom") => void;
  onExport: (format: "pdf" | "excel") => void;
  onRefresh: () => void;
}

export function AnalyticsHeader({ selectedRange, onRangeChange, onExport, onRefresh }: AnalyticsHeaderProps) {
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    onRefresh();
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Analytics Command Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Unified Marketing Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track revenue, traffic, campaign efficiency, and AI-led growth opportunities from one premium workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
            <FileText size={14} />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("excel")}>
            <Download size={14} />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            {refreshed ? <Check size={14} /> : <RefreshCw size={14} />}
            {refreshed ? "Refreshed" : "Refresh"}
          </Button>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface/50 px-3 py-2 text-sm text-muted-foreground">
            <CalendarDays size={15} className="text-muted-foreground/70" />
            <select
              aria-label="Date range"
              value={selectedRange}
              onChange={(event) => onRangeChange(event.target.value as "7d" | "30d" | "90d" | "custom")}
              className="bg-transparent text-sm outline-none text-foreground"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}