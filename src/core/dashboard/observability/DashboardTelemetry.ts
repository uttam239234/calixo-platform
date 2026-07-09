/**
 * Calixo Platform - Dashboard Observability Adapter
 *
 * First real consumer of the Observability Platform's `TelemetryPlatformAPI`
 * anywhere in the app (it existed with zero call sites before this). Thin
 * dispatcher only — Dashboard-scoped module/metric names over the
 * existing `emitLog`/`emitMetric`, no new logging or metrics machinery.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Dashboard";

export function logDashboardEvent(message: string, data?: unknown): void {
  telemetryPlatformAPI.emitLog("info", MODULE, message, undefined, data);
}

export function logDashboardError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

/** Counts one occurrence of a dashboard action (export, apply, retry, schedule-toggle, ...) for operational dashboards, distinct from the Commercial Platform's billing-shaped usage records. */
export function trackDashboardAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `dashboard.action.${action}`, 1);
}

export function trackDashboardLoadTime(durationMs: number): void {
  telemetryPlatformAPI.emitMetric("timer", "dashboard.load_time_ms", durationMs);
}
