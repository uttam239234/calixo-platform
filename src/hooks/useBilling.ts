"use client";

/**
 * Calixo Billing & Plans - "Subscription and AI Usage Center" data hook.
 * The only place allowed to call the Commercial/Subscription/Organization
 * Platform APIs for this module — components never import them directly.
 * Scoped to a single organization, matching every other Settings module's
 * hook shape (`useIntegrations`, `useWorkspaces`, ...).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { subscriptionPlatformAPI, invoicePlatformAPI, pricingPlatformAPI, creditPackPlatformAPI } from "@/core/platform/commercial";
import type { Invoice, CreditPackDefinition } from "@/core/platform/commercial";
import { subscriptionRegistry } from "@/core/platform/subscription";
import type { Subscription, SubscriptionTier, BillingCycle, SubscriptionTierDefinition } from "@/core/platform/subscription";
import { organizationPlatformAPI } from "@/core/platform/organizations";
import { userRegistry } from "@/core/users";
import { listConnectorInstancesAction } from "@/core/connectors/actions";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import { getWalletBreakdown, buyCreditPack, type WalletBreakdown } from "@/features/settings/billing/aiCredits";
import {
  listPaymentMethods,
  addPaymentMethod as addPaymentMethodToStore,
  removePaymentMethod as removePaymentMethodFromStore,
  setDefaultPaymentMethod as setDefaultPaymentMethodInStore,
  type PaymentMethod,
  type PaymentMethodType,
} from "@/features/settings/billing/paymentMethods";
import { downloadInvoiceReceipt } from "@/features/settings/billing/receipt";
import { SELF_SERVE_TIERS } from "@/features/settings/billing/constants";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";

export interface UsageStat {
  id: string;
  label: string;
  used: number;
  limit: number;
}

export interface PriceInfo {
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  isQuoteOnly: boolean;
}

export interface PlanCard extends PriceInfo {
  tier: SubscriptionTier;
  definition: SubscriptionTierDefinition;
}

function priceFor(tier: SubscriptionTier): PriceInfo {
  const rules = pricingPlatformAPI.listForTier(tier);
  const isQuoteOnly = rules.some(r => r.model === "quote");
  const monthly = pricingPlatformAPI.quote(tier, "monthly");
  const annual = pricingPlatformAPI.quote(tier, "annual");
  return { monthlyPrice: monthly.basePrice, annualPrice: annual.basePrice, currency: monthly.currency, isQuoteOnly };
}

export function useBilling(organizationId: string) {
  const { identity } = useCalixoIdentity();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [wallet, setWallet] = useState<WalletBreakdown | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPackDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const sub = subscriptionPlatformAPI.getOrDefault(organizationId);
    const instances = await listConnectorInstancesAction();

    setSubscription(sub);
    setWallet(getWalletBreakdown(organizationId));
    setInvoices(invoicePlatformAPI.listForOrganization(organizationId));
    setPaymentMethods(listPaymentMethods(organizationId));
    setCreditPacks(creditPackPlatformAPI.list({ activeOnly: true }));
    setUsageStats([
      { id: "users", label: "Users", used: userRegistry.list({ organizationId }).length, limit: sub.limits.seats },
      { id: "integrations", label: "Integrations", used: instances.length, limit: sub.limits.connectors },
      { id: "workspaces", label: "Workspaces", used: workspacePlatformAPI.list({ organizationId }).length, limit: sub.limits.workspaces },
    ]);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const upgradePlan = useCallback(
    (tier: SubscriptionTier) => {
      organizationPlatformAPI.changeTier(organizationId, tier, identity?.userId ?? "");
      void refresh();
    },
    [organizationId, refresh, identity?.userId]
  );

  const changeBillingCycle = useCallback(
    (cycle: BillingCycle) => {
      subscriptionPlatformAPI.changeBillingCycle(organizationId, cycle);
      void refresh();
    },
    [organizationId, refresh]
  );

  const buyCredits = useCallback(
    (packId: string) => {
      buyCreditPack(organizationId, packId, identity?.userId ?? "");
      void refresh();
    },
    [organizationId, refresh, identity?.userId]
  );

  const addPaymentMethod = useCallback(
    (input: { type: PaymentMethodType; label: string; last4?: string }) => {
      addPaymentMethodToStore(organizationId, input);
      void refresh();
    },
    [organizationId, refresh]
  );

  const removePaymentMethod = useCallback(
    (methodId: string) => {
      removePaymentMethodFromStore(organizationId, methodId);
      void refresh();
    },
    [organizationId, refresh]
  );

  const setDefaultPaymentMethod = useCallback(
    (methodId: string) => {
      setDefaultPaymentMethodInStore(organizationId, methodId);
      void refresh();
    },
    [organizationId, refresh]
  );

  const downloadInvoice = useCallback(
    (invoice: Invoice) => {
      const organization = organizationPlatformAPI.get(organizationId);
      const tierLabel = subscription ? (subscriptionRegistry.get(subscription.tier)?.label ?? subscription.tier) : "";
      downloadInvoiceReceipt(invoice, organization?.name ?? "Your Organization", tierLabel);
    },
    [organizationId, subscription]
  );

  const currentPlanPrice = useMemo(() => (subscription ? priceFor(subscription.tier) : null), [subscription]);

  /**
   * Deliberately NOT memoized on an empty dependency array: `subscriptionRegistry`/
   * `pricingPlatformAPI` are mutable, platform-wide registries the Internal Plan
   * Management Console writes to — recomputing on every render (cheap: 4 tiers,
   * synchronous Map reads) is what makes a Platform Admin's price/limit edit show
   * up here without requiring a hard page reload.
   */
  const planCatalog: PlanCard[] = SELF_SERVE_TIERS.map(tier => ({
    tier,
    definition: subscriptionRegistry.get(tier)!,
    ...priceFor(tier),
  }));

  return {
    loading,
    subscription,
    wallet,
    invoices,
    paymentMethods,
    usageStats,
    creditPacks,
    currentPlanPrice,
    planCatalog,
    upgradePlan,
    changeBillingCycle,
    buyCredits,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    downloadInvoice,
    refresh,
  };
}

export type UseBillingResult = ReturnType<typeof useBilling>;
