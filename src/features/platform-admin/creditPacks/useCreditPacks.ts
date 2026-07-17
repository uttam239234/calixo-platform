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
    async (id: string, price: number, credits: number): Promise<CommitPlanChangeResult> => {
      const order = packs.length + 1;
      const description = `Added a new $${price} → ${credits.toLocaleString()} credit pack`;
      const pack = { id, price, credits, isActive: true, order };
      creditPackPlatformAPI.register(pack);
      const saveResult = await saveCreditPackAction(pack, description);
      if (!saveResult.ok) {
        refresh();
        return { error: saveResult.error };
      }
      const result = await commitPlanChange({
        entityType: "credit-pack",
        entityId: id,
        before: null,
        after: { id, price, credits },
        actor: role,
        description,
      });
      refresh();
      return result;
    },
    [packs.length, role, refresh]
  );

  const editPack = useCallback(
    async (pack: CreditPackDefinition, price: number, credits: number): Promise<CommitPlanChangeResult> => {
      const before = { price: pack.price, credits: pack.credits };
      const after = { price, credits };
      const description = `Changed the $${pack.price} pack to $${price} → ${credits.toLocaleString()} credits`;
      creditPackPlatformAPI.register({ ...pack, price, credits });
      const saveResult = await saveCreditPackAction({ ...pack, price, credits }, description);
      const risky = credits < pack.credits ? "credit_reduction" : undefined;
      const result = saveResult.ok
        ? await commitPlanChange({
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
          })
        : { error: saveResult.error };
      refresh();
      return result;
    },
    [role, refresh]
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean): Promise<CommitPlanChangeResult> => {
      const description = `${isActive ? "Enabled" : "Disabled"} credit pack ${id}`;
      creditPackPlatformAPI.setActive(id, isActive);
      const saveResult = await setCreditPackActiveAction(id, isActive, description);
      if (!saveResult.ok) {
        refresh();
        return { error: saveResult.error };
      }
      const result = await commitPlanChange({
        entityType: "credit-pack-active",
        entityId: id,
        before: !isActive,
        after: isActive,
        actor: role,
        description,
      });
      refresh();
      return result;
    },
    [role, refresh]
  );

  const reorder = useCallback(
    async (id: string, direction: "up" | "down"): Promise<CommitPlanChangeResult> => {
      creditPackPlatformAPI.reorder(id, direction);
      const saveResult = await reorderCreditPackAction(id, direction);
      refresh();
      return saveResult.ok ? {} : { error: saveResult.error };
    },
    [refresh]
  );

  return { packs, addPack, editPack, setActive, reorder };
}
