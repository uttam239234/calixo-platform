/**
 * Calixo Platform - Content Studio Observability Adapter
 *
 * Same thin-dispatcher convention as `ReputationTelemetry.ts` over the real `TelemetryPlatformAPI`
 * — covers the brief's generation/approval/export/AI-latency observability requirement with zero
 * new logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "ContentStudio";

export function logContentEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logContentError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of a Content Studio action (generate, save, submit, translate, ...). */
export function trackContentAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `content.action.${action}`, 1);
}

/** Records a latency/duration measurement — generation, approval, export, AI (assistant) latency. */
export function trackContentTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `content.timing.${metric}`, durationMs);
}
