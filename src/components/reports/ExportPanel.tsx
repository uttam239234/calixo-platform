"use client";

import { CheckCircle2, Clock, Download, FileJson, FileSpreadsheet, FileText, Presentation, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EXPORT_FORMATS } from "@/core/reports";
import type { ExportFormat, ExportRecord, ExportStatus } from "@/core/reports";

interface ExportPanelProps {
  formats: ExportFormat[];
  history: ExportRecord[];
  onExport: (format: ExportFormat) => void;
}

const FORMAT_ICONS: Record<ExportFormat, typeof FileText> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileSpreadsheet,
  powerpoint: Presentation,
  json: FileJson,
};

const STATUS_META: Record<ExportStatus, { icon: typeof Clock; className: string }> = {
  queued: { icon: Clock, className: "text-muted-foreground" },
  processing: { icon: Clock, className: "text-info" },
  completed: { icon: CheckCircle2, className: "text-success" },
  failed: { icon: XCircle, className: "text-destructive" },
};

function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ExportPanel({ formats, history, onExport }: ExportPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Export as</p>
        <div className="grid grid-cols-2 gap-1.5">
          {formats.map(format => {
            const meta = EXPORT_FORMATS.find(f => f.id === format);
            const Icon = FORMAT_ICONS[format];
            return (
              <Button key={format} size="sm" variant="outline" onClick={() => onExport(format)} className="justify-start gap-1.5">
                <Icon size={13} /> {meta?.label ?? format}
              </Button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">Creates export metadata only — no file is generated.</p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Recent Exports</p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">No exports yet.</p>
        ) : (
          <div className="space-y-1.5">
            {history.slice(0, 10).map(record => {
              const meta = STATUS_META[record.status];
              const Icon = meta.icon;
              return (
                <div key={record.id} className="flex items-center gap-2 rounded-xl bg-accent/30 px-2.5 py-2">
                  <Icon size={13} className={meta.className} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase text-foreground">{record.format}</span>
                      <span className="text-[10px] text-muted-foreground">{formatBytes(record.fileSizeBytes)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{new Date(record.requestedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {record.downloadUrl && (
                    <span className={cn("flex-shrink-0 text-muted-foreground/50")} title={record.downloadUrl}>
                      <Download size={12} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
