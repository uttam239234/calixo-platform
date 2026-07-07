/**
 * Calixo Platform - Metrics Platform
 *
 * Nothing generic existed before this — every phase built its own bespoke
 * aggregation (Phase 6's `ApiAnalyticsEngine.summarize()`, Phase 7's
 * `ExecutionMonitoring.aggregate()`, AIOS's `AIAnalytics.getSummary()`), all
 * hand-rolling the same count/average/percentile math independently. This
 * is the one shared counter/gauge/timer/histogram primitive going forward —
 * it does not replace those bespoke summaries (they stay, and are still the
 * richest domain-specific view), it gives every OTHER subsystem a place to
 * emit a number without inventing its own aggregation.
 */
import type { HistogramSummary, MetricKind, MetricSnapshot } from "./types";

const MAX_SAMPLES = 1000;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
}

function summarize(values: number[]): HistogramSummary {
  if (values.length === 0) return { count: 0, min: 0, max: 0, mean: 0, p50: 0, p90: 0, p99: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    p50: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    p99: percentile(sorted, 99),
  };
}

function seriesKey(name: string, tags?: Record<string, string>): string {
  if (!tags || Object.keys(tags).length === 0) return name;
  const sortedTags = Object.keys(tags).sort().map(k => `${k}=${tags[k]}`).join(",");
  return `${name}{${sortedTags}}`;
}

interface Series {
  name: string;
  kind: MetricKind;
  tags?: Record<string, string>;
  counterValue: number;
  gaugeValue: number;
  samples: number[];
  sampleTimestamps: number[];
}

export class MetricsEngine {
  private series = new Map<string, Series>();

  private getOrCreate(name: string, kind: MetricKind, tags?: Record<string, string>): Series {
    const key = seriesKey(name, tags);
    let entry = this.series.get(key);
    if (!entry) {
      entry = { name, kind, tags, counterValue: 0, gaugeValue: 0, samples: [], sampleTimestamps: [] };
      this.series.set(key, entry);
    }
    return entry;
  }

  increment(name: string, value = 1, tags?: Record<string, string>): void {
    const entry = this.getOrCreate(name, "counter", tags);
    entry.counterValue += value;
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const entry = this.getOrCreate(name, "gauge", tags);
    entry.gaugeValue = value;
  }

  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    const entry = this.getOrCreate(name, "timer", tags);
    entry.samples.push(durationMs);
    entry.sampleTimestamps.push(Date.now());
    if (entry.samples.length > MAX_SAMPLES) {
      entry.samples.shift();
      entry.sampleTimestamps.shift();
    }
  }

  /** Times a real async operation and records it as a `timer` metric — the one instrumentation helper every wrapper below uses instead of hand-rolling `Date.now()` diffs. */
  async time<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      this.timing(name, Date.now() - start, tags);
    }
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const entry = this.getOrCreate(name, "histogram", tags);
    entry.samples.push(value);
    entry.sampleTimestamps.push(Date.now());
    if (entry.samples.length > MAX_SAMPLES) {
      entry.samples.shift();
      entry.sampleTimestamps.shift();
    }
  }

  /** `windowMs` bounds both the histogram summary and the rate calculation to recent samples only — a metric emitted once an hour ago shouldn't inflate today's p99. */
  snapshot(name: string, tags?: Record<string, string>, windowMs = 300_000): MetricSnapshot | undefined {
    const entry = this.series.get(seriesKey(name, tags));
    if (!entry) return undefined;
    return this.buildSnapshot(entry, windowMs);
  }

  private buildSnapshot(entry: Series, windowMs: number): MetricSnapshot {
    const cutoff = Date.now() - windowMs;
    const recentSamples = entry.samples.filter((_, i) => entry.sampleTimestamps[i] >= cutoff);

    if (entry.kind === "counter") {
      return { name: entry.name, kind: entry.kind, value: entry.counterValue, windowMs, tags: entry.tags };
    }
    if (entry.kind === "gauge") {
      return { name: entry.name, kind: entry.kind, value: entry.gaugeValue, windowMs, tags: entry.tags };
    }
    const ratePerMinute = (recentSamples.length / (windowMs / 60_000));
    return { name: entry.name, kind: entry.kind, histogram: summarize(recentSamples), ratePerMinute, windowMs, tags: entry.tags };
  }

  snapshotAll(windowMs = 300_000): MetricSnapshot[] {
    return Array.from(this.series.values()).map(entry => this.buildSnapshot(entry, windowMs));
  }

  reset(name: string, tags?: Record<string, string>): void {
    this.series.delete(seriesKey(name, tags));
  }

  count(): number {
    return this.series.size;
  }
}

export const metricsEngine = new MetricsEngine();
