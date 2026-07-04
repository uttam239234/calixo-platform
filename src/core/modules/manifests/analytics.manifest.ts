import { BarChart3 } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const analyticsManifest: ModuleManifest = defineModule({
  id: "analytics",
  name: "Analytics",
  version: "2.0.0",
  description: "Deep-dive analytics across all marketing channels with AI-driven insights.",
  category: "analytics",
  icon: BarChart3,
  route: "/dashboard/analytics",
  subscriptionTier: "free",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "analytics",
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          order: 1,
        },
      ],
    },
  ],
  permissions: [
    { name: "analytics.view", description: "View analytics", action: "view", resource: "analytics" },
    { name: "analytics.export", description: "Export analytics data", action: "export", resource: "analytics" },
    { name: "analytics.manage", description: "Manage analytics settings", action: "manage", resource: "analytics" },
  ],
  reports: [
    { id: "channel-report", name: "Channel Performance", description: "Breakdown by channel", format: "PDF", type: "manual" },
    { id: "traffic-report", name: "Traffic Analytics", description: "Web traffic analysis", format: "PDF", type: "manual" },
  ],
  notifications: [
    { id: "analytics-threshold", name: "Analytics Thresholds", description: "Alert on metric thresholds", channels: ["inApp"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["analytics-insight"] },
  settings: [{ id: "analytics-config", title: "Analytics Settings", description: "Configure analytics preferences" }],
  metadata: { order: 1 },
});