/**
 * Calixo Platform - Commercial Platform API
 *
 * The top-level umbrella — one call for a combined subscription/credits/
 * usage/invoices/licenses view (mirrors Phase 6/8's umbrella-facade
 * precedent). Individual Platform APIs stay the precise, typed surfaces for
 * callers who only need one concern.
 */
import { subscriptionPlatformAPI } from "./SubscriptionPlatformAPI";
import { creditEngine } from "./CreditEngine";
import { usageMeteringEngine } from "./UsageMeteringEngine";
import { invoiceEngine } from "./InvoiceEngine";
import { licensingEngine } from "./LicensingEngine";
import { addOnRegistry } from "./AddOnRegistry";
import type { AddOnDefinition, AddOnSubscription, CreditBalance, Invoice, LicenseDefinition, UsageSummary } from "./types";
import type { Subscription } from "@/core/platform/subscription/types";

export interface CommercialOverview {
  subscription: Subscription;
  credits: CreditBalance[];
  usageBreakdown: UsageSummary[];
  recentInvoices: Invoice[];
  licenses: LicenseDefinition[];
}

export class CommercialPlatformAPI {
  getOverview(organizationId: string): CommercialOverview {
    return {
      subscription: subscriptionPlatformAPI.getOrDefault(organizationId),
      credits: creditEngine.getAllBalances(organizationId),
      usageBreakdown: usageMeteringEngine.getBreakdown(organizationId, "monthly"),
      recentInvoices: invoiceEngine.listForOrganization(organizationId).slice(0, 10),
      licenses: licensingEngine.listForOrganization(organizationId),
    };
  }

  registerAddOn(addOn: AddOnDefinition): AddOnDefinition {
    return addOnRegistry.register(addOn);
  }

  listAddOns(): AddOnDefinition[] {
    return addOnRegistry.list();
  }

  subscribeAddOn(organizationId: string, addOnId: string, quantity?: number): AddOnSubscription {
    return addOnRegistry.subscribe(organizationId, addOnId, quantity);
  }

  listOrganizationAddOns(organizationId: string): AddOnSubscription[] {
    return addOnRegistry.listForOrganization(organizationId);
  }
}

export const commercialPlatformAPI = new CommercialPlatformAPI();
