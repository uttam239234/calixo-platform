/**
 * Calixo Platform - Settings Module AI Skills
 *
 * Registers the Settings module's capabilities into the existing Copilot
 * Skill/Tool registries — no Copilot code is modified. This is metadata
 * only: no handler is wired and no LLM execution happens here, exactly
 * like the Copilot foundation's own default tools.
 *
 * SkillCategory has no dedicated "settings" value, so these use the
 * existing "platform" category rather than expanding Copilot's enum.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool } from "@/core/copilot";

const SETTINGS_SKILLS: Skill[] = [
  {
    id: "explain-setting",
    name: "Explain Setting",
    description: "Summarize what a setting does, its default, and current value",
    category: "platform",
    engineRef: "SettingsRegistry",
    toolIds: ["explain-setting"],
    triggers: ["explain setting", "what does this setting do", "describe setting"],
    enabled: true,
  },
  {
    id: "search-settings",
    name: "Search Settings",
    description: "Find settings by keyword, module, category, or tag",
    category: "platform",
    engineRef: "SettingsSearchEngine",
    toolIds: ["search-settings"],
    triggers: ["search settings", "find setting", "where is the setting for"],
    enabled: true,
  },
  {
    id: "reset-setting",
    name: "Reset Setting",
    description: "Reset a setting back to its default value",
    category: "platform",
    engineRef: "SettingsEngine",
    toolIds: ["reset-setting"],
    triggers: ["reset setting", "restore default", "undo setting change"],
    enabled: true,
  },
  {
    id: "change-setting",
    name: "Change Setting",
    description: "Update a setting to a new, validated value",
    category: "platform",
    engineRef: "SettingsEngine",
    toolIds: ["change-setting"],
    triggers: ["change setting", "update setting", "set setting to", "enable setting", "disable setting"],
    enabled: true,
  },
];

const SETTINGS_TOOLS: PlatformTool[] = [
  {
    id: "explain-setting",
    name: "Explain Setting",
    description: "Summarize what a setting does, its default, and current value",
    category: "platform",
    provider: "engine",
    providerRef: "SettingsRegistry",
    capabilities: [{ name: "setting-explanation" }],
    isActive: true,
  },
  {
    id: "search-settings",
    name: "Search Settings",
    description: "Find settings by keyword, module, category, or tag",
    category: "platform",
    provider: "engine",
    providerRef: "SettingsSearchEngine",
    capabilities: [{ name: "setting-search" }],
    isActive: true,
  },
  {
    id: "reset-setting",
    name: "Reset Setting",
    description: "Reset a setting back to its default value",
    category: "platform",
    provider: "engine",
    providerRef: "SettingsEngine",
    capabilities: [{ name: "setting-reset" }],
    isActive: true,
  },
  {
    id: "change-setting",
    name: "Change Setting",
    description: "Update a setting to a new, validated value",
    category: "platform",
    provider: "engine",
    providerRef: "SettingsEngine",
    capabilities: [{ name: "setting-update" }],
    isActive: true,
  },
];

let registered = false;

/** Safe to call more than once. Registers metadata only — no handlers, no LLM execution. */
export function registerSettingsSkills(): void {
  if (registered) return;
  for (const tool of SETTINGS_TOOLS) copilotToolRegistry.register(tool);
  for (const skill of SETTINGS_SKILLS) skillRegistry.register(skill);
  registered = true;
}
