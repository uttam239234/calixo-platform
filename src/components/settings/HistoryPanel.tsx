"use client";

import { History } from "lucide-react";
import type { SettingsHistoryRecordView } from "./types";

interface HistoryPanelProps {
  records: SettingsHistoryRecordView[];
  limit?: number;
}

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function HistoryPanel({ records, limit }: HistoryPanelProps) {
  const rows = limit ? records.slice(0, limit) : records;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <History size={18} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No changes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {rows.map(record => (
        <div key={record.id} className="rounded-xl bg-accent/30 p-2.5">
          <div className="flex items-center justify-between">
            <span className="badge badge-outline capitalize">{record.action}</span>
            <span className="text-[10px] text-muted-foreground">{formatTimestamp(record.timestamp)}</span>
          </div>
          <div className="mt-1.5 space-y-0.5 text-[11px]">
            <p>
              <span className="text-muted-foreground">Previous:</span> <span className="text-foreground">{stringifyValue(record.previousValue)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">New:</span> <span className="text-foreground">{stringifyValue(record.newValue)}</span>
            </p>
            <p className="text-muted-foreground">By {record.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
