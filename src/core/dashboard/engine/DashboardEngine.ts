/**
 * Calixo Platform - Dashboard Engine
 *
 * Composes the Dashboard's landing-page view models from OTHER platforms'
 * real, existing engines — it never recomputes or duplicates their logic,
 * and never imports another module's engine/service directly (Platform
 * Foundation rule: "No module may directly consume another module's
 * internals"). Today that means:
 *  - `workflowPlatformAPI` (src/core/workflow/platform) for approvals/
 *    pending-work KPIs and activity, backed by exactly the same
 *    `WorkflowEngine` `/dashboard/workflows` already uses.
 *  - `notificationsPlatformAPI` (src/communication/platform) for the
 *    notification feed and unread count.
 *  - `assetsPlatformAPI` (src/core/assets/platform) for asset activity.
 *  - `connectorsPlatformAPI` (src/integrations/platform) for connection
 *    status.
 *
 * No persistence, no UI, no new business rules — this is an adapter/
 * composition layer only.
 */

import type { WorkflowActionType } from "@/core/workflow/types";
import { workflowPlatformAPI } from "@/core/workflow/platform/WorkflowPlatformAPI";
import { notificationsPlatformAPI } from "@/communication/platform/NotificationsPlatformAPI";
import { analyticsPlatformAPI } from "@/core/analytics/platform/AnalyticsPlatformAPI";
import { assetsPlatformAPI } from "@/core/assets/platform/AssetsPlatformAPI";
import { connectorsPlatformAPI } from "@/integrations/platform/ConnectorsPlatformAPI";
import { goalEngine, GoalEngine } from "@/core/platform/goals";
import { linearForecast } from "@/core/platform/forecast/linearForecast";
import { dashboardActivityLog } from "../activity/DashboardActivityLog";
import { DASHBOARD_ORGANIZATION_ID } from "../integrations/seedDashboardConnections";
import type {
  DashboardActivityEntry,
  DashboardApprovalItem,
  DashboardChannelRow,
  DashboardConnectedPlatform,
  DashboardForecastPoint,
  DashboardKpiSnapshot,
  DashboardMarketingKpi,
  DashboardMorningBriefing,
  DashboardNotificationEntry,
  DashboardPerformancePoint,
  DashboardRecommendation,
  DashboardRisk,
  DashboardSnapshot,
  DashboardTask,
} from "../types";

const ACTION_VERB: Record<WorkflowActionType, string> = {
  submitted: "submitted",
  assigned: "assigned",
  approved: "approved",
  rejected: "requested changes on",
  "changes-requested": "requested changes on",
  reassigned: "reassigned",
  comment: "commented on",
  "due-date-set": "set a due date on",
  restored: "restored",
  archived: "archived",
  notified: "was notified about",
};

/** Categories whose pre-built template actionUrl points at a route that doesn't exist yet — redirected to the closest real route. */
const CATEGORY_ROUTE_OVERRIDE: Record<string, string> = {
  warning: "/dashboard/workflows",
};

/** Recommendations synthesized locally (not owned by AnalyticsEngine's insight store) keep their own apply/dismiss state here. */
const workflowRecommendationStatus = new Map<string, "new" | "applied" | "dismissed">();

export class DashboardEngine {
  constructor(private goals: GoalEngine = goalEngine) {}

  getOperationalKpis(): DashboardKpiSnapshot[] {
    const summary = workflowPlatformAPI.getWorkflowSummary();
    return [
      { id: "pending-approvals", title: "Pending Approvals", value: summary.pending, format: "count", description: "Awaiting review or changes" },
      { id: "overdue-items", title: "Overdue Items", value: summary.overdue, format: "count", description: "Past their due date" },
      { id: "approved-total", title: "Approved", value: summary.approved, format: "count", description: "Approved workflows" },
      { id: "avg-approval-time", title: "Avg. Approval Time", value: summary.avgApprovalDays, format: "days", description: "Average days to approve" },
    ];
  }

