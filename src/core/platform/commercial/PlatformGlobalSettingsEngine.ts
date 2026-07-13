/**
 * Calixo Platform - Global Commercial Settings
 *
 * The Internal Plan Management Console's Section 8 ("Global Settings").
 * A single, platform-wide settings object — no per-organization scope,
 * unlike every other engine in this package. `trialAiCredits` is not a
 * duplicate number: updating it writes through to the real `trial` tier's
 * `limits.aiCredits` via `subscriptionRegistry`, so this stays the one
 * source of truth Section 1/4 also edit.
 */
import { subscriptionRegistry } from "@/core/platform/subscription";
import type { PlatformGlobalSettings } from "./types";

const DEFAULT_SETTINGS: PlatformGlobalSettings = {
  freeTrialLengthDays: 14,
  trialAiCredits: 500,
  defaultCurrency: "USD",
  taxPercent: 0,
  enterpriseContactEmail: "sales@calixo.io",
};

export class PlatformGlobalSettingsEngine {
  private settings: PlatformGlobalSettings = { ...DEFAULT_SETTINGS };

  get(): PlatformGlobalSettings {
    return { ...this.settings };
  }

  update(patch: Partial<PlatformGlobalSettings>): PlatformGlobalSettings {
    this.settings = { ...this.settings, ...patch };

    if (patch.trialAiCredits !== undefined) {
      const trialTier = subscriptionRegistry.get("trial");
      if (trialTier) {
        subscriptionRegistry.register({ ...trialTier, limits: { ...trialTier.limits, aiCredits: patch.trialAiCredits } });
      }
    }

    return this.get();
  }
}

export const platformGlobalSettingsEngine = new PlatformGlobalSettingsEngine();
