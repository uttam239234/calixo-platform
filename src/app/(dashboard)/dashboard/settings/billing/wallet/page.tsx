"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/settings/billing/ProgressBar";
import { UsageAlertBanner } from "@/components/settings/billing/UsageAlertBanner";
import { BuyCreditsDialog } from "@/components/settings/billing/BuyCreditsDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useBilling } from "@/hooks/useBilling";

export default function AiCreditWalletPage() {
  const router = useRouter();
  const { tenantContext, canUpdateBilling, showToast } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const billing = useBilling(organizationId);
  const [buyingCredits, setBuyingCredits] = useState(false);

  if (billing.loading || !billing.wallet) {
    return (
      <div>
        <ModuleHeader title="AI Credit Wallet" description="How many AI credits you have left, and when they reset." />
        <p className="text-sm text-muted-foreground">Loading your wallet…</p>
      </div>
    );
  }

  const { wallet } = billing;
  const includedPercentRemaining = wallet.includedLimit > 0 ? Math.round((wallet.includedRemaining / wallet.includedLimit) * 100) : 0;
  const includedTone = wallet.percentIncludedUsed >= 100 ? "critical" : wallet.percentIncludedUsed >= 80 ? "warning" : "good";

  return (
    <div>
      <ModuleHeader
        title="AI Credit Wallet"
        description="How many credits you have left, where they came from, and when they reset."
        quickActions={
          canUpdateBilling && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/settings/billing/upgrade")}>
                Upgrade Plan
              </Button>
              <Button onClick={() => setBuyingCredits(true)}>
                <Zap size={16} />
                Buy Credits
              </Button>
            </div>
          )
        }
      />

      <UsageAlertBanner
        percentIncludedUsed={wallet.percentIncludedUsed}
        onBuyCredits={() => setBuyingCredits(true)}
        onUpgradePlan={() => router.push("/dashboard/settings/billing/upgrade")}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="space-y-5">
            <ProgressBar
              label="Included Monthly Credits"
              value={`${wallet.includedRemaining.toLocaleString()} remaining`}
              percent={includedPercentRemaining}
              tone={includedTone}
            />
            <ProgressBar
              label="Purchased Credits"
              value={`${wallet.purchasedRemaining.toLocaleString()} remaining`}
              percent={wallet.purchasedRemaining > 0 ? 100 : 0}
            />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <div>
              <p className="text-xs text-muted-foreground">Total Available Credits</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{wallet.totalAvailable.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next Monthly Reset</p>
              <p className="mt-1 font-semibold text-foreground">{wallet.nextResetAt ? new Date(wallet.nextResetAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">How credits work</p>
          <ul className="space-y-1.5">
            <li>1. Your plan&apos;s included credits are used first.</li>
            <li>2. Once those run out, purchased credit packs are used next.</li>
            <li>3. If you run out of both, you&apos;ll be asked to buy more or upgrade.</li>
          </ul>
        </div>
      </div>

      {buyingCredits && (
        <BuyCreditsDialog
          packs={billing.creditPacks}
          onClose={() => setBuyingCredits(false)}
          onBuy={packId => {
            billing.buyCredits(packId);
            showToast("Credits added to your wallet.");
          }}
        />
      )}
    </div>
  );
}
