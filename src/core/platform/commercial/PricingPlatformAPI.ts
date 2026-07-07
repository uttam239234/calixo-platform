/**
 * Calixo Platform - Pricing Platform API
 */
import { pricingEngine } from "./PricingEngine";
import type { PriceQuote, PricingRuleDefinition } from "./types";
import type { BillingCycle, SubscriptionTier } from "@/core/platform/subscription/types";

export class PricingPlatformAPI {
  registerRule(rule: PricingRuleDefinition): PricingRuleDefinition {
    return pricingEngine.registerRule(rule);
  }

  list(): PricingRuleDefinition[] {
    return pricingEngine.list();
  }

  listForTier(tier: SubscriptionTier): PricingRuleDefinition[] {
    return pricingEngine.listForTier(tier);
  }

  quote(tier: SubscriptionTier, billingCycle: BillingCycle, usage?: { usageTypeId: string; quantity: number }[], discountPercent?: number): PriceQuote {
    return pricingEngine.quote(tier, billingCycle, usage, discountPercent);
  }
}

export const pricingPlatformAPI = new PricingPlatformAPI();
