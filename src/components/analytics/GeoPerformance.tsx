"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { geoPerformance } from "./mock-data";

export function GeoPerformance() {
  return (
    <Card>
      <CardHeader title="Geographic Performance" description="High-intent regions and urban clusters" />
      <CardContent>
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-dashed border-border bg-gradient-to-br from-primary/[0.03] to-ai/[0.03] p-5">
          <span className="text-sm text-muted-foreground">Geographic visualization</span>
          <span className="badge badge-primary">Live regions</span>
        </div>

        <div className="mt-4 space-y-3">
          {geoPerformance.map((entry) => (
            <div key={`${entry.country}-${entry.city}`} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-4 py-3 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
              <div>
                <p className="text-sm font-semibold text-foreground">{entry.city}, {entry.country}</p>
                <p className="text-xs text-muted-foreground">{entry.conversions} conversions</p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-foreground">{entry.revenue}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}