"use client";

/**
 * Internal Plan Management Console — Section 1: Subscription Plans.
 *
 * Reads/writes the real `subscriptionRegistry` (tier limits/`isActive`) and
 * `pricingPlatformAPI` (flat monthly/annual price) — the exact same
 * registries Billing & Plans' Current Plan/Upgrade Center already read, so
 * an edit here is visible there immediately, no separate sync step.
 *
 * Shows all 8 real tiers, not just the brief's 4 self-serve ones: `Duplicate`
 * needs a destination slot, and `SubscriptionTier` is a closed 8-value union
 * with no way to create an arbitrary new plan id, so the other 4 real slots
 * (free/education/agency/custom) have to be visible and editable too — never
 * hiding real data the console is supposed to be the control room for.
 */
import { useCallback, useState } from "react";
import { subscriptionRegistry, SUBSCRIPTION_TIERS } from "@/core/platform/subscription";
import type { SubscriptionTier, SubscriptionTierDefinition } from "@/core/platform/subscription";
import { pricingPlatformAPI } from "@/core/platform/commercial";
import type { PricingRuleDefinition } from "@/core/platform/commercial";
import { useInternalRole } from "../internalRole";
import { commitPlanChange, type CommitPlanChangeResult } from "../commitPlanChange";
import { saveSubscriptionTierAction, savePricingRuleAction } from "@/core/platform/configStore/actions";

export interface PlanRow {
  tier: SubscriptionTier;
  definition: SubscriptionTierDefinition;
  pricingRule?: PricingRuleDefinition;
}

function flatRuleFor(tier: SubscriptionTier): PricingRuleDefinition | undefined {
  return pricingPlatformAPI.listForTier(tier).find(r => r.model === "flat" || r.model === "hybrid");
}

export function usePlans() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const plans: PlanRow[] = SUBSCRIPTION_TIERS.map(tier => ({
    tier,
    definition: subscriptionRegistry.get(tier)!,
    pricingRule: flatRuleFor(tier),
  }));

  const updatePrice = useCallback(
    async (tier: SubscriptionTier, monthlyPrice: number, annualPrice: number): Promise<CommitPlanChangeResult> => {
      const rule = flatRuleFor(tier);
      if (!rule) return {};
      const before = { monthlyPrice: rule.monthlyPrice ?? 0, annualPrice: rule.annualPrice ?? 0 };
      const after = { monthlyPrice, annualPrice };
      const description = `Changed ${tier}'s price to $${monthlyPrice}/mo, $${annualPrice}/yr`;
      pricingPlatformAPI.registerRule({ ...rule, monthlyPrice, annualPrice });
      const saveResult = await savePricingRuleAction({ ...rule, monthlyPrice, annualPrice }, description);
      const result = saveResult.ok
        ? await commitPlanChange({
            entityType: "pricing-rule",
            entityId: rule.id,
            before,
            after,
            actor: role,
            description,
            risky: "price_change",
            restore: prev => {
              pricingPlatformAPI.registerRule({ ...rule, monthlyPrice: prev.monthlyPrice, annualPrice: prev.annualPrice });
              void savePricingRuleAction({ ...rule, monthlyPrice: prev.monthlyPrice, annualPrice: prev.annualPrice }, `Undo: ${description}`);
              refresh();
            },
          })
        : { error: saveResult.error };
      refresh();
      return result;
    },
    [role, refresh]
  );

  const updateIncludedCredits = useCallback(
    async (tier: SubscriptionTier, aiCredits: number): Promise<CommitPlanChangeResult> => {
      const definition = subscriptionRegistry.get(tier);
      if (!definition) return {};
      const before = definition.limits.aiCredits;
      const description = `Changed ${tier}'s included AI credits from ${before.toLocaleString()} to ${aiCredits.toLocaleString()}`;
      const nextDefinition = { ...definition, limits: { ...definition.limits, aiCredits } };
      subscriptionRegistry.register(nextDefinition);
      const saveResult = await saveSubscriptionTierAction(nextDefinition, description);
      const risky = aiCredits < before ? "credit_reduction" : undefined;
      const result = saveResult.ok
        ? await commitPlanChange({
            entityType: "subscription-tier-credits",
            entityId: tier,
            before,
            after: aiCredits,
            actor: role,
            description,
            risky,
            restore: risky
              ? prev => {
                  const d = subscriptionRegistry.get(tier)!;
                  const restored = { ...d, limits: { ...d.limits, aiCredits: prev } };
                  subscriptionRegistry.register(restored);
                  void saveSubscriptionTierAction(restored, `Undo: ${description}`);
                  refresh();
                }
              : undefined,
          })
        : { error: saveResult.error };
      refresh();
      return result;
    },
    [role, refresh]
  );

  const setActive = useCallback(
    async (tier: SubscriptionTier, isActive: boolean): Promise<CommitPlanChangeResult> => {
      const definition = subscriptionRegistry.get(tier);
      if (!definition) return {};
      const before = definition.isActive;
      const description = `${isActive ? "Enabled" : "Disabled"} the ${tier} plan`;
      const nextDefinition = { ...definition, isActive };
      subscriptionRegistry.register(nextDefinition);
      const saveResult = await saveSubscriptionTierAction(nextDefinition, description);
      if (!saveResult.ok) {
        refresh();
        return { error: saveResult.error };
      }
      const risky = !isActive ? "plan_deletion" : undefined;
      const result = await commitPlanChange({
        entityType: "subscription-tier-active",
        entityId: tier,
        before,
        after: isActive,
        actor: role,
        description,
        risky,
        restore: risky
          ? prev => {
              const d = subscriptionRegistry.get(tier)!;
              const restored = { ...d, isActive: prev };
              subscriptionRegistry.register(restored);
              void saveSubscriptionTierAction(restored, `Undo: ${description}`);
              refresh();
            }
          : undefined,
      });
      refresh();
      return result;
    },
    [role, refresh]
  );

  const duplicate = useCallback(
    async (sourceTier: SubscriptionTier, destinationTier: SubscriptionTier): Promise<CommitPlanChangeResult> => {
      const source = subscriptionRegistry.get(sourceTier);
      if (!source) return {};
      const description = `Duplicated the ${sourceTier} plan into the ${destinationTier} plan slot`;
      const duplicated = { ...source, tier: destinationTier, label: `${source.label} (Copy)`, isActive: true };
      subscriptionRegistry.register(duplicated);
      const saveResult = await saveSubscriptionTierAction(duplicated, description);
      if (!saveResult.ok) {
        refresh();
        return { error: saveResult.error };
      }
      const sourceRule = flatRuleFor(sourceTier);
      if (sourceRule) {
        const duplicatedRule = { ...sourceRule, id: `price-${destinationTier}`, tier: destinationTier };
        pricingPlatformAPI.registerRule(duplicatedRule);
        const ruleSaveResult = await savePricingRuleAction(duplicatedRule, description);
        if (!ruleSaveResult.ok) {
          refresh();
          return { error: ruleSaveResult.error };
        }
      }
      const result = await commitPlanChange({
        entityType: "subscription-tier",
        entityId: destinationTier,
        before: null,
        after: source,
        actor: role,
        description,
      });
      refresh();
      return result;
    },
    [role, refresh]
  );

  return { plans, updatePrice, updateIncludedCredits, setActive, duplicate };
}
