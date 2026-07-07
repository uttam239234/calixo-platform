"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { FileText, Clock3, CalendarRange, Pause, Play } from "lucide-react";
import type { ExportRecord, ReportDefinition, ReportSchedule } from "@/core/reports";

interface ReportsPanelProps {
  reports: ReportDefinition[];
  exports: ExportRecord[];
  schedules: ReportSchedule[];
  reportNameById: (reportId: string) => string;
  onToggleSchedule: (schedule: ReportSchedule) => void;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "completed" || status === "active" ? "badge-success" : status === "processing" || status === "queued" ? "badge-warning" : status === "failed" ? "badge-destructive" : "badge-secondary";
  return <span className={`badge ${tone}`}>{status}</span>;
}

export function ReportsPanel({ reports, exports, schedules, reportNameById, onToggleSchedule }: ReportsPanelProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader title="Saved Reports" description="Registered in the Reports platform" action={<FileText size={16} className="text-primary" />} />
        <CardContent>
          {reports.length === 0 ? (
            <EmptyState icon={<FileText size={24} />} title="No saved reports" description="Analytics reports will appear here once registered." />
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id} className="rounded-2xl border border-border/50 bg-card/50 p-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{report.name}</p>
                    {report.aiSummaryEnabled && <span className="badge badge-ai">AI</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{report.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Recent Exports" description="Recently generated reports" action={<Clock3 size={16} className="text-primary" />} />
        <CardContent>
          {exports.length === 0 ? (
            <EmptyState icon={<Clock3 size={24} />} title="No exports yet" description="Use Export PDF / Export Excel above to generate one." />
          ) : (
            <div className="space-y-3">
              {exports.map(record => (
                <div key={record.id} className="rounded-2xl border border-border/50 bg-card/50 p-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{reportNameById(record.reportId)}</p>
                    <StatusBadge status={record.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {record.format.toUpperCase()} • {new Date(record.requestedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Scheduled Reports" description="Automated report delivery" action={<CalendarRange size={16} className="text-primary" />} />
        <CardContent>
          {schedules.length === 0 ? (
            <EmptyState icon={<CalendarRange size={24} />} title="No schedules" description="No recurring deliveries are configured yet." />
          ) : (
            <div className="space-y-3">
              {schedules.map(schedule => (
                <div key={schedule.id} className="rounded-2xl border border-border/50 bg-card/50 p-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{reportNameById(schedule.reportId)}</p>
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
        </CardContent>
      </Card>
    </section>
  );
}
