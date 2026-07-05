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