  getPendingApprovals(limit = 5): DashboardApprovalItem[] {
    return workflowPlatformAPI.getPendingApprovals(limit).map(w => ({ id: w.id, title: w.title, status: w.status, brand: w.brand, dueDate: w.dueDate, reviewer: w.reviewer ?? w.approver }));
  }

  getApprovalActivity(limit = 8): DashboardActivityEntry[] {
    return workflowPlatformAPI
      .getActivity(limit)
      .map(a => ({
        id: a.id,
        actor: a.performedBy,
        action: ACTION_VERB[a.type] ?? a.type,
        target: a.workflowTitle,
        timestamp: a.timestamp,
      }));
  }

  /**
   * Reads from the Inbox (Communication Hub), not the raw Notification
   * repository — the inbox's `isRead` flag is the field bulk/individual
   * "mark as read" actions actually update, whereas a Notification's own
   * `status` field is only updated by the singular `markAsRead(id)` path.
   * Sourcing from the inbox keeps the Dashboard's read/unread state
   * consistent with both action paths.
   */
  async getNotifications(userId: string, limit = 8): Promise<DashboardNotificationEntry[]> {
    const items = await notificationsPlatformAPI.getInboxItems(userId, limit);
    return items.map(item => ({
      // `notificationsPlatformAPI.markRead(userId, notificationId)` looks up
      // by the original notification's id, not the inbox item's own id —
      // expose that id here so `markNotificationRead()` round-trips correctly.
      id: item.notificationId,
      title: item.title,
      description: item.body,
      timestamp: item.createdAt,
      category: item.category,
      read: item.isRead,
      actionUrl: CATEGORY_ROUTE_OVERRIDE[item.category] ?? item.actionUrl,
      actionLabel: item.actionLabel,
    }));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return notificationsPlatformAPI.getUnreadCount(userId);
  }

  async markNotificationRead(userId: string, id: string): Promise<void> {
    await notificationsPlatformAPI.markRead(userId, id);
  }

  async markAllNotificationsRead(userId: string): Promise<number> {
    return notificationsPlatformAPI.markAllRead(userId);
  }

  /** Adapted from the Analytics Platform API's `DashboardAnalyticsSummary` contract — Dashboard never touches AnalyticsEngine internals directly. */
  getMarketingKpis(): DashboardMarketingKpi[] {
    return analyticsPlatformAPI.getDashboardAnalyticsSummary("30d").kpis.map(m => ({
      id: m.id,
      title: m.label,
      value: m.value,
      change: m.change,
      trend: m.trend,
      tone: m.tone,
      sparkline: m.sparkline,
      comparison: m.comparison,
    }));
  }

  /** Adapted from the Analytics Platform API's `DashboardAnalyticsSummary` contract. */
  getPerformanceSeries(): DashboardPerformancePoint[] {
    return analyticsPlatformAPI.getDashboardAnalyticsSummary("30d").revenueSeries;
  }

  /** Adapted from the Analytics Platform API's `DashboardAnalyticsSummary` contract. */
  getChannelOverview(): DashboardChannelRow[] {
    return analyticsPlatformAPI.getDashboardAnalyticsSummary("30d").channels.map(row => ({
      id: row.channel.toLowerCase().replace(/\s+/g, "-"),
      name: row.channel,
      spend: row.spend,
      revenue: row.revenue,
      roas: row.roas,
      cpa: row.cpa,
      status: row.status,
    }));
  }

  /** Reads real connection state from the Connector Platform's facade — seeded once via `seedDashboardConnections()`. */
  async getConnectedPlatforms(): Promise<DashboardConnectedPlatform[]> {
    const connections = await connectorsPlatformAPI.getConnectorSummaries(DASHBOARD_ORGANIZATION_ID);
    return connections.map(c => ({
      id: c.id,
      name: c.name,
      providerId: c.providerId,
      status: c.status === "expired" ? "error" : (c.status as DashboardConnectedPlatform["status"]),
      lastSyncAt: c.lastSyncAt,
      errorMessage: c.status === "error" ? "Connection error" : undefined,
    }));
  }

