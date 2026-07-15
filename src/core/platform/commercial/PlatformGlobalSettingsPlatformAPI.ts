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

  /** Raw restore for hydration — see `PlatformGlobalSettingsEngine.restore()`. */
  restore(settings: PlatformGlobalSettings): void {
    platformGlobalSettingsEngine.restore(settings);
  }
}

export const platformGlobalSettingsPlatformAPI = new PlatformGlobalSettingsPlatformAPI();
