/**
 * Calixo Platform - Metrics Platform API
 */
import { metricsEngine } from "./MetricsEngine";
import type { MetricSnapshot } from "./types";

export class MetricsPlatformAPI {
  increment(name: string, value?: number, tags?: Record<string, string>): void {
    metricsEngine.increment(name, value, tags);
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    metricsEngine.gauge(name, value, tags);
  }

  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    metricsEngine.timing(name, durationMs, tags);
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    metricsEngine.histogram(name, value, tags);
  }

  time<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    return metricsEngine.time(name, fn, tags);
  }

  snapshot(name: string, tags?: Record<string, string>, windowMs?: number): MetricSnapshot | undefined {
    return metricsEngine.snapshot(name, tags, windowMs);
  }

  snapshotAll(windowMs?: number): MetricSnapshot[] {
    return metricsEngine.snapshotAll(windowMs);
  }
}

export const metricsPlatformAPI = new MetricsPlatformAPI();
