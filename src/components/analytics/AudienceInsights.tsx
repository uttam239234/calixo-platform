"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { audienceInsights } from "./mock-data";

export function AudienceInsights() {
  return (
    <Card>
      <CardHeader title="Audience Insights" description="Who is converting and what they care about" />
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {audienceInsights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}