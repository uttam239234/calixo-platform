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
 *  - The Universal Connector Framework's Server Actions (`@/core/connectors/actions`)
 *    for real connector instance/health/token/sync status — never the
 *    `"server-only"` `connectorFrameworkAPI` directly, since this engine
 *    is reachable from client component bundles (`DashboardShell.tsx`).
 *
 * No persistence, no UI, no new business rules — this is an adapter/
 * composition layer only.
 */

import type { WorkflowActionType } from "@/core/workflow/types";
import { workflowPlatformAPI } from "@/core/workflow/platform/WorkflowPlatformAPI";
import { notificationsPlatformAPI } from "@/communication/platform/NotificationsPlatformAPI";
import { analyticsPlatformAPI } from "@/core/analytics/platform/AnalyticsPlatformAPI";
import { assetsPlatformAPI } from "@/core/assets/platform/AssetsPlatformAPI";
import { listConnectorInstancesAction, getConnectorHealthAction, getConnectorSyncHistoryAction, getConnectorTokenStatusAction, refreshConnectorAction } from "@/core/connectors/actions";
import type { ConnectorHealthStatus } from "@/core/connectors/types";
import { goalEngine, GoalEngine } from "@/core/platform/goals";
import { linearForecast } from "@/core/platform/forecast/linearForecast";
import { alertPlatformAPI } from "@/core/platform/observability/AlertPlatformAPI";
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { subscriptionPlatformAPI } from "@/core/platform/commercial/SubscriptionPlatformAPI";
import { dashboardActivityLog } from "../activity/DashboardActivityLog";

export const DASHBOARD_ORGANIZATION_ID = "org-current";

