"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, BrainCircuit } from "lucide-react";
import { aiInsights } from "./mock-data";

const priorityColors: Record<string, string> = {
  High: "border-destructive/20 bg-destructive/10 text-destructive",
  Medium: "border-warning/20 bg-warning/10 text-warning",
  Low: "border-success/20 bg-success/10 text-success",
};

export function AIInsights() {
  return (
    <Card>
      <CardHeader
        title="AI Insights"
        description="Data-driven recommendations to accelerate growth"
        action={
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight size={14} />
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-4">
          {aiInsights.map((insight) => (
            <div key={insight.title} className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`badge ${priorityColors[insight.priority] ?? "badge-secondary"}`}>
                    {insight.priority}
                  </span>
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
                <Button variant="outline" size="sm">
                  <Sparkles size={12} />
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}