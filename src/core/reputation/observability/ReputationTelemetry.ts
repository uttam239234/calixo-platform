/**
 * Calixo Platform - Reputation Observability Adapter
 *
 * Same thin-dispatcher convention as `SocialTelemetry.ts` over the real `TelemetryPlatformAPI` —
 * Reputation-scoped module/metric names only, no new logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Reputation";

export function logReputationEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logReputationError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of a reputation action (resolve, flag, export, escalate, generateReport, ...). */
export function trackReputationAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `reputation.action.${action}`, 1);
}

/** Records a latency/duration measurement — mention ingestion, connector sync, alert detection, report generation, etc. */
export function trackReputationTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `reputation.timing.${metric}`, durationMs);
}
