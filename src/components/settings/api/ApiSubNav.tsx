"use client";

import { Zap, Key, Webhook, Activity, Code2 } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "automations", label: "Connected Automations", href: "/dashboard/settings/api", icon: Zap },
  { id: "keys", label: "API Keys", href: "/dashboard/settings/api/keys", icon: Key },
  { id: "webhooks", label: "Webhooks", href: "/dashboard/settings/api/webhooks", icon: Webhook },
  { id: "activity", label: "Activity", href: "/dashboard/settings/api/activity", icon: Activity },
  { id: "developer", label: "Developer Mode", href: "/dashboard/settings/api/developer", icon: Code2 },
];

export function ApiSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/api" />
    </div>
  );
}
