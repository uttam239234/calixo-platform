"use client";

/**
 * Internal Plan Management Console — Section 4: Usage Limits.
 *
 * Edits the same real `SubscriptionLimits` object Section 1 and Section 3
 * also read/write via `subscriptionRegistry` — one shared source of truth,
 * not a parallel "limits" store. Shows all 8 real tiers (not just the
 * brief's 4 self-serve examples): real seeded organizations sit on
 * education/enterprise/growth/starter, so their limits need to be editable
 * here too.
 */
import { useCallback, useState } from "react";
import { subscriptionRegistry, SUBSCRIPTION_TIERS } from "@/core/platform/subscription";
import type { SubscriptionTier, SubscriptionLimits } from "@/core/platform/subscription";
import { useInternalRole } from "../internalRole";
import { commitPlanChange, type CommitPlanChangeResult } from "../commitPlanChange";
import { saveSubscriptionTierAction } from "@/core/platform/configStore/actions";

export type NumericLimitKey = Exclude<keyof SubscriptionLimits, "modules" | "featureGates">;

export interface LimitField {
  key: NumericLimitKey;
  label: string;
}

export const LIMIT_FIELDS: LimitField[] = [
  { key: "seats", label: "Users" },
  { key: "organizations", label: "Organizations" },
  { key: "connectors", label: "Integrations" },
  { key: "reports", label: "Reports" },
  { key: "workspaces", label: "Workspaces" },
  { key: "scheduledReports", label: "Scheduled Reports" },
  { key: "apiRequests", label: "API Requests" },
  { key: "storageGB", label: "Storage (GB)" },
  { key: "aiCredits", label: "AI Credits" },
];

export function useLimits() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const tiers = SUBSCRIPTION_TIERS.map(tier => ({ tier, definition: subscriptionRegistry.get(tier)! }));

  const updateLimits = useCallback(
    async (tier: SubscriptionTier, patch: Partial<Record<NumericLimitKey, number>>): Promise<CommitPlanChangeResult> => {
      const definition = subscriptionRegistry.get(tier);
      if (!definition) return {};
      const before: Partial<Record<NumericLimitKey, number>> = {};
      let anyReduced = false;
      for (const key of Object.keys(patch) as NumericLimitKey[]) {
        const currentValue = definition.limits[key];
        before[key] = currentValue;
        if ((patch[key] as number) < currentValue) anyReduced = true;
      }
      const nextLimits: SubscriptionLimits = { ...definition.limits, ...patch };
      const description = `Changed ${tier}'s usage limits`;
      const nextDefinition = { ...definition, limits: nextLimits };
      subscriptionRegistry.register(nextDefinition);
      const saveResult = await saveSubscriptionTierAction(nextDefinition, description);
      const risky = anyReduced ? "credit_reduction" : undefined;
      const result = saveResult.ok
        ? await commitPlanChange({
            entityType: "subscription-tier-limits",
            entityId: tier,
            before,
            after: patch,
            actor: role,
            description,
            risky,
            restore: risky
              ? prev => {
                  const d = subscriptionRegistry.get(tier)!;
                  const restored = { ...d, limits: { ...d.limits, ...prev } };
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

  return { tiers, updateLimits };
}
