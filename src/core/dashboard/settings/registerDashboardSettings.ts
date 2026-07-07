/**
 * Calixo Platform - Dashboard Personalization Settings
 *
 * Registers Dashboard's own settings into the real Settings platform
 * (SettingsEngine/SettingsRegistry) rather than inventing a separate
 * preferences store. `dashboard.favouriteWidgets` / `dashboard.pinnedWidgets`
 * / `dashboard.recentlyViewedLayouts` use the "json" setting type to hold
 * arrays — the same generic key/value mechanism every other per-user
 * preference in this platform already uses.
 */

import { generateId } from "@/shared/utils/string";
import { settingsRegistry, SettingsRegistry } from "@/core/settings/registry/SettingsRegistry";
import type { SettingDefinition } from "@/core/settings/types";

const LAYOUT_OPTIONS = [
  { value: "layout-personal", label: "Personal" },
  { value: "layout-executive", label: "Executive" },
  { value: "layout-marketing", label: "Marketing" },
  { value: "layout-performance", label: "Performance" },
  { value: "layout-social", label: "Social" },
  { value: "layout-content", label: "Content" },
  { value: "layout-brand", label: "Brand" },
  { value: "layout-team", label: "Team" },
  { value: "layout-workspace", label: "Workspace" },
];

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

const DASHBOARD_SETTINGS: SettingDefinition[] = [
  setting({ key: "dashboard.landingLayoutId", label: "Landing Dashboard", description: "Which dashboard layout opens by default", module: "core", category: "Personalization", group: "user", type: "select", defaultValue: "layout-personal", currentValue: "layout-personal", options: LAYOUT_OPTIONS }),
  setting({ key: "dashboard.refreshIntervalSec", label: "Auto-Refresh Interval (s)", description: "How often the Dashboard refreshes its data automatically, 0 to disable", module: "core", category: "Personalization", group: "user", type: "number", defaultValue: 0, currentValue: 0, validation: [{ type: "range", min: 0, max: 3600 }] }),
  setting({ key: "dashboard.favouriteWidgets", label: "Favourite Widgets", description: "Widget keys marked as favourites", module: "core", category: "Personalization", group: "user", type: "json", defaultValue: [], currentValue: [], hidden: true }),
  setting({ key: "dashboard.recentlyViewedLayouts", label: "Recently Viewed Dashboards", description: "Layout ids recently switched to", module: "core", category: "Personalization", group: "user", type: "json", defaultValue: [], currentValue: [], hidden: true }),
  setting({ key: "dashboard.favouriteLayouts", label: "Favourite Dashboards", description: "Layout ids marked as favourites", module: "core", category: "Personalization", group: "user", type: "json", defaultValue: [], currentValue: [], hidden: true }),
];

export function registerDashboardSettings(registry: SettingsRegistry = settingsRegistry): void {
  registry.registerMany(DASHBOARD_SETTINGS);
}
