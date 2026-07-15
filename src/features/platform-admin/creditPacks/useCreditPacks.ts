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
import { saveCreditPackAction, setCreditPackActiveAction, reorderCreditPackAction } from "@/core/platform/configStore/actions";

export function useCreditPacks() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const packs = creditPackPlatformAPI.list();

  const addPack = useCallback(
    (id: string, price: number, credits: number) => {
      const order = packs.length + 1;
      const description = `Added a new $${price} → ${credits.toLocaleString()} credit pack`;
      const pack = { id, price, credits, isActive: true, order };
      creditPackPlatformAPI.register(pack);
      void saveCreditPackAction(pack, description);
      void commitPlanChange({
        entityType: "credit-pack",
        entityId: id,
        before: null,
        after: { id, price, credits },
        actor: role,
        description,
      });
      refresh();
    },
    [packs.length, role, refresh]
  );

  const editPack = useCallback(
    async (pack: CreditPackDefinition, price: number, credits: number): Promise<CommitPlanChangeResult> => {
      const before = { price: pack.price, credits: pack.credits };
      const after = { price, credits };
      const description = `Changed the $${pack.price} pack to $${price} → ${credits.toLocaleString()} credits`;
      creditPackPlatformAPI.register({ ...pack, price, credits });
      void saveCreditPackAction({ ...pack, price, credits }, description);
      const risky = credits < pack.credits ? "credit_reduction" : undefined;
      const result = await commitPlanChange({
        entityType: "credit-pack",
        entityId: pack.id,
        before,
        after,
        actor: role,
        description,
        risky,
        restore: risky
          ? prev => {
              creditPackPlatformAPI.register({ ...pack, price: prev.price, credits: prev.credits });
              void saveCreditPackAction({ ...pack, price: prev.price, credits: prev.credits }, `Undo: ${description}`);
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
      const description = `${isActive ? "Enabled" : "Disabled"} credit pack ${id}`;
      creditPackPlatformAPI.setActive(id, isActive);
      void setCreditPackActiveAction(id, isActive, description);
      void commitPlanChange({
        entityType: "credit-pack-active",
        entityId: id,
        before: !isActive,
        after: isActive,
        actor: role,
        description,
      });
      refresh();
    },
    [role, refresh]
  );

  const reorder = useCallback(
    (id: string, direction: "up" | "down") => {
      creditPackPlatformAPI.reorder(id, direction);
      void reorderCreditPackAction(id, direction);
      refresh();
    },
    [refresh]
  );

  return { packs, addPack, editPack, setActive, reorder };
}
