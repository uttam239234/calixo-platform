/** Calixo Platform - Settings Platform API. The sanctioned way another module reads settings metadata — wraps `SettingsGroupRegistry`/`SettingsRegistry` instead of exposing them for direct cross-module reads. */
import { settingsGroupRegistry } from "../groups/SettingsGroupRegistry";
import { settingsRegistry } from "../registry/SettingsRegistry";
import type { SettingsSummary } from "@/core/platform/contracts";

export class SettingsPlatformAPI {
  listSettingsSummaries(): SettingsSummary[] {
    return settingsGroupRegistry.list().map(group => ({
      groupId: group.id,
      groupLabel: group.label,
      settingCount: settingsRegistry.list({ group: group.id }).length,
    }));
  }
}

export const settingsPlatformAPI = new SettingsPlatformAPI();
