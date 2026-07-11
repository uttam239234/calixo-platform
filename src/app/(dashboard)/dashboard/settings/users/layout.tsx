"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { UsersSubNav } from "@/components/settings/users/UsersSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function UsersLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadUsers } = useSettingsContext();

  if (hydrated && !canReadUsers) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Users & Teams" description="Ask an administrator to grant the user:read permission." />
      </div>
    );
  }

  return (
    <div>
      <UsersSubNav />
      {children}
    </div>
  );
}
