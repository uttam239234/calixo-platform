/**
 * Calixo Platform - Performance Platform API
 *
 * Combines the generic `MetricsEngine` (for anything explicitly timed via
 * `MetricsPlatformAPI.time()`) with the real, already-computed latency
 * numbers each domain observability wrapper carries — API/AI/Execution
 * latency is not re-measured here, just surfaced in one place. Memory/CPU
 * are honestly "readiness" (mandate's own word) — no process-level resource
 * sampling exists in this codebase, so this returns `undefined` rather than
 * a fabricated number.
 */
import { metricsEngine } from "./MetricsEngine";
import { apiObservability } from "./ApiObservability";
import { aiObservability } from "./AiObservability";
import { executionObservability } from "./ExecutionObservability";
import { cacheEngine } from "@/core/platform/data/CacheEngine";
import type { MetricSnapshot } from "./types";

export interface PerformanceOverview {
  apiAverageLatencyMs: number;
  aiAverageLatencyMs: number;
  executionAverageDurationMs: number;
  executionThroughputPerMinute: number;
  cacheStats: Record<string, { size: number; hits: number; misses: number }>;
  memoryUsage: undefined;
  cpuUsage: undefined;
}

export class PerformancePlatformAPI {
  getMetric(name: string, tags?: Record<string, string>): MetricSnapshot | undefined {
    return metricsEngine.snapshot(name, tags);
  }

  async getOverview(): Promise<PerformanceOverview> {
    const api = this.apiLatency();
    const ai = await aiObservability.getSummary();
    const execution = await executionObservability.getSnapshot();
    return {
      apiAverageLatencyMs: api,
      aiAverageLatencyMs: ai.averageLatency,
      executionAverageDurationMs: execution.executions.averageDurationMs,
      executionThroughputPerMinute: execution.executions.throughputPerMinute,
      cacheStats: cacheEngine.allStats(),
      memoryUsage: undefined,
      cpuUsage: undefined,
    };
  }

  private apiLatency(): number {
    return apiObservability.getOverall().averageLatencyMs;
  }
}

export const performancePlatformAPI = new PerformancePlatformAPI();
