import { LayoutDashboard } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const dashboardManifest: ModuleManifest = defineModule({
  id: "dashboard",
  name: "Dashboard",
  version: "2.0.0",
  description: "Central command center with KPIs, performance metrics, and AI-powered insights.",
  category: "core",
  icon: LayoutDashboard,
  route: "/dashboard",
  subscriptionTier: "free",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          order: 0,
        },
      ],
    },
  ],
  permissions: [
    { name: "dashboard.view", description: "View dashboard", action: "view", resource: "dashboard" },
    { name: "dashboard.export", description: "Export dashboard data", action: "export", resource: "dashboard" },
  ],
  reports: [
    { id: "executive-summary", name: "Executive Summary", description: "High-level performance overview", format: "PDF", type: "manual" },
  ],
  notifications: [
    { id: "kpi-alert", name: "KPI Alerts", description: "Alert when KPIs cross thresholds", channels: ["inApp", "email"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["dashboard-summary"] },
  settings: [{ id: "dashboard-preferences", title: "Dashboard Preferences", description: "Customize your dashboard layout" }],
  metadata: { order: 0 },
});