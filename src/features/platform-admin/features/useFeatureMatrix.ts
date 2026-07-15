"use client";

/**
 * Internal Plan Management Console — Section 3: Features & Modules matrix.
 *
 * The brief's 12 rows don't all map to the same real primitive:
 *  - 8 rows (Dashboard/Analytics/Ads Manager/Social Media/Brand Monitoring/
 *    Content Studio/AI Copilot/Reports) are real module ids in
 *    `SubscriptionLimits.modules` — the same array `EntitlementEngine.
 *    canAccess("module", id)` already reads live, so toggling one here
 *    takes effect immediately with no separate entitlement store to sync.
 *  - "Audit Logs" is a real boolean feature gate (`featureGates:
 *    ["audit-export", ...]`), toggled the same way.
 *  - "Workspaces"/"Integrations"/"API Access" have no boolean concept in
 *    the real system — only numeric limits (`workspaces`/`connectors`/
 *    `apiRequests`, also edited directly in Section 4). Their toggle here
 *    is an honest proxy over that same field: ON sets a sensible non-zero
 *    default (or keeps the existing value), OFF sets it to 0 — one shared
 *    source of truth with Section 4, not a second, disconnected flag.
 */
import { useCallback, useState } from "react";
import { subscriptionRegistry } from "@/core/platform/subscription";
import type { SubscriptionTier, SubscriptionLimits } from "@/core/platform/subscription";
import { useInternalRole } from "../internalRole";
import { commitPlanChange } from "../commitPlanChange";
import { saveSubscriptionTierAction } from "@/core/platform/configStore/actions";
import { SELF_SERVE_TIERS } from "@/features/settings/billing/constants";
import { ALL_MODULE_IDS, LIMIT_PROXY_DEFAULTS, type MatrixRow } from "./matrixRows";

export type { MatrixRowKind, MatrixRow } from "./matrixRows";
export { MATRIX_ROWS, ALL_MODULE_IDS, LIMIT_PROXY_DEFAULTS } from "./matrixRows";

export function isRowEnabled(limits: SubscriptionLimits, row: MatrixRow): boolean {
  if (row.kind === "module") return limits.modules.includes("*") || limits.modules.includes(row.id);
  if (row.kind === "featureGate") return limits.featureGates.includes(row.id);
  return (limits[row.id as keyof SubscriptionLimits] as number) > 0;
}

export function useFeatureMatrix() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const tiers = SELF_SERVE_TIERS.map(tier => ({ tier, definition: subscriptionRegistry.get(tier)! }));

  const toggle = useCallback(
    async (tier: SubscriptionTier, row: MatrixRow, nextValue: boolean) => {
      const definition = subscriptionRegistry.get(tier);
      if (!definition) return;
      const before = isRowEnabled(definition.limits, row);
      let nextLimits: SubscriptionLimits = definition.limits;

      if (row.kind === "module") {
        const expanded = definition.limits.modules.includes("*") ? ALL_MODULE_IDS : definition.limits.modules;
        nextLimits = { ...definition.limits, modules: nextValue ? Array.from(new Set([...expanded, row.id])) : expanded.filter(m => m !== row.id) };
      } else if (row.kind === "featureGate") {
        nextLimits = { ...definition.limits, featureGates: nextValue ? Array.from(new Set([...definition.limits.featureGates, row.id])) : definition.limits.featureGates.filter(f => f !== row.id) };
      } else {
        const key = row.id as keyof SubscriptionLimits;
        const current = definition.limits[key] as number;
        const nextAmount = nextValue ? (current > 0 ? current : LIMIT_PROXY_DEFAULTS[row.id]) : 0;
        nextLimits = { ...definition.limits, [key]: nextAmount };
      }

      const description = `${nextValue ? "Enabled" : "Disabled"} ${row.label} for the ${tier} plan`;
      const nextDefinition = { ...definition, limits: nextLimits };
      subscriptionRegistry.register(nextDefinition);
      void saveSubscriptionTierAction(nextDefinition, description);
      const risky = before && !nextValue ? "feature_removal" : undefined;
      await commitPlanChange({
        entityType: "subscription-tier-modules",
        entityId: `${tier}:${row.id}`,
        before,
        after: nextValue,
        actor: role,
        description,
        risky,
        restore: risky
          ? () => {
              const d = subscriptionRegistry.get(tier)!;
              const restored = { ...d, limits: definition.limits };
              subscriptionRegistry.register(restored);
              void saveSubscriptionTierAction(restored, `Undo: ${description}`);
              refresh();
            }
          : undefined,
      });
      refresh();
    },
    [role, refresh]
  );

  return { tiers, toggle };
}
