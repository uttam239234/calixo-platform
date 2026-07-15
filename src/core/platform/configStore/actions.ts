"use server";

/**
 * Calixo Platform - Platform Configuration Store: Write Actions
 *
 * Every Plan Management Console section's save handler calls one of these
 * (alongside its existing client-side registry write + `commitPlanChange()`
 * versioning/undo, both unchanged) — the real disk-persistence half of the
 * fix. Grouped by underlying engine, not by URL section: Plans/Limits/
 * Features all share `saveSubscriptionTierAction`; Plans/Pricing share
 * `savePricingRuleAction`.
 */
import { subscriptionRegistry } from "@/core/platform/subscription";
import type { SubscriptionTierDefinition } from "@/core/platform/subscription";
import { pricingPlatformAPI, creditPackPlatformAPI, promotionPlatformAPI, platformGlobalSettingsPlatformAPI } from "@/core/platform/commercial";
import type { PricingRuleDefinition, CreditPackDefinition, PromotionDefinition, PlatformGlobalSettings } from "@/core/platform/commercial";
import { featureFlagRegistry } from "@/core/platform/featureFlags";
import type { FeatureFlagDefinition } from "@/core/platform/featureFlags";
import { runPlatformConfigMutation, type PlatformConfigMutationResult } from "./mutate.server";

export async function saveSubscriptionTierAction(definition: SubscriptionTierDefinition, description: string): Promise<PlatformConfigMutationResult<SubscriptionTierDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_subscription_plans",
    entityType: "subscription-tier",
    entityId: definition.tier,
    description,
    mutate: () => {
      subscriptionRegistry.register(definition);
      return subscriptionRegistry.list();
    },
  });
}

export async function savePricingRuleAction(rule: PricingRuleDefinition, description: string): Promise<PlatformConfigMutationResult<PricingRuleDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_pricing_rules",
    entityType: "pricing-rule",
    entityId: rule.id,
    description,
    mutate: () => {
      pricingPlatformAPI.registerRule(rule);
      return pricingPlatformAPI.list();
    },
  });
}

export async function saveCreditPackAction(pack: CreditPackDefinition, description: string): Promise<PlatformConfigMutationResult<CreditPackDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_credit_packs",
    entityType: "credit-pack",
    entityId: pack.id,
    description,
    mutate: () => {
      creditPackPlatformAPI.register(pack);
      return creditPackPlatformAPI.list();
    },
  });
}

export async function setCreditPackActiveAction(id: string, isActive: boolean, description: string): Promise<PlatformConfigMutationResult<CreditPackDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_credit_packs",
    entityType: "credit-pack-active",
    entityId: id,
    description,
    mutate: () => {
      creditPackPlatformAPI.setActive(id, isActive);
      return creditPackPlatformAPI.list();
    },
  });
}

export async function reorderCreditPackAction(id: string, direction: "up" | "down"): Promise<PlatformConfigMutationResult<CreditPackDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_credit_packs",
    entityType: "credit-pack-reorder",
    entityId: id,
    description: `Reordered credit pack ${id} (${direction})`,
    mutate: () => creditPackPlatformAPI.reorder(id, direction),
  });
}

export async function createPromotionAction(input: Omit<PromotionDefinition, "id" | "redemptionCount">, description: string): Promise<PlatformConfigMutationResult<PromotionDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_promotions",
    entityType: "promotion",
    entityId: input.code,
    description,
    mutate: () => {
      promotionPlatformAPI.create(input);
      return promotionPlatformAPI.list();
    },
  });
}

export async function setPromotionActiveAction(code: string, isActive: boolean, description: string): Promise<PlatformConfigMutationResult<PromotionDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_promotions",
    entityType: "promotion-active",
    entityId: code,
    description,
    mutate: () => {
      promotionPlatformAPI.setActive(code, isActive);
      return promotionPlatformAPI.list();
    },
  });
}

export async function saveExperimentRolloutAction(flag: FeatureFlagDefinition, rolloutPercent: number, description: string): Promise<PlatformConfigMutationResult<FeatureFlagDefinition[]>> {
  return runPlatformConfigMutation({
    table: "platform_feature_flags",
    entityType: "experiment-flag",
    entityId: flag.id,
    description,
    mutate: () => {
      featureFlagRegistry.register({ ...flag, rolloutPercent });
      return featureFlagRegistry.list().filter(f => f.category === "experimental");
    },
  });
}

export async function saveGlobalSettingsAction(patch: Partial<PlatformGlobalSettings>, description: string): Promise<PlatformConfigMutationResult<PlatformGlobalSettings>> {
  return runPlatformConfigMutation({
    table: "platform_global_settings",
    entityType: "platform-global-settings",
    entityId: "singleton",
    description,
    mutate: () => platformGlobalSettingsPlatformAPI.update(patch),
  });
}
