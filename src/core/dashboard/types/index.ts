/**
 * Calixo Platform - Dashboard Core Types
 *
 * View-model shapes the Dashboard Engine composes from other platforms'
 * real engines (Workflow, Communication). Nothing here duplicates those
 * platforms' own types — these are adapted, dashboard-shaped projections.
 */

export interface DashboardKpiSnapshot {
  id: string;
  title: string;
  value: number;
  format: "count" | "days";
  description?: string;
}

export interface DashboardApprovalItem {
  id: string;
  title: string;
  status: string;
  brand?: string;
  dueDate?: string;
  reviewer?: string;
}

export interface DashboardActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface DashboardNotificationEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface DashboardSnapshot {
  operationalKpis: DashboardKpiSnapshot[];
  pendingApprovals: DashboardApprovalItem[];
  approvalActivity: DashboardActivityEntry[];
  notifications: DashboardNotificationEntry[];
  unreadNotificationCount: number;
}

/** A marketing KPI card — adapted from AnalyticsEngine.getSummaryMetrics(), not recomputed. */
export interface DashboardMarketingKpi {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "steady";
  tone: "positive" | "negative" | "neutral";
  sparkline: number[];
  comparison: string;
}

/** A daily revenue/spend point — adapted from AnalyticsEngine.getRevenueSeries(). */
export interface DashboardPerformancePoint {
  label: string;
  revenue: number;
  spend: number;
}

/** A per-channel performance row — adapted from AnalyticsEngine.getChannelPerformance(). */
export interface DashboardChannelRow {
  id: string;
  name: string;
  spend: string;
  revenue: string;
  roas: string;
  cpa: string;
  status: "Healthy" | "Monitoring" | "Optimizing";
}

export interface DashboardConnectedPlatform {
  id: string;
  name: string;
  providerId: string;
  status: "connected" | "connecting" | "disconnected" | "error" | "pending";
  lastSyncAt?: string;
  errorMessage?: string;
  /** Additive — real Connector Platform health/token data, omitted when unavailable. */
  successRate?: number;
  tokenExpiresAt?: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  dueDate?: string;
  type: "campaign" | "deadline" | "report";
  priority: "high" | "medium" | "low";
  assignee: string;
}

export interface DashboardRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  priority: "high" | "medium" | "low";
  source: "analytics" | "workflow";
  status: "new" | "applied" | "dismissed";
}

export interface DashboardMorningBriefing {
  headline: string;
  summary: string;
  healthScore: number;
  healthLabel: string;
  generatedAt: string;
}

export interface DashboardForecastPoint {
  label: string;
  projectedRevenue: number;
}

export interface DashboardRisk {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  detectionMethod: "threshold";
}

/** One weighted input into `DashboardHealthScore` — every `score` is 0-100 and every source is a real, already-composed Dashboard signal (no new computation invented for this). */
export interface DashboardHealthSignal {
  key: string;
  label: string;
  weight: number;
  score: number;
  status: "strength" | "risk" | "neutral";
  detail: string;
}

export interface DashboardHealthScore {
  score: number;
  label: string;
  breakdown: DashboardHealthSignal[];
  strengths: string[];
  risks: string[];
  generatedAt: string;
}

/** One row in the unified Action Center — "actions you can take" (approvals, entitlement warnings) and "incidents happening to you" (connector failures, alerts) share this shape since their affordances are identical (investigate / snooze / fix at the owning route). */
export interface DashboardActionCenterItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: "approval" | "connector" | "entitlement" | "alert" | "task";
  kind: "action" | "incident";
  actionLabel: string;
  actionHref: string;
  status: "open" | "snoozed" | "dismissed";
}

export interface DashboardSubscriptionLimit {
  used: number;
  limit: number;
}

export interface DashboardSubscriptionSummary {
  tier: string;
  status: string;
  renewsAt?: string;
  seats: DashboardSubscriptionLimit;
  aiCredits: DashboardSubscriptionLimit;
  storageGB: DashboardSubscriptionLimit;
  connectors: DashboardSubscriptionLimit;
}
