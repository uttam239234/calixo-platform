"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowRight, CheckCircle2, Clock, ListChecks } from "lucide-react";
import type { DashboardApprovalItem, DashboardKpiSnapshot } from "@/core/dashboard";

interface PendingApprovalsProps {
  kpis: DashboardKpiSnapshot[];
  approvals: DashboardApprovalItem[];
  loading?: boolean;
}

function KpiPill({ kpi }: { kpi: DashboardKpiSnapshot }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 px-3 py-2.5">
      <p className="text-lg font-bold tracking-tight text-foreground">
        {kpi.value}
        {kpi.format === "days" ? <span className="ml-1 text-xs font-medium text-muted-foreground">days</span> : null}
      </p>
      <p className="text-xs text-muted-foreground">{kpi.title}</p>
    </div>
  );
}

export default function PendingApprovals({ kpis, approvals, loading = false }: PendingApprovalsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Pending Approvals" description="Live from Workflow" />
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5 rounded-xl border border-border/50 p-2.5">
                <SkeletonText className="h-5 w-10" />
                <SkeletonText className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Pending Approvals"
        description="Live from Workflow"
        action={
          <Link href="/dashboard/workflows" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View All <ArrowRight size={12} />
          </Link>
        }
      />
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map(kpi => (
            <KpiPill key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="mt-4 space-y-1">
          {approvals.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={28} />} title="Nothing awaiting approval" description="New submissions will show up here as soon as they're ready for review." />
          ) : (
            approvals.map(item => (
              <Link
                key={item.id}
                href="/dashboard/workflows"
                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListChecks size={11} /> {item.brand ?? "General"} {item.reviewer ? `· ${item.reviewer}` : ""}
                  </p>
                </div>
                {item.dueDate && (
                  <span className="flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
