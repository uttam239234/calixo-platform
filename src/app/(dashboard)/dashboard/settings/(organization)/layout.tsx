"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const { hydrated, canRead } = useSettingsContext();

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Organization" description="Ask an administrator to grant the settings:read permission." />
      </div>
    );
  }

  return (
    <div>
      <SettingsSubNav />
      {children}
    </div>
  );
}
