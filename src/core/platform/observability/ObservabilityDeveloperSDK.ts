/**
 * Calixo Platform - Observability Developer SDK
 *
 * One place a developer emits logs/metrics/traces/health/diagnostics/
 * alerts/events without touching anything inside this package — mirrors
 * Phase 6/7's `DeveloperPlatformAPI`/`ExecutionDeveloperSDK` precedent.
 */
import type { LogEntry, LogLevel } from "@/logging";
import type { PlatformEventTenant, PlatformEventType } from "@/core/platform/events/types";
import { telemetryPlatformAPI } from "./TelemetryPlatformAPI";
import { tracingPlatformAPI } from "./TracingPlatformAPI";
import { healthPlatformAPI } from "./HealthPlatformAPI";
import { diagnosticsPlatformAPI } from "./DiagnosticsPlatformAPI";
import { alertPlatformAPI } from "./AlertPlatformAPI";
import type { CustomHealthCheck } from "./HealthEngine";
import type { AlertRuleDefinition, DiagnosticsReport, MetricKind, Span, SpanKind } from "./types";

export class ObservabilityDeveloperSDK {
  emitLog(level: LogLevel, module: string, message: string, context?: LogEntry["context"], data?: unknown): void {
    telemetryPlatformAPI.emitLog(level, module, message, context, data);
  }

  emitMetric(kind: MetricKind, name: string, value: number, tags?: Record<string, string>): void {
    telemetryPlatformAPI.emitMetric(kind, name, value, tags);
  }

  startSpan(params: { traceId: string; name: string; kind: SpanKind; parentSpanId?: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, unknown> }): Span {
    return tracingPlatformAPI.startSpan(params);
  }

  endSpan(spanId: string, status?: "ok" | "error", error?: string): Span | undefined {
    return tracingPlatformAPI.endSpan(spanId, status, error);
  }

  reportHealth(name: string, check: CustomHealthCheck): void {
    healthPlatformAPI.registerCustomCheck(name, check);
  }

  runDiagnostic(): Promise<DiagnosticsReport> {
    return diagnosticsPlatformAPI.run();
  }

  defineAlert(rule: AlertRuleDefinition): AlertRuleDefinition {
    return alertPlatformAPI.registerRule(rule);
  }

  emitEvent<TPayload = Record<string, unknown>>(type: PlatformEventType, payload: TPayload, tenant?: PlatformEventTenant) {
    return telemetryPlatformAPI.emitEvent(type, payload, tenant);
  }
}

export const observabilityDeveloperSDK = new ObservabilityDeveloperSDK();
