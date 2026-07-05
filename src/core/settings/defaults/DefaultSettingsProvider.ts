/**
 * Calixo Platform - Default Settings Provider
 *
 * A small, real, foundational set of settings across the areas every
 * enterprise deployment needs on day one: Platform, Workspace, Theme, AI,
 * Brand, Content, Notification, and Developer defaults. Real modules are
 * expected to contribute far richer settings of their own via
 * registerSettings() — this is just enough to make the platform usable
 * immediately.
 */

import { generateId } from "@/shared/utils/string";
import { settingsRegistry, SettingsRegistry } from "../registry/SettingsRegistry";
import type { SettingDefinition } from "../types";

type SettingDefaultableField = "required" | "readonly" | "hidden" | "tags" | "permissions" | "validation" | "restartRequired" | "experimental";

function setting(partial: Omit<SettingDefinition, "id" | SettingDefaultableField> & Partial<Pick<SettingDefinition, SettingDefaultableField>>): SettingDefinition {
  return {
    id: generateId(16),
    required: false,
    readonly: false,
    hidden: false,
    tags: [],
    permissions: [],
    validation: [],
    restartRequired: false,
    experimental: false,
    ...partial,
  };
}

const DEFAULT_SETTINGS: SettingDefinition[] = [
  // Platform
  setting({ key: "platform.name", label: "Platform Name", description: "The display name for this deployment", module: "core", category: "General", group: "platform", type: "text", defaultValue: "Calixo", currentValue: "Calixo" }),
  setting({ key: "platform.timezone", label: "Default Timezone", description: "Default timezone for new workspaces", module: "core", category: "General", group: "platform", type: "select", defaultValue: "UTC", currentValue: "UTC", options: [{ value: "UTC", label: "UTC" }, { value: "America/New_York", label: "Eastern Time" }] }),

  // Workspace
  setting({ key: "workspace.defaultLanguage", label: "Default Language", description: "Default language for new workspaces", module: "core", category: "Localization", group: "workspace", type: "select", defaultValue: "en", currentValue: "en", options: [{ value: "en", label: "English" }, { value: "es", label: "Spanish" }] }),
  setting({ key: "workspace.storageLimitGb", label: "Storage Limit (GB)", description: "Maximum storage allotted per workspace", module: "core", category: "Limits", group: "workspace", type: "number", defaultValue: 15, currentValue: 15 }),

  // Theme / Appearance
  setting({ key: "theme.mode", label: "Theme Mode", description: "Light, dark, or system-based theme", module: "core", category: "Appearance", group: "appearance", type: "select", defaultValue: "system", currentValue: "system", options: [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }] }),
  setting({ key: "theme.accentColor", label: "Accent Color", description: "Primary accent color used across the UI", module: "core", category: "Appearance", group: "appearance", type: "color", defaultValue: "#4F46E5", currentValue: "#4F46E5" }),

  // AI
  setting({ key: "ai.defaultModel", label: "Default AI Model", description: "Model used when a module doesn't specify one", module: "ai", category: "Models", group: "ai", type: "select", defaultValue: "gpt-4o-mini", currentValue: "gpt-4o-mini", options: [{ value: "gpt-4o-mini", label: "GPT-4o mini" }, { value: "gpt-4o", label: "GPT-4o" }] }),
  setting({ key: "ai.aiSummaryEnabled", label: "AI Summaries Enabled", description: "Allow modules to generate AI summaries by default", module: "ai", category: "Automation", group: "ai", type: "boolean", defaultValue: true, currentValue: true }),

  // Brand
  setting({ key: "brand.defaultKitId", label: "Default Brand Kit", description: "Brand kit applied when none is specified", module: "brand", category: "Defaults", group: "brand", type: "text", defaultValue: "", currentValue: "" }),
  setting({ key: "brand.strictGuidelines", label: "Enforce Brand Guidelines", description: "Block content that violates brand guidelines", module: "brand", category: "Compliance", group: "brand", type: "switch", defaultValue: false, currentValue: false }),

  // Content
  setting({ key: "content.defaultTone", label: "Default Content Tone", description: "Default tone applied to generated content", module: "content", category: "Generation", group: "content", type: "select", defaultValue: "professional", currentValue: "professional", options: [{ value: "professional", label: "Professional" }, { value: "casual", label: "Casual" }] }),
  setting({ key: "content.autosaveIntervalSec", label: "Autosave Interval (s)", description: "How often the content editor autosaves drafts", module: "content", category: "Editor", group: "content", type: "number", defaultValue: 30, currentValue: 30 }),

  // Notifications
  setting({ key: "notifications.emailEnabled", label: "Email Notifications", description: "Send notifications via email by default", module: "core", category: "Delivery", group: "notifications", type: "boolean", defaultValue: true, currentValue: true }),
  setting({ key: "notifications.digestFrequency", label: "Digest Frequency", description: "How often to send a summary digest", module: "core", category: "Delivery", group: "notifications", type: "select", defaultValue: "daily", currentValue: "daily", options: [{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "off", label: "Off" }] }),

  // Developer
  setting({ key: "developer.apiRateLimitPerMin", label: "API Rate Limit (per minute)", description: "Default API rate limit for new API keys", module: "developer", category: "API", group: "developer", type: "number", defaultValue: 120, currentValue: 120 }),
  setting({ key: "developer.debugMode", label: "Debug Mode", description: "Enables verbose logging for troubleshooting", module: "developer", category: "Diagnostics", group: "developer", type: "switch", defaultValue: false, currentValue: false, experimental: true }),
];

export function registerDefaultSettings(registry: SettingsRegistry = settingsRegistry): void {
  registry.registerMany(DEFAULT_SETTINGS);
}
