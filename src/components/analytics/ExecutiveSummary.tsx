"use client";

import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { summaryCards } from "./mock-data";

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

export function ExecutiveSummary() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => {
        const config = toneConfig[card.tone];
        const TrendIcon = config.icon;

        return (
          <article key={card.label} className="card card-padding-md hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                  <AnimatedValue value={card.value} />
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.color}`}>
                <TrendIcon size={12} />
                {card.trend}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{card.percentage}</div>
              <div className="text-xs text-muted-foreground">{card.comparison}</div>
            </div>

            {/* Sparkline bars */}
            <div className="mt-3 flex h-8 items-end gap-1">
              {card.sparkline.map((point, index) => (
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