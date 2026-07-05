"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportExecutionStatus } from "@/core/reports";
import type { HistoryRecordView } from "./types";

interface HistoryPanelProps {
  records: HistoryRecordView[];
  limit?: number;
  emptyLabel?: string;
}

const STATUS_META: Record<ReportExecutionStatus, { icon: typeof Clock; className: string }> = {
  queued: { icon: Clock, className: "text-muted-foreground" },
  running: { icon: Loader2, className: "text-info" },
  completed: { icon: CheckCircle2, className: "text-success" },
  failed: { icon: XCircle, className: "text-destructive" },
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function HistoryPanel({ records, limit, emptyLabel = "No executions yet." }: HistoryPanelProps) {
  const rows = limit ? records.slice(0, limit) : records;

  if (rows.length === 0) {
    return <p className="px-1 py-3 text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-1.5">
      {rows.map(record => {
        const meta = STATUS_META[record.status];
        const Icon = meta.icon;
        return (
          <div key={record.id} className="flex items-center gap-2 rounded-xl bg-accent/30 px-2.5 py-2">
            <Icon size={13} className={cn(meta.className, record.status === "running" && "animate-spin")} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">{record.status === "failed" ? "Failed" : `${record.rowCount ?? 0} rows`}</span>
                <span className="text-[10px] text-muted-foreground">{record.durationMs !== undefined ? `${record.durationMs}ms` : "—"}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <span>{record.user ?? "—"}</span>
                <span>{formatTimestamp(record.startedAt)}</span>
              </div>
              {record.error && <p className="mt-0.5 truncate text-[10px] text-destructive">{record.error}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
