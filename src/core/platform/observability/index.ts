/**
 * Calixo Platform - Enterprise Observability, Monitoring, Diagnostics &
 * Operations Platform
 *
 * Barrel for the eighth major `core/platform` subpackage — Mission Control.
 * Aggregates six already-real health/analytics engines built across Phases
 * 1/5/6/7/AIOS (never re-implemented) and adds what was genuinely missing:
 * generic Metrics, single-process distributed Tracing, unified Health,
 * Diagnostics, Alerts, Error Intelligence, and the Operations Command
 * Center. `appLogger` (`@/logging`) — already the sole structured logger
 * used in 70 files — gained a `withContext()` method so rich per-call trace/
 * correlation context can finally be attached without the concurrency bug a
 * global mutable context would have.
 *
 * `initializeObservabilityFoundation()` wires ErrorIntelligence's event
 * subscriptions, registers default alert rules, and registers a real
 * recurring "observability-tick" job through Phase 7's Execution Platform.
 */

export * from "./types";
export * from "./MetricsEngine";
export * from "./TracingEngine";
export * from "./LoggingEngine";
export * from "./HealthEngine";
export * from "./DiagnosticsEngine";
export * from "./ErrorIntelligenceEngine";
export * from "./AlertEngine";
export * from "./OperationsEngine";
export * from "./AiObservability";
export * from "./ConnectorObservability";
export * from "./ApiObservability";
export * from "./ExecutionObservability";

export * from "./ObservabilityPlatformAPI";
export * from "./LoggingPlatformAPI";
export * from "./MetricsPlatformAPI";
export * from "./TracingPlatformAPI";
export * from "./DiagnosticsPlatformAPI";
export * from "./HealthPlatformAPI";
export * from "./AlertPlatformAPI";
export * from "./PerformancePlatformAPI";
export * from "./OperationsPlatformAPI";
export * from "./TelemetryPlatformAPI";
export * from "./ObservabilityDeveloperSDK";

import { registerCoreObservabilityWiring } from "./contracts/registerCoreObservabilityWiring";

let initialized = false;

export async function initializeObservabilityFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;
  registerCoreObservabilityWiring();
}
