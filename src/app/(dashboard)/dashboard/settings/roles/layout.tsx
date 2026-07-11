"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { RolesSubNav } from "@/components/settings/roles/RolesSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function RolesLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadRoles } = useSettingsContext();

  if (hydrated && !canReadRoles) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Roles & Permissions" description="Ask an administrator to grant the role:read permission." />
      </div>
    );
  }

  return (
    <div>
      <RolesSubNav />
      {children}
    </div>
  );
}
