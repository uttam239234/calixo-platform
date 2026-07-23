/**
 * Calixo Platform - Enterprise Observability, Monitoring, Diagnostics &
 * Operations Platform Types
 *
 * This is the eighth major `core/platform` subpackage. The audit found six
 * independently-built, genuinely real health/analytics engines (Phase 1's
 * `platformHealthService`, Phase 5's `connectorHealthEngine`, Phase 6's
 * `apiAnalyticsEngine`/`apiMonitoring`, Phase 7's `executionMonitoring`, and
 * AIOS's `aiAnalytics` — already wired to real call sites) plus one
 * structured logger (`appLogger`, used in 70 files) that never had its
 * context fields populated, and zero Metrics/Tracing/Alerting/Error-
 * Intelligence primitives anywhere. This package aggregates the former
 * (never re-implements them) and builds the latter fresh.
 */
import type { HealthStatus as BackgroundHealthStatus } from "@/background/types";

// ============================================================================
// Metrics Platform (mandate section 3)
// ============================================================================

export type MetricKind = "counter" | "gauge" | "timer" | "histogram";

export interface HistogramSummary {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p90: number;
  p99: number;
}

export interface MetricSnapshot {
  name: string;
  kind: MetricKind;
  value?: number;
  histogram?: HistogramSummary;
  ratePerMinute?: number;
  windowMs: number;
  tags?: Record<string, string>;
}

// ============================================================================
// Distributed Tracing Platform (mandate section 4)
//
// "Distributed" here means cross-boundary correlation within this single
// Node process (Gateway -> Execution -> Workflow -> Connector) — there is no
// multi-service/multi-host architecture in this codebase to trace across.
// Spans use explicit context objects, matching the rest of this codebase's
// convention (`ExecutionContext`, `GatewayRequestContext`) rather than
// AsyncLocalStorage-based implicit propagation.
// ============================================================================

export type SpanKind = "request" | "execution" | "workflow" | "connector" | "api" | "ai" | "internal";
export type SpanStatus = "ok" | "error";

export interface Span {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  status: SpanStatus;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  organizationId?: string;
  workspaceId?: string;
  attributes: Record<string, unknown>;
  error?: string;
}

export interface Trace {
  id: string;
  spans: Span[];
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
}

// ============================================================================
// Health Platform (mandate section 5)
// ============================================================================

export type HealthState = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface ComponentHealth {
  name: string;
  state: HealthState;
  detail?: string;
  metadata?: Record<string, unknown>;
  checkedAt: string;
}

export interface UnifiedHealthSnapshot {
  overall: HealthState;
  components: ComponentHealth[];
  checkedAt: string;
}

// ============================================================================
// Diagnostics Platform (mandate section 6)
// ============================================================================

export type DiagnosticArea = "system" | "execution" | "connector" | "workflow" | "api" | "ai" | "storage" | "memory" | "performance" | "dependency";
export type DiagnosticSeverity = "info" | "warning" | "critical";

export interface DiagnosticFinding {
  id: string;
  severity: DiagnosticSeverity;
  area: DiagnosticArea;
  message: string;
  suggestion?: string;
  detectedAt: string;
}

export interface DiagnosticsReport {
  findings: DiagnosticFinding[];
  generatedAt: string;
}

// ============================================================================
// Performance Platform (mandate section 7)
// ============================================================================

export interface PerformanceSummary {
  name: string;
  averageMs: number;
  p90Ms: number;
  p99Ms: number;
  sampleCount: number;
}

// ============================================================================
// Alert Platform (mandate section 8)
// ============================================================================

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "firing" | "resolved";
export type AlertCondition = "gt" | "gte" | "lt" | "lte" | "eq";

export interface AlertRuleDefinition {
  id: string;
  name: string;
  description: string;
  metricName: string;
  condition: AlertCondition;
  threshold: number;
  severity: AlertSeverity;
  scope?: "global" | "organization";
  scopeId?: string;
  isActive: boolean;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  value: number;
  threshold: number;
  organizationId?: string;
  firedAt: string;
  resolvedAt?: string;
}

// ============================================================================
// Error Intelligence Platform (mandate section 9)
// ============================================================================

export interface ErrorRecord {
  id: string;
  source: string;
  category: string;
  message: string;
  organizationId?: string;
  workspaceId?: string;
  correlationId?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface RecurringFailureGroup {
  key: string;
  source: string;
  category: string;
  sampleMessage: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  suggestion?: string;
}

// ============================================================================
// AI / Connector / API / Execution Observability (mandate sections 11-14)
// — thin summary shapes; the real numbers come from AIOS's `aiAnalytics`,
// Phase 5's `connectorHealthEngine`/sync history, Phase 6's
// `apiAnalyticsEngine`, and Phase 7's `executionMonitoring`.
// ============================================================================

export interface AiObservabilitySummary {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  topModels: { model: string; count: number; cost: number }[];
}


// ============================================================================
// Operations Command Center (mandate section 15)
// ============================================================================

export interface OperationsSnapshot {
  overallHealth: HealthState;
  health: UnifiedHealthSnapshot;
  activeAlerts: AlertInstance[];
  recentErrors: ErrorRecord[];
  topFailures: RecurringFailureGroup[];
  ai: AiObservabilitySummary;
  generatedAt: string;
}

// ============================================================================
// Reliability Readiness — SLA/SLO/SLI (mandate section 20)
// Declarative registration + real evaluation against existing health/metric
// data where it exists; no forecasting/capacity-planning math is invented.
// ============================================================================

export interface SloDefinition {
  id: string;
  name: string;
  description: string;
  targetPercent: number;
  metricName: string;
  windowDays: number;
}

export interface SloEvaluation {
  slo: SloDefinition;
  currentPercent: number;
  isMet: boolean;
  evaluatedAt: string;
}

export type { BackgroundHealthStatus };
