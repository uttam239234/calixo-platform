/**
 * Calixo Platform - Pricing Platform
 *
 * Real price computation from registered rules — architecture only in the
 * sense that no payment is actually charged here (that's `PaymentEngine`),
 * but the arithmetic (base + usage + discount) is genuine, not a stub.
 */
import type { BillingCycle, SubscriptionTier } from "@/core/platform/subscription/types";
import type { PriceQuote, PricingRuleDefinition } from "./types";

export class PricingEngine {
  private rules = new Map<string, PricingRuleDefinition>();

  registerRule(rule: PricingRuleDefinition): PricingRuleDefinition {
    this.rules.set(rule.id, rule);
    return rule;
  }

  get(id: string): PricingRuleDefinition | undefined {
    return this.rules.get(id);
  }

  list(): PricingRuleDefinition[] {
    return Array.from(this.rules.values());
  }

  listForTier(tier: SubscriptionTier): PricingRuleDefinition[] {
    return this.list().filter(r => r.tier === tier);
  }

  /** Enterprise/custom tiers with no registered flat rule fall through to `basePrice: 0` — the honest signal for "requires a quote", matching mandate's "Enterprise Quote" model. */
  quote(tier: SubscriptionTier, billingCycle: BillingCycle, usage: { usageTypeId: string; quantity: number }[] = [], discountPercent = 0): PriceQuote {
    const rules = this.listForTier(tier);
    const flatRule = rules.find(r => r.model === "flat" || r.model === "hybrid");
    const basePrice = flatRule ? (billingCycle === "annual" ? flatRule.annualPrice ?? 0 : flatRule.monthlyPrice ?? 0) : 0;
    const currency = flatRule?.currency ?? "USD";

    const usageCharges = usage.map(u => {
      const rule = rules.find(r => r.usageTypeId === u.usageTypeId && (r.model === "usage" || r.model === "hybrid"));
      const unitPrice = rule?.usageUnitPrice ?? 0;
      return { usageTypeId: u.usageTypeId, quantity: u.quantity, unitPrice, subtotal: Math.round(unitPrice * u.quantity * 100) / 100 };
    });

    const subtotal = basePrice + usageCharges.reduce((sum, c) => sum + c.subtotal, 0);
    const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
    const totalPrice = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    return { tier, billingCycle, currency, basePrice, usageCharges, discountAmount, totalPrice };
  }

  count(): number {
    return this.rules.size;
  }
}

export const pricingEngine = new PricingEngine();