/** A coarse, honestly-derived stand-in for a numeric success rate — the framework's `ConnectorHealth` reports a status, not a percentage, so this maps status to a representative figure rather than fabricating precision that doesn't exist. */
function successRateForHealth(status: ConnectorHealthStatus): number {
  if (status === "healthy") return 100;
  if (status === "warning") return 70;
  if (status === "rate_limited") return 50;
  return 0;
}
import type {
  DashboardActionCenterItem,
  DashboardActivityEntry,
  DashboardApprovalItem,
  DashboardChannelRow,
  DashboardConnectedPlatform,
  DashboardForecastPoint,
  DashboardHealthScore,
  DashboardHealthSignal,
  DashboardKpiSnapshot,
  DashboardMarketingKpi,
  DashboardMorningBriefing,
  DashboardNotificationEntry,
  DashboardPerformancePoint,
  DashboardRecommendation,
  DashboardRisk,
  DashboardSnapshot,
  DashboardSubscriptionSummary,
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

/** Action Center items are synthesized locally (composed from several platforms, owned by none of them) and keep their own open/snoozed/dismissed state here, same pattern as `workflowRecommendationStatus`. */
const actionCenterStatus = new Map<string, "open" | "snoozed" | "dismissed">();

function scoreStatus(score: number): "strength" | "risk" | "neutral" {
  return score >= 75 ? "strength" : score < 50 ? "risk" : "neutral";
}

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

  /**
   * Reads real connector instances from the Universal Connector Framework.
   * The connector actions below derive the real signed-in session's own
   * organization themselves via `resolveIdentity()`, never a caller-supplied
   * id (a client-resolved id lives in a different registry instance than
   * the server's and would never match). An org with nothing installed yet
   * correctly returns an empty list — not a fabricated "connected" state.
   */
  async getConnectedPlatforms(): Promise<DashboardConnectedPlatform[]> {
    const instances = await listConnectorInstancesAction();

    return Promise.all(
      instances.map(async instance => {
        const [health, syncHistory, credential] = await Promise.all([
          getConnectorHealthAction(instance.id).catch(() => undefined),
          getConnectorSyncHistoryAction(instance.id).catch(() => []),
          getConnectorTokenStatusAction(instance.id).catch(() => undefined),
        ]);
        const status: DashboardConnectedPlatform["status"] = instance.status === "active" ? "connected" : instance.status === "paused" ? "connecting" : instance.status === "error" ? "error" : "disconnected";
        return {
          id: instance.id,
          name: instance.displayName,
          providerId: instance.connectorId,
          status,
          lastSyncAt: syncHistory[syncHistory.length - 1]?.finishedAt,
          errorMessage: status === "error" ? (health?.message ?? "Connection error") : undefined,
          successRate: health ? successRateForHealth(health.status) : undefined,
          tokenExpiresAt: credential?.expiresAt,
        };
      })
    );
  }

  async retryConnection(connectorInstanceId: string): Promise<void> {
    await refreshConnectorAction(connectorInstanceId);
    dashboardActivityLog.record("You", "reconnected", connectorInstanceId);
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

  /**
   * A real generated summary from this session's own composed KPI/
   * approval/goal data — not a static string. Also folds in connector
   * token expiry (Workstream E), a real entitlement warning (never a
   * hardcoded limit), and the top-priority recommendation, so the
   * briefing reads as a genuine daily digest rather than just KPIs.
   */
  async getMorningBriefing(organizationId: string = DASHBOARD_ORGANIZATION_ID): Promise<DashboardMorningBriefing> {
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

    const connections = await this.getConnectedPlatforms();
    const expiringSoon = connections.filter(c => c.tokenExpiresAt && Math.ceil((new Date(c.tokenExpiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) <= 7).length;

    const aiCreditsRemaining = entitlementPlatformAPI.remaining(organizationId, "aiCreditsUsed");
    const aiCreditsLimit = entitlementPlatformAPI.limit(organizationId, "aiCreditsUsed");
    const creditsLow = Boolean(aiCreditsLimit) && aiCreditsLimit! > 0 && aiCreditsRemaining / aiCreditsLimit! <= 0.15;

    const topRecommendation = this.getRecommendations()[0];

    const parts: string[] = [];
    if (revenue) parts.push(`Revenue is ${revenue.value}, ${revenue.trend === "up" ? "up" : revenue.trend === "down" ? "down" : "flat"} ${revenue.change} vs the prior period.`);
    parts.push(kpis.pending > 0 ? `${kpis.pending} item${kpis.pending === 1 ? "" : "s"} awaiting approval${kpis.overdue > 0 ? `, ${kpis.overdue} overdue` : ""}.` : "No items awaiting approval.");
    parts.push(achieved > 0 ? `${achieved} goal${achieved === 1 ? "" : "s"} achieved this period.` : atRisk > 0 ? `${atRisk} goal${atRisk === 1 ? " is" : "s are"} at risk.` : "Goals are tracking on pace.");
    if (expiringSoon > 0) parts.push(`${expiringSoon} connector token${expiringSoon === 1 ? "" : "s"} expiring this week.`);
    if (creditsLow) parts.push(`AI credits are running low (${aiCreditsRemaining} remaining).`);
    if (topRecommendation) parts.push(`Recommended action: ${topRecommendation.title}.`);

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

  /**
   * A weighted composite of six already-real signals — never a new
   * computation invented for this method, just this method's own
   * combining formula. Connector Health/Platform Adoption reuse the
   * connection data `getConnectedPlatforms()` already fetches.
   */
  async getHealthScore(): Promise<DashboardHealthScore> {
    const marketing = this.getMarketingKpis();
    const revenue = marketing.find(m => m.id === "revenue");
    const revenueScore = revenue ? (revenue.tone === "positive" ? 90 : revenue.tone === "negative" ? 35 : 65) : 65;

    const connections = await this.getConnectedPlatforms();
    const withHealth = connections.filter(c => c.successRate !== undefined);
    const connectorScore = withHealth.length > 0 ? withHealth.reduce((sum, c) => sum + (c.successRate ?? 0), 0) / withHealth.length : 80;

    const scorecard = this.goals.getScorecard();
    const achieved = scorecard.filter(g => g.status === "achieved").length;
    const goalScore = scorecard.length > 0 ? (achieved / scorecard.length) * 100 : 70;

    const channels = this.getChannelOverview();
    const healthyChannels = channels.filter(c => c.status === "Healthy").length;
    const campaignScore = channels.length > 0 ? (healthyChannels / channels.length) * 100 : 70;

    const workflowSummary = workflowPlatformAPI.getWorkflowSummary();
    const workflowScore = Math.max(0, 100 - workflowSummary.overdue * 20);

    const connectedCount = connections.filter(c => c.status === "connected").length;
    const adoptionScore = connections.length > 0 ? (connectedCount / connections.length) * 100 : 50;

    const breakdown: DashboardHealthSignal[] = [
      {
        key: "revenue",
        label: "Revenue Growth",
        weight: 0.25,
        score: revenueScore,
        status: scoreStatus(revenueScore),
        detail: revenue ? `Revenue is ${revenue.trend === "up" ? "up" : revenue.trend === "down" ? "down" : "flat"} ${revenue.change} vs the prior period.` : "No revenue data yet.",
      },
      {
        key: "connectors",
        label: "Connector Health",
        weight: 0.2,
        score: connectorScore,
        status: scoreStatus(connectorScore),
        detail: withHealth.length > 0 ? `${Math.round(connectorScore)}% average connector success rate.` : "No connector health data yet.",
      },
      {
        key: "goals",
        label: "Goal Achievement",
        weight: 0.2,
        score: goalScore,
        status: scoreStatus(goalScore),
        detail: `${achieved} of ${scorecard.length} goal${scorecard.length === 1 ? "" : "s"} achieved this period.`,
      },
      {
        key: "campaigns",
        label: "Campaign Performance",
        weight: 0.15,
        score: campaignScore,
        status: scoreStatus(campaignScore),
        detail: `${healthyChannels} of ${channels.length} channel${channels.length === 1 ? "" : "s"} healthy.`,
      },
      {
        key: "workflow",
        label: "Workflow Delays",
        weight: 0.1,
        score: workflowScore,
        status: scoreStatus(workflowScore),
        detail: workflowSummary.overdue > 0 ? `${workflowSummary.overdue} overdue workflow item${workflowSummary.overdue === 1 ? "" : "s"}.` : "No overdue workflow items.",
      },
      {
        key: "adoption",
        label: "Platform Adoption",
        weight: 0.1,
        score: adoptionScore,
        status: scoreStatus(adoptionScore),
        detail: `${connectedCount} of ${connections.length} platform${connections.length === 1 ? "" : "s"} connected.`,
      },
    ];

    const score = Math.round(breakdown.reduce((sum, s) => sum + s.score * s.weight, 0));
    const label = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs Attention";

    return {
      score,
      label,
      breakdown,
      strengths: breakdown.filter(s => s.status === "strength").map(s => s.label),
      risks: breakdown.filter(s => s.status === "risk").map(s => s.label),
      generatedAt: new Date().toISOString(),
    };
  }

  /** Reads the real Subscription Platform record — display only, never a gate decision (that's `EntitlementPlatformAPI`'s job). */
  getSubscriptionSummary(organizationId: string = DASHBOARD_ORGANIZATION_ID): DashboardSubscriptionSummary {
    const subscription = subscriptionPlatformAPI.getOrDefault(organizationId);
    return {
      tier: subscription.tier,
      status: subscription.status,
      renewsAt: subscription.renewsAt,
      seats: { used: subscription.usage.seatsUsed, limit: subscription.limits.seats },
      aiCredits: { used: subscription.usage.aiCreditsUsed, limit: subscription.limits.aiCredits },
      storageGB: { used: subscription.usage.storageGBUsed, limit: subscription.limits.storageGB },
      connectors: { used: subscription.usage.connectorsUsed, limit: subscription.limits.connectors },
    };
  }

  /**
   * The unified Action Center — deliberately does NOT re-list every
   * pending approval (that's `getPendingApprovals()`'s own widget); it
   * surfaces only what has no other dedicated widget yet: a rolled-up
   * overdue-approvals action, connector failures/expiring tokens, real
   * entitlement warnings (via `EntitlementPlatformAPI`, never a hardcoded
   * limit), and real active alerts.
   */
  async getActionCenterItems(organizationId: string = DASHBOARD_ORGANIZATION_ID): Promise<DashboardActionCenterItem[]> {
    const items: DashboardActionCenterItem[] = [];

    const overdue = workflowPlatformAPI.getOverdue();
    if (overdue.length > 0) {
      const id = "action-overdue-approvals";
      items.push({
        id,
        title: "Overdue approvals need review",
        description: `${overdue.length} item${overdue.length === 1 ? " is" : "s are"} past due: ${overdue.slice(0, 2).map(w => w.title).join(", ")}${overdue.length > 2 ? "…" : ""}.`,
        severity: "high",
        category: "approval",
        kind: "action",
        actionLabel: "Review approvals",
        actionHref: "/dashboard/workflows",
        status: actionCenterStatus.get(id) ?? "open",
      });
    }

    const connections = await this.getConnectedPlatforms();
    for (const connection of connections) {
      if (connection.status === "error") {
        const id = `incident-connector-${connection.id}`;
        items.push({
          id,
          title: `${connection.name} connection error`,
          description: connection.errorMessage ?? "This connector needs attention.",
          severity: "high",
          category: "connector",
          kind: "incident",
          actionLabel: "Fix connection",
          actionHref: "/dashboard/settings",
          status: actionCenterStatus.get(id) ?? "open",
        });
      } else if (connection.tokenExpiresAt) {
        const days = Math.ceil((new Date(connection.tokenExpiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        if (days <= 7) {
          const id = `incident-token-${connection.id}`;
          items.push({
            id,
            title: `${connection.name} token ${days <= 0 ? "expired" : `expires in ${days}d`}`,
            description: "Reconnect this platform to avoid a sync interruption.",
            severity: days <= 0 ? "high" : "medium",
            category: "connector",
            kind: "incident",
            actionLabel: "Reconnect",
            actionHref: "/dashboard/settings",
            status: actionCenterStatus.get(id) ?? "open",
          });
        }
      }
    }

    const aiCreditsRemaining = entitlementPlatformAPI.remaining(organizationId, "aiCreditsUsed");
    const aiCreditsLimit = entitlementPlatformAPI.limit(organizationId, "aiCreditsUsed");
    if (aiCreditsLimit && aiCreditsLimit > 0 && aiCreditsRemaining / aiCreditsLimit <= 0.15) {
      const id = "action-ai-credits-low";
      items.push({
        id,
        title: "AI credits running low",
        description: `${aiCreditsRemaining} of ${aiCreditsLimit} AI credits remaining this period.`,
        severity: "medium",
        category: "entitlement",
        kind: "action",
        actionLabel: "Review plan",
        actionHref: "/dashboard/settings",
        status: actionCenterStatus.get(id) ?? "open",
      });
    }

    const connectorsRemaining = entitlementPlatformAPI.remaining(organizationId, "connectorsUsed");
    const connectorsLimit = entitlementPlatformAPI.limit(organizationId, "connectorsUsed");
    if (connectorsLimit && connectorsLimit > 0 && connectorsRemaining / connectorsLimit <= 0.15) {
      const id = "action-connectors-limit";
      items.push({
        id,
        title: "Connector limit nearly reached",
        description: `${connectorsRemaining} of ${connectorsLimit} connector slots remaining on the current plan.`,
        severity: "medium",
        category: "entitlement",
        kind: "action",
        actionLabel: "Review plan",
        actionHref: "/dashboard/settings",
        status: actionCenterStatus.get(id) ?? "open",
      });
    }

    for (const alert of alertPlatformAPI.listActive()) {
      const id = `incident-alert-${alert.id}`;
      items.push({
        id,
        title: alert.ruleName,
        description: alert.message,
        severity: alert.severity === "critical" ? "high" : alert.severity === "warning" ? "medium" : "low",
        category: "alert",
        kind: "incident",
        actionLabel: "Investigate",
        actionHref: "/dashboard/settings",
        status: actionCenterStatus.get(id) ?? "open",
      });
    }

    return items.filter(i => i.status === "open");
  }

  snoozeActionCenterItem(id: string): void {
    actionCenterStatus.set(id, "snoozed");
    dashboardActivityLog.record("You", "snoozed", id);
  }

  dismissActionCenterItem(id: string): void {
    actionCenterStatus.set(id, "dismissed");
    dashboardActivityLog.record("You", "dismissed", id);
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
