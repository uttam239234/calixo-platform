/**
 * Calixo Platform - Settings Observability Adapter
 *
 * Same thin-dispatcher convention as `ReportsTelemetry.ts` over the real
 * `TelemetryPlatformAPI`.
 */
import { telemetryPlatformAPI } from "@/core/platform/observability/TelemetryPlatformAPI";

const MODULE = "Settings";

export function logSettingsError(message: string, error: unknown): void {
  const data = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  telemetryPlatformAPI.emitLog("error", MODULE, message, undefined, data);
}

export function trackSettingsAction(action: string): void {
  telemetryPlatformAPI.emitMetric("counter", `settings.action.${action}`, 1);
}
