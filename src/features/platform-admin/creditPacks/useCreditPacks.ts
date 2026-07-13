"use client";

/**
 * Internal Plan Management Console — Section 2: AI Credit Packs.
 *
 * Reads/writes the real `creditPackPlatformAPI` — the single source of
 * truth Billing & Plans' Buy Credits dialog now reads from (previously a
 * hardcoded UI constant), so a pack edited or disabled here disappears from
 * checkout immediately.
 */
import { useCallback, useState } from "react";
import { creditPackPlatformAPI } from "@/core/platform/commercial";
import type { CreditPackDefinition } from "@/core/platform/commercial";
import { useInternalRole } from "../internalRole";
import { commitPlanChange, type CommitPlanChangeResult } from "../commitPlanChange";

export function useCreditPacks() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const packs = creditPackPlatformAPI.list();

  const addPack = useCallback(
    (id: string, price: number, credits: number) => {
      const order = packs.length + 1;
      creditPackPlatformAPI.register({ id, price, credits, isActive: true, order });
      void commitPlanChange({
        entityType: "credit-pack",
        entityId: id,
        before: null,
        after: { id, price, credits },
        actor: role,
        description: `Added a new $${price} → ${credits.toLocaleString()} credit pack`,
      });
      refresh();
    },
    [packs.length, role, refresh]
  );

  const editPack = useCallback(
    async (pack: CreditPackDefinition, price: number, credits: number): Promise<CommitPlanChangeResult> => {
      const before = { price: pack.price, credits: pack.credits };
      const after = { price, credits };
      creditPackPlatformAPI.register({ ...pack, price, credits });
      const risky = credits < pack.credits ? "credit_reduction" : undefined;
      const result = await commitPlanChange({
        entityType: "credit-pack",
        entityId: pack.id,
        before,
        after,
        actor: role,
        description: `Changed the $${pack.price} pack to $${price} → ${credits.toLocaleString()} credits`,
        risky,
        restore: risky
          ? prev => {
              creditPackPlatformAPI.register({ ...pack, price: prev.price, credits: prev.credits });
              refresh();
            }
          : undefined,
      });
      refresh();
      return result;
    },
    [role, refresh]
  );

  const setActive = useCallback(
    (id: string, isActive: boolean) => {
      creditPackPlatformAPI.setActive(id, isActive);
      void commitPlanChange({
        entityType: "credit-pack-active",
        entityId: id,
        before: !isActive,
        after: isActive,
        actor: role,
        description: `${isActive ? "Enabled" : "Disabled"} credit pack ${id}`,
      });
      refresh();
    },
    [role, refresh]
  );

  const reorder = useCallback(
    (id: string, direction: "up" | "down") => {
      creditPackPlatformAPI.reorder(id, direction);
      refresh();
    },
    [refresh]
  );

  return { packs, addPack, editPack, setActive, reorder };
}
