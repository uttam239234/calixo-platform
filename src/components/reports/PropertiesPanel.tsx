"use client";

import { REPORT_CATEGORIES } from "@/core/reports";
import type { ReportDefinition, ReportMetadataSummary } from "@/core/reports";
import { MODULE_OPTIONS } from "./constants";

interface PropertiesPanelProps {
  report: ReportDefinition | null;
  metadata?: ReportMetadataSummary;
  section: "properties" | "metadata";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function PropertiesPanel({ report, metadata, section }: PropertiesPanelProps) {
  if (!report) return <p className="text-xs text-muted-foreground">Select a report to see its details.</p>;

  if (section === "metadata") {
    return (
      <div className="divide-y divide-border/50">
        <Row label="Widget Count" value={metadata?.widgetCount ?? 0} />
        <Row label="Metric Count" value={metadata?.metricCount ?? 0} />
        <Row label="Filter Count" value={metadata?.filterCount ?? 0} />
        <Row label="Last Executed" value={formatDate(metadata?.lastExecutedAt)} />
        <Row label="Updated" value={formatDate(metadata?.updatedAt ?? report.updatedAt)} />
      </div>
    );
  }

  const categoryLabel = REPORT_CATEGORIES.find(c => c.id === report.category)?.label ?? report.category;
  const moduleLabel = MODULE_OPTIONS.find(m => m.id === report.module)?.label ?? report.module;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">{report.description}</p>
      </div>
      <div className="divide-y divide-border/50">
        <Row label="Category" value={categoryLabel} />
        <Row label="Module" value={moduleLabel} />
        <Row label="Owner" value={report.owner} />
        <Row label="AI Summary" value={report.aiSummaryEnabled ? "Enabled" : "Disabled"} />
        <Row label="Created" value={formatDate(report.createdAt)} />
        <Row label="Updated" value={formatDate(report.updatedAt)} />
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {report.tags.length > 0 ? report.tags.map(tag => <span key={tag} className="badge badge-secondary">{tag}</span>) : <span className="text-xs text-muted-foreground">None</span>}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Permissions</p>
        <div className="flex flex-wrap gap-1.5">
          {report.permissions.length > 0 ? (
            report.permissions.map(p => <span key={p} className="badge badge-outline">{p}</span>)
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
