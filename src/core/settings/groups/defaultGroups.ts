/**
 * Calixo Platform - Default Settings Groups
 *
 * The 16 canonical settings groups. This is the one place that knows the
 * full taxonomy — the SettingsGroupRegistry itself stays generic.
 */

import { settingsGroupRegistry, SettingsGroupRegistry } from "./SettingsGroupRegistry";
import type { SettingsGroupDefinition } from "../types";

const DEFAULT_GROUPS: SettingsGroupDefinition[] = [
  { id: "platform", label: "Platform", description: "Core platform-wide configuration", order: 1 },
  { id: "workspace", label: "Workspace", description: "Workspace-level preferences", order: 2 },
  { id: "user", label: "User", description: "Personal user preferences", order: 3 },
  { id: "security", label: "Security", description: "Authentication, sessions, and access controls", order: 4 },
  { id: "ai", label: "AI", description: "AI model, prompt, and automation configuration", order: 5 },
  { id: "brand", label: "Brand", description: "Brand kit and guideline defaults", order: 6 },
  { id: "content", label: "Content", description: "Content generation and editorial defaults", order: 7 },
  { id: "reports", label: "Reports", description: "Reporting and analytics preferences", order: 8 },
  { id: "workflow", label: "Workflow", description: "Approval and review workflow defaults", order: 9 },
  { id: "media", label: "Media", description: "Media generation and asset defaults", order: 10 },
  { id: "integrations", label: "Integrations", description: "Connected third-party services", order: 11 },
  { id: "billing", label: "Billing", description: "Plan, invoicing, and payment preferences", order: 12 },
  { id: "notifications", label: "Notifications", description: "Alert and delivery preferences", order: 13 },
  { id: "developer", label: "Developer", description: "API keys, webhooks, and developer tools", order: 14 },
  { id: "appearance", label: "Appearance", description: "Theme and display preferences", order: 15 },
  { id: "advanced", label: "Advanced", description: "Experimental and advanced configuration", order: 16 },
];

export function registerDefaultGroups(registry: SettingsGroupRegistry = settingsGroupRegistry): void {
  registry.registerMany(DEFAULT_GROUPS);
}
