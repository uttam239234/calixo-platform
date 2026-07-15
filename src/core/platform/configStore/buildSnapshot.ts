/**
 * Calixo Platform - Platform Configuration Store: Snapshot Builder
 *
 * Isomorphic (no `"server-only"`, no `fs`) — reads the CURRENT live state of
 * every persisted registry via its own real `.list()`/`.get()` method,
 * never their internals. Called from the server, right after a mutation, to
 * know what to write to disk; safe to call from a browser tab too (reads
 * whatever that realm's own registry currently holds).
 */
import { subscriptionRegistry } from "@/core/platform/subscription";
import { pricingPlatformAPI, creditPackPlatformAPI, promotionPlatformAPI, platformGlobalSettingsPlatformAPI } from "@/core/platform/commercial";
import { featureFlagRegistry } from "@/core/platform/featureFlags";
import type { PlatformConfigSnapshot } from "./types";

export function buildPlatformConfigSnapshot(): PlatformConfigSnapshot {
  return {
    subscriptionTiers: subscriptionRegistry.list(),
    pricingRules: pricingPlatformAPI.list(),
    creditPacks: creditPackPlatformAPI.list(),
    promotions: promotionPlatformAPI.list(),
    experimentFlags: featureFlagRegistry.list().filter(f => f.category === "experimental"),
    globalSettings: platformGlobalSettingsPlatformAPI.get(),
  };
}
