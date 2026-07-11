"use client";

import type { ReportDataset } from "@/core/reports";
import { formatValue } from "./chartTheme";

export function TableWidget({ dataset }: { dataset: ReportDataset }) {
  if (dataset.rows.length === 0) {
    return <p className="p-4 text-center text-xs text-muted-foreground">No rows to display.</p>;
  }

  return (
    <div className="scrollbar-thin max-h-[260px] overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-card">
          <tr>
            {dataset.columns.map(col => (
              <th key={col.id} className="border-b border-border px-3 py-2 text-left font-medium text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.rows.map((row, i) => (
            <tr key={i} className="hover:bg-accent/40">
              {dataset.columns.map(col => (
                <td key={col.id} className="border-b border-border/60 px-3 py-2 text-foreground tabular-nums">
                  {col.kind === "metric" ? formatValue(row[col.id], col.format) : String(row[col.id] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
