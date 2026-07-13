/**
 * Calixo Platform - Promotion Platform
 *
 * Real coupon/discount-code validation and redemption arithmetic — genuinely
 * new, nothing pre-existing to reuse.
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { SubscriptionTier } from "@/core/platform/subscription/types";
import type { PromotionDefinition, PromotionRedemption } from "./types";

export interface PromotionValidation {
  valid: boolean;
  reason?: string;
  promotion?: PromotionDefinition;
}

export class PromotionEngine {
  private promotions = new Map<string, PromotionDefinition>();
  private redemptions: PromotionRedemption[] = [];

  create(input: Omit<PromotionDefinition, "id" | "redemptionCount">): PromotionDefinition {
    const promotion: PromotionDefinition = { ...input, id: generateId(14), redemptionCount: 0 };
    this.promotions.set(promotion.code, promotion);
    return promotion;
  }

  getByCode(code: string): PromotionDefinition | undefined {
    return this.promotions.get(code);
  }

  list(): PromotionDefinition[] {
    return Array.from(this.promotions.values());
  }

  validate(code: string, tier?: SubscriptionTier): PromotionValidation {
    const promotion = this.promotions.get(code);
    if (!promotion) return { valid: false, reason: "Promotion code not found." };
    if (!promotion.isActive) return { valid: false, reason: "Promotion is not active." };
    const now = new Date().toISOString();
    if (now < promotion.validFrom) return { valid: false, reason: "Promotion is not yet valid." };
    if (promotion.validUntil && now > promotion.validUntil) return { valid: false, reason: "Promotion has expired." };
    if (promotion.maxRedemptions !== undefined && promotion.redemptionCount >= promotion.maxRedemptions) return { valid: false, reason: "Promotion has reached its redemption limit." };
    if (promotion.applicableTiers && tier && !promotion.applicableTiers.includes(tier)) return { valid: false, reason: `Promotion does not apply to the ${tier} tier.` };
    return { valid: true, promotion };
  }

  redeem(code: string, organizationId: string, baseAmount: number, tier?: SubscriptionTier): PromotionRedemption {
    const validation = this.validate(code, tier);
    if (!validation.valid || !validation.promotion) throw new Error(validation.reason ?? "Invalid promotion code.");
    const promotion = validation.promotion;
    const discountApplied = promotion.discountKind === "percent" ? Math.round(baseAmount * (promotion.discountValue / 100) * 100) / 100 : Math.min(baseAmount, promotion.discountValue);
    promotion.redemptionCount += 1;
    const redemption: PromotionRedemption = { id: generateId(14), promotionId: promotion.id, organizationId, discountApplied, redeemedAt: new Date().toISOString() };
    this.redemptions.push(redemption);
    void platformEventBus.publish({ type: "PromotionRedeemed", organizationId, payload: { code, discountApplied } });
    return redemption;
  }

  getRedemptions(organizationId: string): PromotionRedemption[] {
    return this.redemptions.filter(r => r.organizationId === organizationId);
  }

  /** Enable/disable instantly — added for the Internal Plan Management Console, same size/shape as `SubscriptionEngine.changeBillingCycle`. */
  setActive(code: string, isActive: boolean): PromotionDefinition {
    const promotion = this.promotions.get(code);
    if (!promotion) throw new Error(`Unknown promotion code: ${code}`);
    promotion.isActive = isActive;
    return promotion;
  }

  count(): number {
    return this.promotions.size;
  }
}

export const promotionEngine = new PromotionEngine();
