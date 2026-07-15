/**
 * Calixo Platform - Platform Configuration Store: Snapshot Application
 *
 * Isomorphic — replays a persisted snapshot back into the live registries
 * of WHICHEVER realm calls this (server process at boot, or a browser tab
 * at mount), always through each registry's own real, validated setter —
 * never by reaching into a `Map` directly. `PromotionEngine.restore()` and
 * `PlatformGlobalSettingsPlatformAPI.restore()` are new (added alongside
 * this file): `.create()` mints a fresh id and resets `redemptionCount`,
 * wrong for replaying an existing, already-redeemed promotion; `.update()`'s
 * `trialAiCredits` write-through onto `subscriptionRegistry` double-applies
 * a side effect that already happened for real at save time — replaying it
 * during hydration let whichever of the two independently-saved tables
 * applies last silently clobber the other's `trialAiCredits` (found and
 * fixed during the Round 20 persistence verification pass, via a live
 * server-restart test, not by inspection).
 */
import { subscriptionRegistry, SUBSCRIPTION_TIERS } from "@/core/platform/subscription";
import { pricingPlatformAPI, creditPackPlatformAPI, promotionEngine, platformGlobalSettingsPlatformAPI } from "@/core/platform/commercial";
import { featureFlagRegistry } from "@/core/platform/featureFlags";
import type { PlatformConfigSnapshot } from "./types";

/**
 * Round 21 found this the hard way: disk state written before the tier
 * catalog shrank from 8 to 4 (`free`/`education`/`agency`/`custom` removed)
 * still had rows for the removed tiers, and — because `readTable()` just
 * `JSON.parse`s with no runtime shape validation — replaying it verbatim
 * would silently resurrect a tier that was supposed to be deleted entirely.
 * Filtering to the current, real `SUBSCRIPTION_TIERS` on every hydration is
 * what actually makes "deleted entirely" durable across a stale snapshot,
 * not just true the moment the code changed.
 */
function currentTiersOnly<T extends { tier: string }>(rows: T[]): T[] {
  return rows.filter(row => (SUBSCRIPTION_TIERS as string[]).includes(row.tier));
}

export function applyPlatformConfigSnapshot(snapshot: Partial<PlatformConfigSnapshot>): void {
  if (snapshot.subscriptionTiers?.length) subscriptionRegistry.registerAll(currentTiersOnly(snapshot.subscriptionTiers));
  if (snapshot.pricingRules?.length) for (const rule of currentTiersOnly(snapshot.pricingRules)) pricingPlatformAPI.registerRule(rule);
  if (snapshot.creditPacks?.length) for (const pack of snapshot.creditPacks) creditPackPlatformAPI.register(pack);
  if (snapshot.promotions?.length) for (const promotion of snapshot.promotions) promotionEngine.restore(promotion);
  if (snapshot.experimentFlags?.length) for (const flag of snapshot.experimentFlags) featureFlagRegistry.register(flag);
  if (snapshot.globalSettings) platformGlobalSettingsPlatformAPI.restore(snapshot.globalSettings);
}
