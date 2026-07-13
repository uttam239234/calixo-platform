"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useBilling, type PlanCard } from "@/hooks/useBilling";
import { subscriptionRegistry } from "@/core/platform/subscription";
import { SELF_SERVE_TIERS, TIER_RECOMMENDED_USE_CASE, MODULE_LABELS, FEATURE_GATE_LABELS } from "@/features/settings/billing/constants";

function planFeatures(card: PlanCard): string[] {
  const moduleNames = card.definition.limits.modules.map(id => MODULE_LABELS[id] ?? id);
  const gateNames = card.definition.limits.featureGates.map(id => FEATURE_GATE_LABELS[id] ?? id);
  return [...moduleNames, ...gateNames];
}

export default function UpgradeCenterPage() {
  const { tenantContext, canUpdateBilling, showToast } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const billing = useBilling(organizationId);
  const [contactingSales, setContactingSales] = useState(false);

  const currentTier = billing.subscription?.tier;
  const isOnUnlistedTier = currentTier && !SELF_SERVE_TIERS.includes(currentTier);
  const currentTierLabel = currentTier ? (subscriptionRegistry.get(currentTier)?.label ?? currentTier) : "";

  return (
    <div>
      <ModuleHeader title="Upgrade Center" description="Compare plans and upgrade in a couple of clicks." />

      {isOnUnlistedTier && (
        <p className="mb-5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          You&apos;re currently on the <span className="font-medium text-foreground">{currentTierLabel}</span> plan. It isn&apos;t one of the plans below — your real plan and usage always show honestly on{" "}
          <a href="/dashboard/settings/billing" className="text-primary hover:underline">
            Current Plan
          </a>
          .
        </p>
      )}

      {billing.loading ? (
        <p className="text-sm text-muted-foreground">Loading plans…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {billing.planCatalog.map(card => {
            const isCurrent = currentTier === card.tier;
            const features = planFeatures(card);

            return (
              <div key={card.tier} className={`flex flex-col rounded-2xl border p-5 ${isCurrent ? "border-primary ring-1 ring-primary/30" : "border-border"} bg-card`}>
                <p className="font-semibold text-foreground">{card.definition.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{card.isQuoteOnly ? "Custom" : `$${card.monthlyPrice.toLocaleString()}`}</p>
                <p className="text-xs text-muted-foreground">{card.isQuoteOnly ? "Contact sales for pricing" : "per month"}</p>

                <p className="mt-3 text-sm text-muted-foreground">{TIER_RECOMMENDED_USE_CASE[card.tier]}</p>

                <p className="mt-4 text-sm font-medium text-foreground">{card.definition.limits.aiCredits.toLocaleString()} AI credits/month included</p>

                <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                  {features.slice(0, 6).map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-foreground">
                      <Check size={15} className="mt-0.5 flex-shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 border-t border-border pt-4">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : card.isQuoteOnly ? (
                    <Button variant="outline" className="w-full" onClick={() => setContactingSales(true)}>
                      <Mail size={14} /> Contact Sales
                    </Button>
                  ) : (
                    canUpdateBilling && (
                      <Button
                        className="w-full"
                        onClick={() => {
                          billing.upgradePlan(card.tier);
                          showToast(`Upgraded to the ${card.definition.label} plan.`);
                        }}
                      >
                        Upgrade
                      </Button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contactingSales && (
        <SimpleDialog title="Contact Sales" onClose={() => setContactingSales(false)}>
          <p className="text-sm text-muted-foreground">
            Enterprise pricing is tailored to your organization. Reach out and our team will follow up with a custom quote.
          </p>
          <a href="mailto:sales@calixo.io" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Mail size={15} /> sales@calixo.io
          </a>
        </SimpleDialog>
      )}
    </div>
  );
}
