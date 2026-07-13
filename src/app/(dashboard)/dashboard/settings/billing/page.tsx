"use client";

import { useRouter } from "next/navigation";
import { ArrowUpCircle, RefreshCw } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useBilling } from "@/hooks/useBilling";
import { subscriptionRegistry } from "@/core/platform/subscription";
import { STATUS_LABELS } from "@/features/settings/billing/constants";

export default function CurrentPlanPage() {
  const router = useRouter();
  const { tenantContext, canUpdateBilling, showToast } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const billing = useBilling(organizationId);

  if (billing.loading || !billing.subscription || !billing.currentPlanPrice) {
    return (
      <div>
        <ModuleHeader title="Current Plan" description="Your plan, price, status, and what's included." />
        <p className="text-sm text-muted-foreground">Loading your plan…</p>
      </div>
    );
  }

  const { subscription, currentPlanPrice, usageStats } = billing;
  const tierLabel = subscriptionRegistry.get(subscription.tier)?.label ?? subscription.tier;
  const price = currentPlanPrice.isQuoteOnly
    ? "Custom pricing"
    : subscription.billingCycle === "annual"
      ? `$${currentPlanPrice.annualPrice.toLocaleString()}/year`
      : `$${currentPlanPrice.monthlyPrice.toLocaleString()}/month`;

  const otherCycle = subscription.billingCycle === "annual" ? "monthly" : "annual";

  return (
    <div>
      <ModuleHeader
        title="Current Plan"
        description="Your plan, price, status, and what's included."
        quickActions={
          canUpdateBilling && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  billing.changeBillingCycle(otherCycle);
                  showToast(`Switched to ${otherCycle === "annual" ? "annual" : "monthly"} billing.`);
                }}
              >
                <RefreshCw size={16} />
                Switch to {otherCycle === "annual" ? "Annual" : "Monthly"} Billing
              </Button>
              <Button onClick={() => router.push("/dashboard/settings/billing/upgrade")}>
                <ArrowUpCircle size={16} />
                Upgrade Plan
              </Button>
            </div>
          )
        }
      />

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Plan</p>
            <p className="mt-1 text-xl font-bold text-foreground">{tierLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Price</p>
            <p className="mt-1 text-xl font-bold text-foreground">{price}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 text-xl font-bold text-foreground">{STATUS_LABELS[subscription.status]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Renewal Date</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {subscription.renewsAt ? new Date(subscription.renewsAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-3 text-sm font-medium text-foreground">What&apos;s included</p>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">AI Credits</p>
              <p className="mt-1 font-semibold text-foreground">{subscription.limits.aiCredits.toLocaleString()}/month</p>
            </div>
            {usageStats.map(stat => (
              <div key={stat.id}>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-semibold text-foreground">
                  {stat.used.toLocaleString()} of {stat.limit.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
