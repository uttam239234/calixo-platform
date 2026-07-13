/**
 * Calixo Platform - Global Commercial Settings Platform API
 */
import { platformGlobalSettingsEngine } from "./PlatformGlobalSettingsEngine";
import type { PlatformGlobalSettings } from "./types";

export class PlatformGlobalSettingsPlatformAPI {
  get(): PlatformGlobalSettings {
    return platformGlobalSettingsEngine.get();
  }

  update(patch: Partial<PlatformGlobalSettings>): PlatformGlobalSettings {
    return platformGlobalSettingsEngine.update(patch);
  }
}

export const platformGlobalSettingsPlatformAPI = new PlatformGlobalSettingsPlatformAPI();
