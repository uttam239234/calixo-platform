import { ShieldCheck } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const brandMonitoringManifest: ModuleManifest = defineModule({
  id: "brand",
  name: "Brand Monitoring",
  version: "2.0.0",
  description: "Monitor brand mentions, sentiment, competitors, and crisis alerts.",
  category: "brand",
  icon: ShieldCheck,
  route: "/dashboard/brand",
  subscriptionTier: "enterprise",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "brand",
          title: "Brand Monitoring",
          href: "/dashboard/brand",
          icon: ShieldCheck,
          order: 4,
        },
      ],
    },
  ],
  permissions: [
    { name: "brand.view", description: "View brand monitoring", action: "view", resource: "brand" },
    { name: "brand.manage", description: "Manage brand settings", action: "manage", resource: "brand" },
    { name: "brand.export", description: "Export brand data", action: "export", resource: "brand" },
    { name: "brand.crisis", description: "Manage crisis alerts", action: "manage", resource: "crisis" },
  ],
  reports: [
    { id: "brand-health", name: "Brand Health Report", description: "Overall brand health overview", format: "PDF", type: "manual" },
    { id: "sentiment-trend", name: "Sentiment Trend Report", description: "Sentiment analysis over time", format: "PDF", type: "scheduled" },
    { id: "competitor-analysis", name: "Competitor Analysis", description: "Competitive landscape report", format: "Excel", type: "manual" },
  ],
  notifications: [
    { id: "crisis-alert", name: "Crisis Alerts", description: "Alert when crisis detected", channels: ["inApp", "email", "slack"], defaultEnabled: true },
    { id: "sentiment-drop", name: "Sentiment Drop", description: "Alert on significant sentiment drops", channels: ["inApp", "email"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["brand-insight", "sentiment-analysis", "competitor-summary"] },
  settings: [
    { id: "brand-settings", title: "Brand Settings", description: "Configure brand monitoring parameters" },
    { id: "alert-thresholds", title: "Alert Thresholds", description: "Configure when alerts trigger" },
  ],
  backgroundJobs: [
    { id: "mention-scraper", name: "Mention Scraper", description: "Scrape mentions from all sources", schedule: "*/5 * * * *", enabled: true },
    { id: "sentiment-analyzer", name: "Sentiment Analyzer", description: "Analyze sentiment of new mentions", schedule: "*/10 * * * *", enabled: true },
  ],
  events: [
    { id: "mention.detected", name: "Mention Detected", description: "Fired when new mention detected" },
    { id: "crisis.triggered", name: "Crisis Triggered", description: "Fired when crisis threshold reached" },
    { id: "sentiment.changed", name: "Sentiment Changed", description: "Fired when sentiment shifts significantly" },
  ],
  auditLogs: [
    { action: "brand.settings.updated", description: "Brand monitoring settings updated", logData: true },
    { action: "crisis.acknowledged", description: "Crisis alert acknowledged", logData: true },
  ],
  featureFlags: [
    { id: "real-time-mentions", name: "Real-time Mentions", description: "Live mention tracking", defaultValue: true, canOverride: true },
  ],
  metadata: { order: 4 },
});