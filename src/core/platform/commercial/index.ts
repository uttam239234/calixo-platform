/**
 * Calixo Platform - Enterprise Commercial, Billing, Licensing & Subscription
 * Platform
 *
 * Barrel for the ninth major `core/platform` subpackage — the commercial
 * backbone. Reuses Phase 1's real `subscriptionEngine`/`subscriptionRegistry`
 * (extended additively: billing cycle, pause/cancel/renew lifecycle, more
 * tiers) rather than rebuilding subscription logic, and adds what didn't
 * exist anywhere: an open, registrable Usage Metering + Quota system,
 * Credits, Licensing, the Entitlement Platform (the one place every module
 * asks "can this happen" instead of comparing a tier name), Pricing,
 * Invoices, a provider-agnostic Payment abstraction, Promotions, Contracts,
 * and Add-Ons.
 *
 * `initializeCommercialFoundation()` registers ~24 usage types, default
 * quotas/pricing, wires AI/Connector/API/Execution usage recording (event-
 * driven for Connector/Execution, a real recurring tick for AI/API), and
 * sweeps subscription grace periods + lapsed credits.
 */

export * from "./types";
export * from "./UsageMeteringEngine";
export * from "./QuotaEngine";
export * from "./CreditEngine";
export * from "./LicensingEngine";
export * from "./EntitlementEngine";
export * from "./PricingEngine";
export * from "./InvoiceEngine";
export * from "./PaymentEngine";
export * from "./PromotionEngine";
export * from "./ContractEngine";
export * from "./AddOnRegistry";
export * from "./CommercialPolicyRegistry";

export * from "./CommercialPlatformAPI";
export * from "./SubscriptionPlatformAPI";
export * from "./LicensingPlatformAPI";
export * from "./EntitlementPlatformAPI";
export * from "./UsagePlatformAPI";
export * from "./QuotaPlatformAPI";
export * from "./CreditPlatformAPI";
export * from "./PricingPlatformAPI";
export * from "./InvoicePlatformAPI";
export * from "./PaymentPlatformAPI";
export * from "./PromotionPlatformAPI";
export * from "./ContractPlatformAPI";
export * from "./CommercialDeveloperSDK";

import { registerCoreCommercialWiring } from "./contracts/registerCoreCommercialWiring";

let initialized = false;

export async function initializeCommercialFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;
  registerCoreCommercialWiring();
}
