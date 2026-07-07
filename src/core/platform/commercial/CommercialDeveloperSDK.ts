/**
 * Calixo Platform - Commercial Developer SDK
 *
 * One place a developer registers a new usage type, commercial policy,
 * entitlement (quota) rule, pricing rule, credit grant, limit, or add-on
 * without touching anything inside this package — mirrors Phase 6/7/8's
 * `DeveloperPlatformAPI`/`ExecutionDeveloperSDK`/`ObservabilityDeveloperSDK`
 * precedent.
 */
import { usagePlatformAPI } from "./UsagePlatformAPI";
import { quotaPlatformAPI } from "./QuotaPlatformAPI";
import { creditPlatformAPI } from "./CreditPlatformAPI";
import { pricingPlatformAPI } from "./PricingPlatformAPI";
import { commercialPolicyRegistry } from "./CommercialPolicyRegistry";
import { addOnRegistry } from "./AddOnRegistry";
import type { AddOnDefinition, CommercialPolicyDefinition, CreditSource, CreditTransaction, CreditType, PricingRuleDefinition, QuotaDefinition, UsageTypeDefinition } from "./types";

export class CommercialDeveloperSDK {
  registerUsageType(definition: UsageTypeDefinition): UsageTypeDefinition {
    return usagePlatformAPI.registerType(definition);
  }

  registerPolicy(policy: CommercialPolicyDefinition): CommercialPolicyDefinition {
    return commercialPolicyRegistry.register(policy);
  }

  defineLimit(quota: QuotaDefinition): QuotaDefinition {
    return quotaPlatformAPI.register(quota);
  }

  definePricingRule(rule: PricingRuleDefinition): PricingRuleDefinition {
    return pricingPlatformAPI.registerRule(rule);
  }

  grantCredit(organizationId: string, creditType: CreditType, amount: number, source: CreditSource, reason: string, expiresAt?: string): CreditTransaction {
    return creditPlatformAPI.grant(organizationId, creditType, amount, source, reason, expiresAt);
  }

  defineAddOn(addOn: AddOnDefinition): AddOnDefinition {
    return addOnRegistry.register(addOn);
  }
}

export const commercialDeveloperSDK = new CommercialDeveloperSDK();
