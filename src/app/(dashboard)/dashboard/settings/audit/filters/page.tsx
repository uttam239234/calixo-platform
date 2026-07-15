"use client";

import { cn } from "@/lib/utils";
import { ModuleHeader, ActivityTimeline } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAudit, type TimeRange } from "@/features/settings/audit/useAudit";
import { toActivityItems } from "@/features/settings/audit/normalize";
import type { AuditCategory, AuditSeverity } from "@/features/settings/audit/normalize";

const TIME_OPTIONS: { id: TimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "all", label: "All Time" },
];

const SEVERITY_LABELS: Record<AuditSeverity, string> = { info: "Info", warning: "Warning", critical: "Critical" };

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function AuditFiltersPage() {
  const { tenantContext } = useSettingsContext();
  const audit = useAudit(tenantContext.organizationId);
  const hasFilters = audit.categoryFilters.size > 0 || audit.severityFilters.size > 0 || audit.timeRange !== "all";

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Filters"
        description="Narrow the activity feed by topic, time, or severity — simple chips, no query builder."
        quickActions={
          hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                audit.categoryFilters.forEach(c => audit.toggleCategory(c));
                audit.severityFilters.forEach(s => audit.toggleSeverity(s));
                audit.setTimeRange("all");
              }}
            >
              Clear filters
            </Button>
          )
        }
      />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic</p>
        <div className="flex flex-wrap gap-2">
          {audit.categories.map((category: AuditCategory) => (
            <Chip key={category} active={audit.categoryFilters.has(category)} onClick={() => audit.toggleCategory(category)}>
              {category}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</p>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map(option => (
            <Chip key={option.id} active={audit.timeRange === option.id} onClick={() => audit.setTimeRange(option.id)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severity</p>
        <div className="flex flex-wrap gap-2">
          {audit.severities.map((severity: AuditSeverity) => (
            <Chip key={severity} active={audit.severityFilters.has(severity)} onClick={() => audit.toggleSeverity(severity)}>
              {SEVERITY_LABELS[severity]}
            </Chip>
          ))}
        </div>
      </div>

      <ActivityTimeline
        activities={toActivityItems(audit.filteredItems)}
        loading={audit.loading}
        maxItems={audit.filteredItems.length || 1}
        title={`${audit.filteredItems.length} matching event${audit.filteredItems.length === 1 ? "" : "s"}`}
      />
    </div>
  );
}
