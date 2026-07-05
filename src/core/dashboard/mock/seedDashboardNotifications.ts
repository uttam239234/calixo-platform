/**
 * Calixo Platform - Dashboard Notification Seeding
 *
 * Opt-in only — never called automatically outside `initializeDashboardFoundation()`.
 * Genuinely drives `notificationService.sendFromTemplate()` (real template
 * rendering, real inbox insertion, real audit trail) rather than
 * constructing Notification objects by hand, so this doubles as a live
 * demonstration that the previously-unwired Communication Platform works.
 */

import { notificationService } from "@/communication/services";

export const DASHBOARD_CURRENT_USER_ID = "user-current";

interface SeedEvent {
  templateKey: string;
  data: Record<string, unknown>;
  source: string;
}

const SEED_EVENTS: SeedEvent[] = [
  { templateKey: "approval.required", data: { itemName: "Summer Sale Banner", itemType: "Creative asset", submittedBy: "Sarah Chen", approvalId: "wf-1" }, source: "workflow" },
  { templateKey: "campaign.budget_alert", data: { campaignName: "Google Ads - Search", spent: "$8,500", budget: "$10,000", percentage: 85, campaignId: "google-ads" }, source: "campaigns" },
  { templateKey: "report.ready", data: { reportName: "Weekly Performance Summary", reportId: "weekly-summary" }, source: "reports" },
  { templateKey: "ai.insight", data: { insight: "Retargeting audience converting 22% better than average", confidence: 94 }, source: "ai" },
  { templateKey: "integration.failed", data: { providerName: "Instagram", error: "Access token expired", integrationId: "instagram" }, source: "integrations" },
  { templateKey: "workflow.completed", data: { workflowName: "Q3 Brand Guidelines", actionsCompleted: 4, workflowId: "wf-2" }, source: "workflow" },
  { templateKey: "system.alert", data: { alertTitle: "Storage usage high", alertMessage: "Workspace storage is at 82% of plan limit.", severity: "warning" }, source: "system" },
];

export async function seedDashboardNotifications(userId: string = DASHBOARD_CURRENT_USER_ID): Promise<number> {
  const existing = await notificationService.getUserNotifications(userId);
  if (existing.length > 0) return existing.length;

  for (const event of SEED_EVENTS) {
    await notificationService.sendFromTemplate({
      templateKey: event.templateKey,
      data: event.data,
      userId,
      source: event.source,
    });
  }

  return SEED_EVENTS.length;
}
