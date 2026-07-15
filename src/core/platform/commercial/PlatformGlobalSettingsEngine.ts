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

  /**
   * Raw restore — sets `this.settings` directly, WITHOUT the `trialAiCredits`
   * write-through `update()` triggers. Hydration replays each persisted
   * table independently (`platform_global_settings` and
   * `platform_subscription_plans` are two separate files, saved at
   * different times by two different sections) — re-running the
   * write-through here would let whichever table happens to apply last
   * silently clobber the other's more recent `trialAiCredits` value. The
   * write-through already happened for real at the moment this was
   * originally saved; replaying it a second time during hydration is what
   * caused that bug (found and fixed during the Round 20 persistence
   * verification pass).
   */
  restore(settings: PlatformGlobalSettings): void {
    this.settings = { ...settings };
  }
}

export const platformGlobalSettingsEngine = new PlatformGlobalSettingsEngine();
