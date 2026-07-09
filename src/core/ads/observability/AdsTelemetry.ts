/**
 * Calixo Platform - Ads Observability Adapter
 *
 * Same thin-dispatcher convention as `AnalyticsTelemetry.ts` over the real `TelemetryPlatformAPI`
 * — Ads-scoped module/metric names only, no new logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Ads";

export function logAdsEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logAdsError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of an ads action (pause, resume, archive, delete, duplicate, export, ...). */
export function trackAdsAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `ads.action.${action}`, 1);
}

/** Records a latency/duration measurement — campaign publish time, export time, filter latency, etc. */
export function trackAdsTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `ads.timing.${metric}`, durationMs);
}
