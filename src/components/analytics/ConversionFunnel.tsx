"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { conversionFunnel } from "./mock-data";

export function ConversionFunnel() {
  return (
    <Card>
      <CardHeader title="Conversion Funnel" description="How qualified demand moves through the lifecycle" />
      <CardContent>
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => (
            <div key={stage.stage}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stage.stage}</span>
                <span className="font-semibold text-foreground tabular-nums">{stage.value.toLocaleString()}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-ai to-success transition-all duration-1000 ease-out"
                  style={{ width: `${Math.max(stage.percent, 6)}%` }}
                />
              </div>
              {index < conversionFunnel.length - 1 && (
                <div className="mt-1 text-right text-[10px] text-muted-foreground">
                  {stage.percent}% → {conversionFunnel[index + 1].percent}% drop-off
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}