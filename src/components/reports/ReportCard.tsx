"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_CATEGORIES } from "@/core/reports";
import type { ReportDefinition } from "@/core/reports";

interface ReportCardProps {
  report: ReportDefinition;
  isActive?: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  compact?: boolean;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ReportCard({ report, isActive, onSelect, onToggleFavorite, compact }: ReportCardProps) {
  const categoryLabel = REPORT_CATEGORIES.find(c => c.id === report.category)?.label ?? report.category;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2 rounded-2xl border px-3 py-2.5 text-left transition-colors cursor-pointer",
        isActive ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-accent"
      )}
      onClick={() => onSelect(report.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter") onSelect(report.id);
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{report.name}</p>
        {!compact && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{report.description}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="badge badge-primary">{categoryLabel}</span>
          <span className="text-[10px] text-muted-foreground">{report.owner}</span>
          <span className="text-[10px] text-muted-foreground">• {relativeTime(report.updatedAt)}</span>
        </div>
      </div>
      {onToggleFavorite && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(report.id);
          }}
          className={cn(
            "flex-shrink-0 rounded-lg p-1 transition-colors",
            report.favorite ? "text-warning" : "text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-warning"
          )}
          aria-label={report.favorite ? "Unfavorite" : "Favorite"}
        >
          <Star size={13} fill={report.favorite ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}
