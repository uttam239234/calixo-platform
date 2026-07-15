"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { ApiSubNav } from "@/components/settings/api/ApiSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function ApiLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadApi } = useSettingsContext();

  if (hydrated && !canReadApi) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to API & Webhooks" description="Ask an administrator to grant the api:read permission." />
      </div>
    );
  }

  return (
    <div>
      <ApiSubNav />
      {children}
    </div>
  );
}
