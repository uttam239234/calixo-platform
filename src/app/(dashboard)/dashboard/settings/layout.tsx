import type { ReactNode } from "react";
import { SettingsProvider } from "@/features/settings/SettingsProvider";
import { SettingsAdminSidebar } from "@/components/settings/SettingsAdminSidebar";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  // Settings is deliberately not tier-gated (`requireModuleAccess` skips the
  // plan check for this module id — every customer, on every plan, must
  // always reach their own billing/account settings) — this is a real,
  // permission-only check.
  const { allowed, result } = await requireModuleAccess("settings");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Settings" result={result} />;

  return (
    <SettingsProvider>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <SettingsAdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </SettingsProvider>
  );
}
