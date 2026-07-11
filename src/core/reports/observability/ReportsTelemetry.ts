/**
 * Calixo Platform - Reports Observability Adapter
 *
 * Same thin-dispatcher convention as `ContentTelemetry.ts`/`CopilotTelemetry.ts`
 * over the real `TelemetryPlatformAPI` — covers the brief's named
 * generation/refresh/schedule/delivery-latency requirement with zero new
 * logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Reports";

export function logReportsEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logReportsError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

export function trackReportsAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `reports.action.${action}`, 1);
}

/** Records a latency/duration measurement — generation, refresh, schedule, or delivery latency. */
export function trackReportsTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `reports.timing.${metric}`, durationMs);
}
