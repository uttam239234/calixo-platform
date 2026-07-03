"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, ArrowRight, BrainCircuit } from "lucide-react";
import { recommendationData } from "./mock-data";
import type { RecommendationItem } from "./types";

const impactConfig = {
  positive: { icon: TrendingUp, className: "border-success/20 bg-success/10 text-success" },
  critical: { icon: AlertTriangle, className: "border-destructive/20 bg-destructive/10 text-destructive" },
  opportunity: { icon: Lightbulb, className: "border-warning/20 bg-warning/10 text-warning" },
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

function RecommendationCard({ item }: { item: RecommendationItem }) {
  const config = impactConfig[item.impactType];
  const ImpactIcon = config.icon;

  return (
    <div className={`rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm ${
      item.priority === "high" ? "border-l-[3px] border-l-primary" : ""
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.className}`}>
            <ImpactIcon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              {item.priority === "high" && (
                <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive tracking-wider">
                  HIGH PRIORITY
                </span>
              )}
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
        <Button variant="outline" size="sm" className="flex-shrink-0 gap-1">
          {item.action} <ArrowRight size={14} />
        </Button>
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
  loading?: boolean;
}

export default function AiRecommendations({ loading = false }: AiRecommendationsProps) {
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

  if (recommendationData.length === 0) {
    return (
      <Card>
        <CardHeader title="AI Recommendations" description="Prioritized by impact" />
        <CardContent>
          <EmptyState
            icon={<BrainCircuit size={32} />}
            title="No recommendations yet"
            description="AI will surface actionable insights as data accumulates."
          />
        </CardContent>
      </Card>
    );
  }

  const sorted = [...recommendationData].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <Card>
      <CardHeader
        title="AI Recommendations"
        description="Prioritized by impact"
        action={
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight size={14} />
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-3">
          {sorted.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}