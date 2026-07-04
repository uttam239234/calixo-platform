import { PenSquare } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const contentManifest: ModuleManifest = defineModule({
  id: "content",
  name: "Content Studio",
  version: "2.0.0",
  description: "AI-powered content creation, calendar planning, and asset management.",
  category: "content",
  icon: PenSquare,
  route: "/dashboard/content",
  subscriptionTier: "professional",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "content",
          title: "Content Studio",
          href: "/dashboard/content",
          icon: PenSquare,
          order: 5,
        },
      ],
    },
  ],
  permissions: [
    { name: "content.view", description: "View content studio", action: "view", resource: "content" },
    { name: "content.create", description: "Create content", action: "create", resource: "content" },
    { name: "content.manage", description: "Manage content assets", action: "manage", resource: "content" },
    { name: "content.export", description: "Export content", action: "export", resource: "content" },
  ],
  reports: [
    { id: "content-calendar", name: "Content Calendar", description: "Scheduled content overview", format: "PDF", type: "manual" },
    { id: "content-performance", name: "Content Performance", description: "Engagement and reach metrics", format: "PDF", type: "scheduled" },
  ],
  notifications: [
    { id: "content-approval", name: "Content Approval", description: "Content ready for review", channels: ["inApp", "email"], defaultEnabled: true },
    { id: "content-published", name: "Content Published", description: "Confirmation when content goes live", channels: ["inApp"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["content-generator", "headline-optimizer", "seo-suggestions"] },
  settings: [
    { id: "content-preferences", title: "Content Preferences", description: "Configure content defaults" },
    { id: "content-approval-flow", title: "Approval Workflow", description: "Configure content approval process" },
  ],
  backgroundJobs: [
    { id: "content-scheduler", name: "Content Scheduler", description: "Publish scheduled content", schedule: "* * * * *", enabled: true },
  ],
  featureFlags: [
    { id: "ai-content-assistant", name: "AI Content Assistant", description: "AI-powered content generation", defaultValue: true, canOverride: true },
  ],
  metadata: { order: 5 },
});