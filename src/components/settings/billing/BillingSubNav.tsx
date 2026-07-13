"use client";

import { CreditCard, Wallet, Receipt, Landmark, ArrowUpCircle } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "current-plan", label: "Current Plan", href: "/dashboard/settings/billing", icon: CreditCard },
  { id: "wallet", label: "AI Credit Wallet", href: "/dashboard/settings/billing/wallet", icon: Wallet },
  { id: "history", label: "Billing History", href: "/dashboard/settings/billing/history", icon: Receipt },
  { id: "payment-methods", label: "Payment Methods", href: "/dashboard/settings/billing/payment-methods", icon: Landmark },
  { id: "upgrade", label: "Upgrade Center", href: "/dashboard/settings/billing/upgrade", icon: ArrowUpCircle },
];

/** Exactly 5 sections, per the brief — Current Plan is the default landing page. */
export function BillingSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/billing" />
    </div>
  );
}
