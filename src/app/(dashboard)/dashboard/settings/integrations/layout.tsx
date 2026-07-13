"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { IntegrationsSubNav } from "@/components/settings/integrations/IntegrationsSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadIntegrations } = useSettingsContext();

  if (hydrated && !canReadIntegrations) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Integrations" description="Ask an administrator to grant the connector:read permission." />
      </div>
    );
  }

  return (
    <div>
      <IntegrationsSubNav />
      {children}
    </div>
  );
}
