"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { recommendations } from "@/features/ads/mock-data";

export function RecommendationPanel() {
  return (
    <Card>
      <CardHeader
        title="AI Recommendations"
        description="Optimization opportunities from Calixo AI"
        action={
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight size={14} />
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-2">
          {recommendations.map((item) => (
            <button
              key={item.id}
              className="group flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 text-left transition-all duration-150 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${
                item.impact === "High" ? "bg-primary shadow-sm shadow-primary/50" : "bg-ai"
              }`} />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
              </div>
              <ArrowRight size={15} className="shrink-0 text-muted-foreground/50 transition group-hover:translate-x-1 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}