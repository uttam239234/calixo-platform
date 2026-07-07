"use client";

import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AnalyticsSummaryMetric } from "@/core/analytics";

const toneConfig = {
  positive: { icon: TrendingUp, color: "text-success bg-success/10 border-success/20" },
  negative: { icon: TrendingDown, color: "text-destructive bg-destructive/10 border-destructive/20" },
  neutral: { icon: Minus, color: "text-muted-foreground bg-muted/10 border-border/60" },
};

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = value;
  }, [value]);

  return <span ref={ref} className="tabular-nums">{value}</span>;
}

interface ExecutiveSummaryProps {
  metrics: AnalyticsSummaryMetric[];
}

export function ExecutiveSummary({ metrics }: ExecutiveSummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const config = toneConfig[metric.tone];
        const TrendIcon = config.icon;
        const sparkline = normalizeSparkline(metric.sparkline);

        return (
          <article key={metric.id} className="card card-padding-md hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                  <AnimatedValue value={metric.value} />
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.color}`}>
                <TrendIcon size={12} />
                {metric.change}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{metric.comparison}</div>
            </div>

            {/* Sparkline bars */}
            <div className="mt-3 flex h-8 items-end gap-1">
              {sparkline.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-sm bg-primary/30"
                  style={{ height: `${point}%` }}
                />
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

/** Scales a raw value series to 0-100 so the CSS-height sparkline bars stay proportionate regardless of the metric's real magnitude. */
function normalizeSparkline(values: number[]): number[] {
  if (values.length === 0) return [];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return values.map(v => Math.max(8, Math.round(((v - min) / range) * 100)));
}