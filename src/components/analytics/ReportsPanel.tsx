"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { FileText, Clock3, CalendarRange } from "lucide-react";
import { reports } from "./mock-data";

function ReportCard({ title, meta, status }: { title: string; meta: string; status: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className={`badge ${
          status === "Live" || status === "Active" ? "badge-success" :
          status === "Synced" || status === "Ready" ? "badge-primary" :
          status === "Scheduled" || status === "Pending" ? "badge-warning" :
          "badge-secondary"
        }`}>{status}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}

export function ReportsPanel() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader
          title="Saved Reports"
          description="Your curated analytics exports"
          action={<FileText size={16} className="text-primary" />}
        />
        <CardContent>
          <div className="space-y-3">
            {reports.saved.map((item) => (
              <ReportCard key={item.title} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Recent Exports"
          description="Recently generated reports"
          action={<Clock3 size={16} className="text-primary" />}
        />
        <CardContent>
          <div className="space-y-3">
            {reports.recent.map((item) => (
              <ReportCard key={item.title} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Schedule Reports"
          description="Automated report delivery"
          action={<CalendarRange size={16} className="text-primary" />}
        />
        <CardContent>
          <div className="space-y-3">
            {reports.schedule.map((item) => (
              <ReportCard key={item.title} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}