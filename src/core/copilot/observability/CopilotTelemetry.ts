/**
 * Calixo Platform - AI Copilot Observability Adapter
 *
 * Same thin-dispatcher convention as `ContentTelemetry.ts` over the real
 * `TelemetryPlatformAPI` — covers the brief's response/clarification/
 * action/approval/generation/execution latency requirement with zero new
 * logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "AICopilot";

export function logCopilotEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logCopilotError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of a Copilot action (message, action, approval, ...). */
export function trackCopilotAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `copilot.action.${action}`, 1);
}

/** Records a latency/duration measurement — response, clarification, action, approval, generation, or execution latency. */
export function trackCopilotTiming(metric: string, durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", `copilot.timing.${metric}`, durationMs);
}

/** Counts how many clarifying questions a single request needed (0-5) — the brief's own named clarification-count metric. */
export function trackClarificationCount(count: number): void {
  telemetryPlatformAPI.emitMetric("gauge", "copilot.clarificationCount", count);
}
