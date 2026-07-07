/**
 * Calixo Platform - Telemetry Platform API
 *
 * The one generic "emit anything" surface — a thin dispatcher over
 * `LoggingEngine`/`MetricsEngine`/`TracingEngine`/`platformEventBus`, the
 * layer the Developer SDK sits on. Distinct from `LoggingPlatformAPI`/
 * `MetricsPlatformAPI`/`TracingPlatformAPI` (which stay the precise,
 * typed surfaces) the same way Phase 6's `SDKPlatformAPI` sat above its
 * individual generators.
 */
import type { LogEntry, LogLevel } from "@/logging";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { PlatformEventTenant, PlatformEventType } from "@/core/platform/events/types";
import { loggingEngine } from "./LoggingEngine";
import { metricsEngine } from "./MetricsEngine";
import { tracingEngine } from "./TracingEngine";
import type { MetricKind, SpanKind } from "./types";

export class TelemetryPlatformAPI {
  emitLog(level: LogLevel, module: string, message: string, context?: LogEntry["context"], data?: unknown): void {
    loggingEngine.log(level, module, message, context, data);
  }

  emitMetric(kind: MetricKind, name: string, value: number, tags?: Record<string, string>): void {
    switch (kind) {
      case "counter":
        metricsEngine.increment(name, value, tags);
        return;
      case "gauge":
        metricsEngine.gauge(name, value, tags);
        return;
      case "timer":
        metricsEngine.timing(name, value, tags);
        return;
      case "histogram":
        metricsEngine.histogram(name, value, tags);
        return;
    }
  }

  emitSpan(traceId: string, name: string, kind: SpanKind, fn: (spanId: string) => Promise<void>): Promise<void> {
    return tracingEngine.withSpan({ traceId, name, kind }, fn);
  }

  emitEvent<TPayload = Record<string, unknown>>(type: PlatformEventType, payload: TPayload, tenant?: PlatformEventTenant): ReturnType<typeof platformEventBus.publish> {
    return platformEventBus.publish({ type, payload, ...tenant });
  }
}

export const telemetryPlatformAPI = new TelemetryPlatformAPI();
