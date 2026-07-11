import { FileText } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const reportsManifest: ModuleManifest = defineModule({
  id: "reports",
  name: "Reports",
  version: "2.0.0",
  description: "Comprehensive reporting, analytics exports, and scheduled report delivery.",
  category: "core",
  icon: FileText,
  route: "/dashboard/reports",
  subscriptionTier: "free",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "reports",
          title: "Reports",
          href: "/dashboard/reports",
          icon: FileText,
          order: 7,
        },
      ],
    },
  ],
  permissions: [
    { name: "reports.view", description: "View reports", action: "view", resource: "report" },
    { name: "reports.create", description: "Create custom reports", action: "create", resource: "report" },
    { name: "reports.export", description: "Export reports", action: "export", resource: "report" },
    { name: "reports.manage", description: "Manage report schedules", action: "manage", resource: "report" },
  ],
  reports: [
    { id: "executive-summary", name: "Executive Summary", description: "High-level performance overview", format: "PDF", type: "scheduled" },
    { id: "marketing-roi", name: "Marketing ROI", description: "Return on investment analysis", format: "PDF", type: "manual" },
    { id: "channel-breakdown", name: "Channel Breakdown", description: "Performance by marketing channel", format: "Excel", type: "manual" },
  ],
  notifications: [
    { id: "report-ready", name: "Report Ready", description: "Scheduled report is available", channels: ["inApp", "email"], defaultEnabled: true },
    { id: "report-error", name: "Report Generation Failed", description: "Alert when report generation fails", channels: ["inApp"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["report-summary", "trend-analysis"] },
  settings: [
    { id: "report-preferences", title: "Report Preferences", description: "Configure report defaults" },
    { id: "report-schedules", title: "Report Schedules", description: "Manage scheduled report delivery" },
  ],
  backgroundJobs: [
    { id: "report-scheduler", name: "Report Scheduler", description: "Generate and deliver scheduled reports", schedule: "0 */6 * * *", enabled: true },
  ],
  metadata: { order: 7 },
});