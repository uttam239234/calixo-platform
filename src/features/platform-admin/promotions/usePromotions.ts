"use client";

/**
 * Internal Plan Management Console — Section 6: Promotions.
 *
 * Reads/writes the real `promotionPlatformAPI` (`create`/`list`, plus this
 * round's additive `setActive`) — the same engine `redeem()`/`validate()`
 * would check at checkout.
 */
import { useCallback, useState } from "react";
import { promotionPlatformAPI } from "@/core/platform/commercial";
import type { PromotionDefinition, DiscountKind } from "@/core/platform/commercial";
import { useInternalRole } from "../internalRole";
import { commitPlanChange } from "../commitPlanChange";
import { createPromotionAction, setPromotionActiveAction } from "@/core/platform/configStore/actions";

export interface NewPromotionInput {
  code: string;
  discountKind: DiscountKind;
  discountValue: number;
  validUntil?: string;
  maxRedemptions?: number;
}

export function usePromotions() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const promotions = promotionPlatformAPI.list();

  const create = useCallback(
    async (input: NewPromotionInput) => {
      const description = `Created promotion ${input.code}`;
      const newPromotion = {
        code: input.code,
        kind: "coupon" as const,
        discountKind: input.discountKind,
        discountValue: input.discountValue,
        maxRedemptions: input.maxRedemptions,
        validFrom: new Date().toISOString(),
        validUntil: input.validUntil,
        isActive: true,
      };
      // Server-authoritative: the real id is minted once, server-side (`generateId()` inside `PromotionEngine.create()`) — this realm's own copy is reconciled from that response via `restoreAll()` rather than separately minting a second, different id by ALSO calling `.create()` locally.
      const result = await createPromotionAction(newPromotion, description);
      if (!result.ok) return;
      promotionPlatformAPI.restoreAll(result.data);
      const created = result.data.find(p => p.code === input.code);
      void commitPlanChange({
        entityType: "promotion",
        entityId: created?.id ?? input.code,
        before: null,
        after: created,
        actor: role,
        description,
      });
      refresh();
    },
    [role, refresh]
  );

  const setActive = useCallback(
    (promotion: PromotionDefinition, isActive: boolean) => {
      const description = `${isActive ? "Enabled" : "Disabled"} promotion ${promotion.code}`;
      promotionPlatformAPI.setActive(promotion.code, isActive);
      void setPromotionActiveAction(promotion.code, isActive, description);
      void commitPlanChange({
        entityType: "promotion",
        entityId: promotion.id,
        before: !isActive,
        after: isActive,
        actor: role,
        description,
      });
      refresh();
    },
    [role, refresh]
  );

  return { promotions, create, setActive };
}
