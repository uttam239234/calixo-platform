import { Share2 } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const socialMediaManifest: ModuleManifest = defineModule({
  id: "social",
  name: "Social Media",
  version: "2.0.0",
  description: "Unified social media management across all platforms.",
  category: "social",
  icon: Share2,
  route: "/dashboard/social",
  subscriptionTier: "professional",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "social",
          title: "Social Media",
          href: "/dashboard/social",
          icon: Share2,
          order: 3,
        },
      ],
    },
  ],
  permissions: [
    { name: "social.view", description: "View social media dashboard", action: "view", resource: "social" },
    { name: "social.create", description: "Create posts", action: "create", resource: "social" },
    { name: "social.manage", description: "Manage social accounts", action: "manage", resource: "social" },
    { name: "social.export", description: "Export social data", action: "export", resource: "social" },
  ],
  reports: [
    { id: "social-engagement", name: "Engagement Report", description: "Post engagement analytics", format: "PDF", type: "manual" },
    { id: "follower-growth", name: "Follower Growth", description: "Audience growth trends", format: "CSV", type: "manual" },
  ],
  notifications: [
    { id: "publish-confirm", name: "Post Published", description: "Confirmation after publishing", channels: ["inApp"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default"], prompts: ["content-optimizer", "best-time"] },
  settings: [{ id: "social-config", title: "Social Settings", description: "Configure social preferences" }],
  integrations: [
    { id: "facebook", name: "Facebook", description: "Connect Facebook account", provider: "meta", authType: "oauth2", required: false },
    { id: "instagram", name: "Instagram", description: "Connect Instagram account", provider: "meta", authType: "oauth2", required: false },
    { id: "twitter", name: "Twitter/X", description: "Connect Twitter account", provider: "twitter", authType: "oauth2", required: false },
  ],
  backgroundJobs: [{ id: "post-scheduler", name: "Post Scheduler", description: "Publish scheduled posts", schedule: "* * * * *", enabled: true }],
  featureFlags: [{ id: "ai-content-generator", name: "AI Content Generator", description: "Generate posts with AI", defaultValue: true, canOverride: true }],
  metadata: { order: 3 },
});