"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { BillingSubNav } from "@/components/settings/billing/BillingSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function BillingLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadBilling } = useSettingsContext();

  if (hydrated && !canReadBilling) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Billing & Plans" description="Ask an administrator to grant the billing:read permission." />
      </div>
    );
  }

  return (
    <div>
      <BillingSubNav />
      {children}
    </div>
  );
}
