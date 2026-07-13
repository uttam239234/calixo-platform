"use client";

import { Link2, Store, ShieldCheck, Activity as ActivityIcon, History } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "connected-apps", label: "Connected Apps", href: "/dashboard/settings/integrations", icon: Link2 },
  { id: "marketplace", label: "App Marketplace", href: "/dashboard/settings/integrations/marketplace", icon: Store },
  { id: "permissions", label: "Permissions", href: "/dashboard/settings/integrations/permissions", icon: ShieldCheck },
  { id: "sync-status", label: "Sync Status", href: "/dashboard/settings/integrations/sync-status", icon: ActivityIcon },
  { id: "activity", label: "Activity", href: "/dashboard/settings/integrations/activity", icon: History },
];

/** Exactly 5 sections, per the brief — Connected Apps is the default landing page. */
export function IntegrationsSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/integrations" />
    </div>
  );
}
