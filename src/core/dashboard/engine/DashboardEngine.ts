/**
 * Calixo Platform - Dashboard Engine
 *
 * Composes the Dashboard's landing-page view models from OTHER platforms'
 * real, existing engines — it never recomputes or duplicates their logic.
 * Today that means:
 *  - `WorkflowEngine` (src/core/workflow) for approvals/pending-work KPIs
 *    and activity, exactly the same engine `/dashboard/workflows` already
 *    uses.
 *  - `notificationService` / `inboxService` (src/communication) for the
 *    notification feed and unread count — a real, previously-unwired
 *    engine.
 *
 * No persistence, no UI, no new business rules — this is an adapter/
 * composition layer only.
 */

import { WorkflowEngine } from "@/core/workflow/WorkflowEngine";
import type { WorkflowActionType } from "@/core/workflow/types";
import { notificationService } from "@/communication/services";
import { inboxService } from "@/communication/inbox";
import type { DashboardActivityEntry, DashboardApprovalItem, DashboardKpiSnapshot, DashboardNotificationEntry, DashboardSnapshot } from "../types";

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

export class DashboardEngine {
  constructor(
    private workflowEngine: typeof WorkflowEngine = WorkflowEngine,
    private notifications: typeof notificationService = notificationService,
    private inbox: typeof inboxService = inboxService
  ) {}

  getOperationalKpis(): DashboardKpiSnapshot[] {
    const kpis = this.workflowEngine.getKPIs();
    return [
      { id: "pending-approvals", title: "Pending Approvals", value: kpis.pending, format: "count", description: "Awaiting review or changes" },
      { id: "overdue-items", title: "Overdue Items", value: kpis.overdue, format: "count", description: "Past their due date" },
      { id: "approved-total", title: "Approved", value: kpis.approved, format: "count", description: "Approved workflows" },
      { id: "avg-approval-time", title: "Avg. Approval Time", value: kpis.avgApprovalDays, format: "days", description: "Average days to approve" },
    ];
  }

  getPendingApprovals(limit = 5): DashboardApprovalItem[] {
    const pending = [...this.workflowEngine.getByStatus("in-review"), ...this.workflowEngine.getByStatus("changes-requested")];
    return pending.slice(0, limit).map(w => ({ id: w.id, title: w.title, status: w.status, brand: w.brand, dueDate: w.dueDate, reviewer: w.reviewer ?? w.approver }));
  }

  getApprovalActivity(limit = 8): DashboardActivityEntry[] {
    return this.workflowEngine
      .getActivity()
      .slice(0, limit)
      .map(a => ({
        id: a.id,
        actor: a.performedBy,
        action: ACTION_VERB[a.type] ?? a.type,
        target: a.workflowTitle,
        timestamp: a.timestamp,
      }));
  }

  async getNotifications(userId: string, limit = 8): Promise<DashboardNotificationEntry[]> {
    const items = await this.notifications.getUserNotifications(userId);
    return items
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(n => ({
        id: n.id,
        title: n.title,
        description: n.body,
        timestamp: n.createdAt,
        category: n.category,
        read: n.status === "read",
        actionUrl: CATEGORY_ROUTE_OVERRIDE[n.category] ?? n.actionUrl,
        actionLabel: n.actionLabel,
      }));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.inbox.getUnreadCount(userId);
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.notifications.markAsRead(id);
  }

  async markAllNotificationsRead(userId: string): Promise<number> {
    return this.notifications.markAllAsRead(userId);
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
