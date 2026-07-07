/**
 * Calixo Platform - Promotion Platform API
 */
import { promotionEngine, type PromotionValidation } from "./PromotionEngine";
import type { PromotionDefinition, PromotionRedemption } from "./types";
import type { SubscriptionTier } from "@/core/platform/subscription/types";

export class PromotionPlatformAPI {
  create(input: Omit<PromotionDefinition, "id" | "redemptionCount">): PromotionDefinition {
    return promotionEngine.create(input);
  }

  getByCode(code: string): PromotionDefinition | undefined {
    return promotionEngine.getByCode(code);
  }

  list(): PromotionDefinition[] {
    return promotionEngine.list();
  }

  validate(code: string, tier?: SubscriptionTier): PromotionValidation {
    return promotionEngine.validate(code, tier);
  }

  redeem(code: string, organizationId: string, baseAmount: number, tier?: SubscriptionTier): PromotionRedemption {
    return promotionEngine.redeem(code, organizationId, baseAmount, tier);
  }

  getRedemptions(organizationId: string): PromotionRedemption[] {
    return promotionEngine.getRedemptions(organizationId);
  }
}

export const promotionPlatformAPI = new PromotionPlatformAPI();
