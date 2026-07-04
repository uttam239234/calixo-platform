import { Megaphone } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const adsManagerManifest: ModuleManifest = defineModule({
  id: "ads",
  name: "Ads Manager",
  version: "2.0.0",
  description: "Manage and optimize advertising campaigns across platforms.",
  category: "marketing",
  icon: Megaphone,
  route: "/dashboard/ads",
  subscriptionTier: "professional",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "ads",
          title: "Ads Manager",
          href: "/dashboard/ads",
          icon: Megaphone,
          order: 2,
        },
      ],
    },
  ],
  permissions: [
    { name: "ads.view", description: "View ads manager", action: "view", resource: "ads" },
    { name: "ads.create", description: "Create campaigns", action: "create", resource: "ads" },
    { name: "ads.manage", description: "Manage campaigns and budgets", action: "manage", resource: "ads" },
    { name: "ads.export", description: "Export campaign data", action: "export", resource: "ads" },
  ],
  reports: [
    { id: "campaign-performance", name: "Campaign Performance", description: "Performance by campaign", format: "PDF", type: "manual" },
    { id: "budget-utilization", name: "Budget Utilization", description: "Spend analysis", format: "CSV", type: "manual" },
  ],
  notifications: [
    { id: "budget-alert", name: "Budget Alerts", description: "Alert when budget thresholds reached", channels: ["inApp", "email"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["ad-optimization", "budget-forecast"] },
  settings: [{ id: "ads-config", title: "Ads Settings", description: "Configure campaign defaults" }],
  integrations: [{ id: "google-ads", name: "Google Ads", description: "Connect Google Ads", provider: "google", authType: "oauth2", required: false }],
  backgroundJobs: [{ id: "campaign-sync", name: "Campaign Sync", description: "Sync campaign data from platforms", schedule: "*/15 * * * *", enabled: true }],
  featureFlags: [{ id: "ai-budget-optimizer", name: "AI Budget Optimizer", description: "AI-powered budget allocation", defaultValue: false, canOverride: true }],
  metadata: { order: 2 },
});