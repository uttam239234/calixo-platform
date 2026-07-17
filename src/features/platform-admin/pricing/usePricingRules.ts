"use client";

/**
 * Internal Plan Management Console — Section 5: Pricing Rules.
 *
 * Reads/writes the real `pricingPlatformAPI.registerRule()` — the same
 * upsert Section 1 also uses for a plan's headline price, and the same
 * rule Round 14's Upgrade Center/Current Plan quote from. `PricingRuleDefinition`
 * has no stored "discount %" field — the brief's "Discount %"/"Savings"
 * display is the annual-vs-monthly saving, computed from the two real editable
 * prices rather than a third, redundant stored number. "Regional Pricing" has
 * no backend anywhere in this codebase (`currency` is always `"USD"`) —
 * surfaced as a disclosed, disabled note, not a fabricated control.
 */
import { useCallback, useState } from "react";
import { subscriptionRegistry, SUBSCRIPTION_TIERS } from "@/core/platform/subscription";
import type { SubscriptionTier } from "@/core/platform/subscription";
import { pricingPlatformAPI } from "@/core/platform/commercial";
import type { PricingRuleDefinition } from "@/core/platform/commercial";
import { useInternalRole } from "../internalRole";
import { commitPlanChange, type CommitPlanChangeResult } from "../commitPlanChange";
import { savePricingRuleAction } from "@/core/platform/configStore/actions";

export interface PricingRow {
  tier: SubscriptionTier;
  label: string;
  rule?: PricingRuleDefinition;
  savingsPercent: number;
}

export function usePricingRules() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const rows: PricingRow[] = SUBSCRIPTION_TIERS.map(tier => {
    const rule = pricingPlatformAPI.listForTier(tier).find(r => r.model === "flat" || r.model === "hybrid");
    const monthly = rule?.monthlyPrice ?? 0;
    const annual = rule?.annualPrice ?? 0;
    const savingsPercent = monthly > 0 ? Math.round((1 - annual / (monthly * 12)) * 100) : 0;
    return { tier, label: subscriptionRegistry.get(tier)?.label ?? tier, rule, savingsPercent };
  });

  const updateRule = useCallback(
    async (tier: SubscriptionTier, monthlyPrice: number, annualPrice: number): Promise<CommitPlanChangeResult> => {
      const rule = pricingPlatformAPI.listForTier(tier).find(r => r.model === "flat" || r.model === "hybrid");
      if (!rule) return {};
      const before = { monthlyPrice: rule.monthlyPrice ?? 0, annualPrice: rule.annualPrice ?? 0 };
      const description = `Changed ${tier}'s pricing to $${monthlyPrice}/mo, $${annualPrice}/yr`;
      pricingPlatformAPI.registerRule({ ...rule, monthlyPrice, annualPrice });
      const saveResult = await savePricingRuleAction({ ...rule, monthlyPrice, annualPrice }, description);
      const result = saveResult.ok
        ? await commitPlanChange({
            entityType: "pricing-rule",
            entityId: rule.id,
            before,
            after: { monthlyPrice, annualPrice },
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

  return { rows, updateRule };
}