  async retryConnection(connectionId: string): Promise<void> {
    await connectorsPlatformAPI.reconnect(connectionId);
    dashboardActivityLog.record("You", "reconnected", connectionId);
  }

  /** Computed from real Workflow entries that carry a due date and aren't yet resolved. */
  getUpcomingTasks(limit = 6): DashboardTask[] {
    return workflowPlatformAPI
      .getUpcoming(limit)
      .map(w => ({
        id: w.id,
        title: w.title,
        dueDate: w.dueDate,
        type: w.campaign ? "campaign" : w.status === "changes-requested" ? "deadline" : "report",
        priority: w.priority === "critical" || w.priority === "high" ? "high" : w.priority === "medium" ? "medium" : "low",
        assignee: w.reviewer ?? w.approver ?? w.submittedBy,
      }));
  }

  /** Merges the Analytics Platform API's real insights with one workflow-derived recommendation when overdue items exist. */
  getRecommendations(): DashboardRecommendation[] {
    const analyticsRecs: DashboardRecommendation[] = analyticsPlatformAPI.getDashboardAnalyticsSummary("30d").insights.map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      impact: i.uplift,
      confidence: i.confidence,
      priority: i.priority === "High" ? "high" : i.priority === "Medium" ? "medium" : "low",
      source: "analytics",
      status: i.status,
    }));

    const overdue = workflowPlatformAPI.getOverdue();
    const workflowRecs: DashboardRecommendation[] = [];
    if (overdue.length > 0) {
      const id = "rec-overdue-approvals";
      workflowRecs.push({
        id,
        title: "Clear overdue approvals",
        description: `${overdue.length} item${overdue.length === 1 ? " is" : "s are"} past due for review: ${overdue.slice(0, 2).map(w => w.title).join(", ")}${overdue.length > 2 ? "…" : ""}.`,
        impact: `${overdue.length} overdue`,
        confidence: 100,
        priority: "high",
        source: "workflow",
        status: workflowRecommendationStatus.get(id) ?? "new",
      });
    }

    return [...analyticsRecs, ...workflowRecs].filter(r => r.status !== "dismissed");
  }

  applyRecommendation(id: string): void {
    if (id.startsWith("rec-")) workflowRecommendationStatus.set(id, "applied");
    else analyticsPlatformAPI.applyInsight(id);
    dashboardActivityLog.record("You", "applied recommendation", id);
  }

  dismissRecommendation(id: string): void {
    if (id.startsWith("rec-")) workflowRecommendationStatus.set(id, "dismissed");
    else analyticsPlatformAPI.dismissInsight(id);
    dashboardActivityLog.record("You", "dismissed recommendation", id);
  }

  /** A real generated summary from this session's own composed KPI/approval/goal data — not a static string. */
  getMorningBriefing(): DashboardMorningBriefing {
    const kpis = workflowPlatformAPI.getWorkflowSummary();
    const marketing = this.getMarketingKpis();
    const revenue = marketing.find(m => m.id === "revenue");
    const scorecard = this.goals.getScorecard();
    const atRisk = scorecard.filter(g => g.status === "at-risk" || g.status === "off-track").length;
    const achieved = scorecard.filter(g => g.status === "achieved").length;

    const healthInputs = [
      revenue?.tone === "positive" ? 1 : revenue?.tone === "negative" ? -1 : 0,
      kpis.overdue === 0 ? 1 : -1,
      atRisk === 0 ? 1 : -1,
    ];
    const healthScore = Math.max(40, Math.min(99, 78 + healthInputs.reduce((a, b) => a + b, 0) * 7));
    const healthLabel = healthScore >= 85 ? "Excellent" : healthScore >= 70 ? "Good" : "Needs Attention";

    const parts: string[] = [];
    if (revenue) parts.push(`Revenue is ${revenue.value}, ${revenue.trend === "up" ? "up" : revenue.trend === "down" ? "down" : "flat"} ${revenue.change} vs the prior period.`);
    parts.push(kpis.pending > 0 ? `${kpis.pending} item${kpis.pending === 1 ? "" : "s"} awaiting approval${kpis.overdue > 0 ? `, ${kpis.overdue} overdue` : ""}.` : "No items awaiting approval.");
    parts.push(achieved > 0 ? `${achieved} goal${achieved === 1 ? "" : "s"} achieved this period.` : atRisk > 0 ? `${atRisk} goal${atRisk === 1 ? " is" : "s are"} at risk.` : "Goals are tracking on pace.");

    return {
      headline: healthInputs.reduce((a, b) => a + b, 0) >= 2 ? "Strong momentum across the board" : atRisk > 0 || kpis.overdue > 0 ? "A few things need your attention" : "Steady performance this period",
      summary: parts.join(" "),
      healthScore,
      healthLabel,
      generatedAt: new Date().toISOString(),
    };
  }

  /** A simple linear projection over the real revenue series — explicitly a trend extrapolation, not a trained model. Shared with Analytics via `linearForecast()`. */
  getForecast(days = 7): DashboardForecastPoint[] {
    const series = this.getPerformanceSeries();
    return linearForecast(series.map(p => p.revenue), days).map(p => ({ label: p.label, projectedRevenue: p.projectedValue }));
  }

  /** Threshold-based checks over real data — explicitly not ML-based anomaly detection. */
  detectRisks(): DashboardRisk[] {
    const risks: DashboardRisk[] = [];
    const kpis = workflowPlatformAPI.getWorkflowSummary();
    if (kpis.overdue > 0) {
      risks.push({ id: "risk-overdue", title: "Overdue approvals", description: `${kpis.overdue} workflow item${kpis.overdue === 1 ? "" : "s"} past due date.`, severity: "high", detectionMethod: "threshold" });
    }
    for (const m of this.getMarketingKpis()) {
      if (m.tone === "negative" && m.trend === "down") {
        risks.push({ id: `risk-${m.id}`, title: `${m.title} trending down`, description: `${m.title} changed ${m.change} vs the prior period.`, severity: "medium", detectionMethod: "threshold" });
      }
    }
    for (const g of this.goals.getScorecard()) {
      if (g.status === "off-track") {
        risks.push({ id: `risk-goal-${g.id}`, title: `${g.title} off track`, description: `Currently ${Math.round(g.progress * 100)}% of target with the period ending ${new Date(g.periodEnd).toLocaleDateString()}.`, severity: "high", detectionMethod: "threshold" });
      }
    }
    return risks;
  }

  /** Merges real Workflow activity, real Asset version history, and the Dashboard's own layout/goal event log. */
  getActivityFeed(limit = 10): DashboardActivityEntry[] {
    const workflowEntries = this.getApprovalActivity(limit);
    const assetEntries: DashboardActivityEntry[] = assetsPlatformAPI
      .getRecentActivity(limit)
      .map(h => ({ id: `asset-${h.assetId}-${h.timestamp}`, actor: "System", action: h.action, target: h.assetName, timestamp: h.timestamp }));
    const dashboardEntries = dashboardActivityLog.list(limit);

    return [...workflowEntries, ...assetEntries, ...dashboardEntries]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getSnapshot(userId: string): Promise<DashboardSnapshot> {
    const [notifications, unreadNotificationCount] = await Promise.all([this.getNotifications(userId), this.getUnreadNotificationCount(userId)]);
    return {
      operationalKpis: this.getOperationalKpis(),
      pendingApprovals: this.getPendingApprovals(),
      approvalActivity: this.getApprovalActivity(),
      notifications,
      unreadNotificationCount,
    };
  }
}

export const dashboardEngine = new DashboardEngine();
