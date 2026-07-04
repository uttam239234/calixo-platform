import { Bot } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const aiCopilotManifest: ModuleManifest = defineModule({
  id: "ai-copilot",
  name: "AI Copilot",
  version: "2.0.0",
  description: "AI-powered assistant for marketing strategy, content generation, and data analysis.",
  category: "ai",
  icon: Bot,
  route: "/dashboard/ai",
  subscriptionTier: "enterprise",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "ai-copilot",
          title: "AI Copilot",
          href: "/dashboard/ai",
          icon: Bot,
          order: 6,
          badge: "New",
        },
      ],
    },
  ],
  permissions: [
    { name: "ai-copilot.view", description: "View AI Copilot", action: "view", resource: "ai-copilot" },
    { name: "ai-copilot.use", description: "Use AI Copilot features", action: "use", resource: "ai-copilot" },
    { name: "ai-copilot.manage", description: "Manage AI Copilot settings", action: "manage", resource: "ai-copilot" },
  ],
  reports: [
    { id: "ai-usage", name: "AI Usage Report", description: "AI feature usage analytics", format: "PDF", type: "scheduled" },
    { id: "ai-suggestions", name: "AI Suggestions Log", description: "Track AI-generated recommendations", format: "CSV", type: "manual" },
  ],
  notifications: [
    { id: "ai-insight-ready", name: "AI Insight Ready", description: "New AI insight available", channels: ["inApp"], defaultEnabled: true },
    { id: "ai-report-generated", name: "AI Report Generated", description: "Automated report completed", channels: ["inApp", "email"], defaultEnabled: true },
  ],
  ai: { enabled: true, models: ["calixo-default", "gpt-4o", "claude-3-5"], prompts: ["marketing-strategy", "content-brief", "data-insight", "campaign-optimizer"] },
  settings: [
    { id: "ai-copilot-preferences", title: "AI Preferences", description: "Configure AI assistant behavior" },
    { id: "ai-model-selection", title: "Model Selection", description: "Choose default AI models" },
  ],
  featureFlags: [
    { id: "ai-copilot-beta", name: "AI Copilot Beta Features", description: "Enable experimental AI features", defaultValue: false, canOverride: true },
  ],
  metadata: { order: 6 },
});