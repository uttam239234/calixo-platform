"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, Check, X, BrainCircuit } from "lucide-react";
import type { DashboardRecommendation } from "@/core/dashboard";

const priorityIcon = {
  high: { icon: AlertTriangle, className: "border-destructive/20 bg-destructive/10 text-destructive" },
  medium: { icon: Lightbulb, className: "border-warning/20 bg-warning/10 text-warning" },
  low: { icon: TrendingUp, className: "border-success/20 bg-success/10 text-success" },
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

function RecommendationCard({ item, onApply, onDismiss }: { item: DashboardRecommendation; onApply: (id: string) => void; onDismiss: (id: string) => void }) {
  const config = priorityIcon[item.priority];
  const ImpactIcon = config.icon;
  const applied = item.status === "applied";

  return (
    <div className={`rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm ${item.priority === "high" ? "border-l-[3px] border-l-primary" : ""} ${applied ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.className}`}>
            <ImpactIcon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              {item.priority === "high" && !applied && (
                <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive tracking-wider">HIGH PRIORITY</span>
              )}
              {applied && <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success tracking-wider">APPLIED</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/80 px-2.5 py-0.5 text-xs font-medium shadow-sm">
                <Sparkles size={11} className="text-primary" />
                {item.impact}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-ai/20 bg-ai/10 px-2.5 py-0.5 text-xs font-medium text-ai shadow-sm">
                <BrainCircuit size={11} />
                {item.confidence}% confidence
              </span>
            </div>
          </div>
        </div>
        {!applied && (
          <div className="flex flex-shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Dismiss" onClick={() => onDismiss(item.id)}>
              <X size={14} />
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => onApply(item.id)}>
              <Check size={14} /> Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="h-4 w-3/4" />
          <SkeletonText className="h-3 w-full" />
          <div className="flex gap-2">
            <SkeletonText className="h-5 w-20" />
            <SkeletonText className="h-5 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AiRecommendationsProps {
  items: DashboardRecommendation[];
  loading?: boolean;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

export default function AiRecommendations({ items, loading = false, onApply, onDismiss }: AiRecommendationsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="AI Recommendations" description="Prioritized by impact" />
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RecommendationSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader title="AI Recommendations" description="Prioritized by impact" />
        <CardContent>
          <EmptyState icon={<BrainCircuit size={32} />} title="No recommendations yet" description="AI will surface actionable insights as data accumulates." />
        </CardContent>
      </Card>
    );
  }

  const sorted = [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <Card>
      <CardHeader title="AI Recommendations" description="Live from Analytics insights and workflow signals" />
      <CardContent>
        <div className="space-y-3">
          {sorted.map((item) => (
            <RecommendationCard key={item.id} item={item} onApply={onApply} onDismiss={onDismiss} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
