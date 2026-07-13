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
    (input: NewPromotionInput) => {
      const promotion = promotionPlatformAPI.create({
        code: input.code,
        kind: "coupon",
        discountKind: input.discountKind,
        discountValue: input.discountValue,
        maxRedemptions: input.maxRedemptions,
        validFrom: new Date().toISOString(),
        validUntil: input.validUntil,
        isActive: true,
      });
      void commitPlanChange({
        entityType: "promotion",
        entityId: promotion.id,
        before: null,
        after: promotion,
        actor: role,
        description: `Created promotion ${promotion.code}`,
      });
      refresh();
    },
    [role, refresh]
  );

  const setActive = useCallback(
    (promotion: PromotionDefinition, isActive: boolean) => {
      promotionPlatformAPI.setActive(promotion.code, isActive);
      void commitPlanChange({
        entityType: "promotion",
        entityId: promotion.id,
        before: !isActive,
        after: isActive,
        actor: role,
        description: `${isActive ? "Enabled" : "Disabled"} promotion ${promotion.code}`,
      });
      refresh();
    },
    [role, refresh]
  );

  return { promotions, create, setActive };
}
