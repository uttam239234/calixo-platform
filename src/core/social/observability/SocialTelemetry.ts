/**
 * Calixo Platform - Social Observability Adapter
 *
 * Same thin-dispatcher convention as `AdsTelemetry.ts` over the real `TelemetryPlatformAPI` —
 * Social-scoped module/metric names only, no new logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Social";

export function logSocialEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logSocialError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of a social action (publish, schedule, delete, reply, approve, ...). */
export function trackSocialAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `social.action.${action}`, 1);
}

/** Records a latency/duration measurement — publish latency, connector latency, queue latency, approval latency, etc. */
export function trackSocialTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `social.timing.${metric}`, durationMs);
}
