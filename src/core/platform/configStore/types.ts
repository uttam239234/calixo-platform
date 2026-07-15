/**
 * Calixo Platform - Platform Configuration Store: Types
 *
 * Investigation (Round 20): every Internal Plan Management Console section
 * writes to a real engine, but no engine's state ever reached disk — a
 * browser refresh or server restart silently reverted every change back to
 * hardcoded seed defaults. This package is the fix: a real, file-backed
 * mirror of the handful of registries those 8 sections actually mutate.
 *
 * One JSON "table" per registry, named to match the brief's own examples
 * (`platform_subscription_plans`, ...). Deliberately NOT one table per URL
 * section — Plans/Limits/Features all mutate the same `subscriptionRegistry`,
 * and Plans/Pricing both mutate `pricingPlatformAPI`, so the table boundary
 * follows the real underlying engine, not the page.
 */
import type { SubscriptionTierDefinition } from "@/core/platform/subscription";
import type { PricingRuleDefinition, CreditPackDefinition, PromotionDefinition, PlatformGlobalSettings } from "@/core/platform/commercial";
import type { FeatureFlagDefinition } from "@/core/platform/featureFlags";

export type PlatformConfigTable =
  | "platform_subscription_plans"
  | "platform_pricing_rules"
  | "platform_credit_packs"
  | "platform_promotions"
  | "platform_feature_flags"
  | "platform_global_settings"
  | "platform_secrets_metadata"
  | "platform_secrets_vault";

/** The full, current state of every persisted config registry — what gets written to disk and what a freshly-booted realm (server process or browser tab) hydrates back into its registries. */
export interface PlatformConfigSnapshot {
  subscriptionTiers: SubscriptionTierDefinition[];
  pricingRules: PricingRuleDefinition[];
  creditPacks: CreditPackDefinition[];
  promotions: PromotionDefinition[];
  /** Only `category === "experimental"` flags carrying a `rolloutPercent` override — the Experiments section's own scope. */
  experimentFlags: FeatureFlagDefinition[];
  globalSettings: PlatformGlobalSettings;
}
