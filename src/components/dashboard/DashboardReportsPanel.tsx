"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { FileText, Clock3, CalendarRange, Pause, Play, Download } from "lucide-react";
import type { ExportRecord, ReportDefinition, ReportSchedule } from "@/core/reports";

interface DashboardReportsPanelProps {
  reports: ReportDefinition[];
  exports: ExportRecord[];
  schedules: ReportSchedule[];
  reportNameById: (reportId: string) => string;
  onToggleSchedule: (schedule: ReportSchedule) => void;
  onExport: (format: "pdf" | "excel") => void;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "completed" || status === "active" ? "badge-success" : status === "processing" || status === "queued" ? "badge-warning" : status === "failed" ? "badge-destructive" : "badge-secondary";
  return <span className={`badge ${tone}`}>{status}</span>;
}

export default function DashboardReportsPanel({ reports, exports, schedules, reportNameById, onToggleSchedule, onExport }: DashboardReportsPanelProps) {
  return (
    <Card>
      <CardHeader
        title="Reports & Exports"
        description="Executive Summary and Operations reports, live from the Reports platform"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => onExport("pdf")}>
              Export PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onExport("excel")}>
              Export Excel
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText size={12} /> Saved Reports
            </p>
            {reports.length === 0 ? (
              <EmptyState icon={<FileText size={20} />} title="No reports" description="Dashboard reports will appear here." />
            ) : (
              <div className="space-y-2">
                {reports.map(report => (
                  <div key={report.id} className="rounded-xl border border-border/50 bg-card/50 p-3">
                    <p className="text-sm font-semibold text-foreground">{report.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{report.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock3 size={12} /> Recent Exports
            </p>
            {exports.length === 0 ? (
              <EmptyState icon={<Clock3 size={20} />} title="No exports yet" description="Use Export PDF / Excel above." />
            ) : (
              <div className="space-y-2">
                {exports.map(record => (
                  <div key={record.id} className="rounded-xl border border-border/50 bg-card/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{reportNameById(record.reportId)}</p>
                      <StatusBadge status={record.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {record.format.toUpperCase()} • {new Date(record.requestedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarRange size={12} /> Scheduled Reports
            </p>
            {schedules.length === 0 ? (
              <EmptyState icon={<CalendarRange size={20} />} title="No schedules" description="No recurring deliveries configured." />
            ) : (
              <div className="space-y-2">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="rounded-xl border border-border/50 bg-card/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{reportNameById(schedule.reportId)}</p>
                      <StatusBadge status={schedule.active ? "active" : "paused"} />
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs capitalize text-muted-foreground">
                        {schedule.frequency} • {schedule.exportFormat.toUpperCase()}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => onToggleSchedule(schedule)}>
                        {schedule.active ? <Pause size={12} /> : <Play size={12} />}
                        {schedule.active ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
