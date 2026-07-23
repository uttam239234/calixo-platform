"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkles, BrainCircuit, CheckCircle2, X, Loader2 } from "lucide-react";
import type { AnalyticsInsight } from "@/core/analytics";

const priorityColors: Record<string, string> = {
  High: "border-destructive/20 bg-destructive/10 text-destructive",
  Medium: "border-warning/20 bg-warning/10 text-warning",
  Low: "border-success/20 bg-success/10 text-success",
};

interface AIInsightsProps {
  insights: AnalyticsInsight[];
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  onGenerate?: () => void;
  generating?: boolean;
  generateError?: string | null;
}

export function AIInsights({ insights, onApply, onDismiss, onGenerate, generating, generateError }: AIInsightsProps) {
  const active = insights.filter(i => i.status !== "dismissed");

  return (
    <Card>
      <CardHeader
        title="AI Insights"
        description="Data-driven recommendations to accelerate growth"
        action={
          onGenerate && (
            <Button variant="outline" size="sm" onClick={onGenerate} disabled={generating}>
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? "Analyzing…" : "Generate Insight"}
            </Button>
          )
        }
      />
      <CardContent>
        {generateError && <p className="mb-3 text-sm text-destructive">{generateError}</p>}
        {active.length === 0 ? (
          <EmptyState icon={<Sparkles size={28} />} title="No open insights" description="New recommendations will appear here as fresh data comes in." />
        ) : (
          <div className="space-y-4">
            {active.map((insight) => (
              <div key={insight.id} className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {insight.status === "applied" && <span className="badge badge-success">Applied</span>}
                    <span className={`badge ${priorityColors[insight.priority] ?? "badge-secondary"}`}>{insight.priority}</span>
                    <span className="badge badge-ai">
                      <BrainCircuit size={11} />
                      {insight.confidence}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Expected uplift: <span className="font-semibold text-foreground">{insight.uplift}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onDismiss(insight.id)}>
                      <X size={12} />
                      Dismiss
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onApply(insight.id)} disabled={insight.status === "applied"}>
                      {insight.status === "applied" ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                      {insight.status === "applied" ? "Applied" : "Apply"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}