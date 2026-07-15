/**
 * Calixo Platform - Platform Configuration Store: Server-Side Hydration
 *
 * `import "server-only"` — this file must only ever be imported from files
 * that are THEMSELVES exclusively server-reachable (already `import
 * "server-only"`, a `"use server"` action, or a Route Handler): a real
 * `next build` (Turbopack) found that a shared, dynamically-imported
 * dispatcher is not enough to satisfy the `server-only` build check — it
 * flags a module the instant it's reachable from ANY import graph that also
 * includes a `"use client"` file, dynamic import or not. Two direct,
 * realm-specific call sites (this file for server contexts, `clientHydrate.ts`
 * for browser contexts) is the pattern that actually builds clean.
 *
 * Called from: `resolveIdentity.server.ts` (after `resolveCalixoIdentity()`
 * has run, guaranteeing default tiers/flags/etc. are already seeded before
 * persisted overrides apply on top) and `configSnapshot.actions.ts` (the
 * Server Action a browser tab calls, so a cold server process answers with
 * disk-persisted truth even on its very first request).
 */
import "server-only";
import { readTable } from "./PlatformConfigFileStore";
import { applyPlatformConfigSnapshot } from "./applySnapshot";
import type { PlatformConfigSnapshot } from "./types";

let hydrated = false;

export function hydrateFromDisk(): void {
  if (hydrated) return;
  hydrated = true;
  const snapshot: Partial<PlatformConfigSnapshot> = {
    subscriptionTiers: readTable("platform_subscription_plans"),
    pricingRules: readTable("platform_pricing_rules"),
    creditPacks: readTable("platform_credit_packs"),
    promotions: readTable("platform_promotions"),
    experimentFlags: readTable("platform_feature_flags"),
    globalSettings: readTable("platform_global_settings"),
  };
  applyPlatformConfigSnapshot(snapshot);
}
