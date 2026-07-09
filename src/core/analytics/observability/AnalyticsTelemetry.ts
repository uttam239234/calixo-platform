/**
 * Calixo Platform - Analytics Observability Adapter
 *
 * Same thin-dispatcher convention as `core/dashboard/observability/DashboardTelemetry.ts`
 * over the real `TelemetryPlatformAPI` — Analytics-scoped module/metric
 * names only, no new logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Analytics";

export function logAnalyticsEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logAnalyticsError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of an analytics action (export, forecast run, segment execution, ...). */
export function trackAnalyticsAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `analytics.action.${action}`, 1);
}

/** Records a latency/duration measurement — query time, export time, filter latency, dashboard load time, connector latency, etc. */
export function trackAnalyticsTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `analytics.timing.${metric}`, durationMs);
}
