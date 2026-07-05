"use client";

import { Copy, Download, Eye, Plus, Star, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { REPORT_CATEGORIES } from "@/core/reports";
import type { ReportDefinition } from "@/core/reports";
import { MODULE_OPTIONS } from "./constants";
import type { ReportsCenterMode } from "./types";

interface ReportsHeaderProps {
  report: ReportDefinition | null;
  mode: ReportsCenterMode;
  onNewReport: () => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPreview: () => void;
  onExport: () => void;
  onSchedule: () => void;
}

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ReportsHeader({ report, mode, onNewReport, onToggleFavorite, onDuplicate, onPreview, onExport, onSchedule }: ReportsHeaderProps) {
  const categoryLabel = report ? REPORT_CATEGORIES.find(c => c.id === report.category)?.label ?? report.category : undefined;
  const moduleLabel = report ? MODULE_OPTIONS.find(m => m.id === report.module)?.label ?? report.module : undefined;

  return (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
      <div className="min-w-0">
        {mode === "build" ? (
          <h1 className="text-[15px] font-semibold text-foreground">Building a new report</h1>
        ) : report ? (
          <>
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-semibold text-foreground">{report.name}</h1>
              <button
                type="button"
                onClick={() => onToggleFavorite(report.id)}
                className={cn("flex-shrink-0 transition-colors", report.favorite ? "text-warning" : "text-muted-foreground/40 hover:text-warning")}
                aria-label={report.favorite ? "Unfavorite" : "Favorite"}
              >
                <Star size={14} fill={report.favorite ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
              {categoryLabel && <span className="badge badge-primary">{categoryLabel}</span>}
              {moduleLabel && <span className="badge badge-outline">{moduleLabel}</span>}
              <span>{report.owner}</span>
              {report.tags.slice(0, 3).map(tag => (
                <span key={tag} className="badge badge-secondary">
                  {tag}
                </span>
              ))}
              <span>Updated {formatUpdated(report.updatedAt)}</span>
            </div>
          </>
        ) : (
          <h1 className="text-[15px] font-semibold text-foreground">Select a report</h1>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        {mode === "view" && report && (
          <>
            <Button size="sm" variant="ghost" onClick={() => onDuplicate(report.id)} className="gap-1.5">
              <Copy size={13} /> Duplicate
            </Button>
            <Button size="sm" variant="ghost" onClick={onPreview} className="gap-1.5">
              <Eye size={13} /> Preview
            </Button>
            <Button size="sm" variant="ghost" onClick={onExport} className="gap-1.5">
              <Download size={13} /> Export
            </Button>
            <Button size="sm" variant="ghost" onClick={onSchedule} className="gap-1.5">
              <Wand2 size={13} /> Schedule
            </Button>
          </>
        )}
        <Button size="sm" onClick={onNewReport} className="gap-1.5">
          <Plus size={13} /> New Report
        </Button>
      </div>
    </div>
  );
}
