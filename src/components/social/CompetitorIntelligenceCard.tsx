"use client";
import { ArrowRight, Users, Activity, TrendingUp, Radar } from "lucide-react";
import Link from "next/link";
import { initialCompetitors, brandMetrics } from "@/features/social/competitors/mock-data";
import Card from "@/components/dashboard/common/Card";
import IconBadge from "@/components/dashboard/common/IconBadge";

export function CompetitorIntelligenceCard() {
  const competitors = initialCompetitors;
  const totalCompetitors = competitors.length;
  const avgEngagement = (
    competitors.reduce((sum, c) => sum + c.metrics.engagement, 0) /
    competitors.length
  ).toFixed(1);
  const fastestGrowing = competitors.reduce((prev, curr) =>
    curr.metrics.growth > prev.metrics.growth ? curr : prev
  );

  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <IconBadge icon={Radar} tone="cyan" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Competitor Intelligence
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor competitors, compare performance, and discover AI-powered
              growth opportunities.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/social/competitors"
          className="group flex shrink-0 items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
        >
          View Competitor Dashboard
          <ArrowRight
            size={16}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
          <Users size={18} className="shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total Competitors</p>
            <p className="text-sm font-semibold text-foreground">
              {totalCompetitors}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
          <TrendingUp size={18} className="shrink-0 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Fastest Growing</p>
            <p className="text-sm font-semibold text-foreground">
              {fastestGrowing.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
          <Activity size={18} className="shrink-0 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Avg Engagement</p>
            <p className="text-sm font-semibold text-foreground">{avgEngagement}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}