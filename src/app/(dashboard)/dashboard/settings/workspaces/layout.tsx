"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { WorkspacesSubNav } from "@/components/settings/workspaces/WorkspacesSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function WorkspacesLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadWorkspaces } = useSettingsContext();

  if (hydrated && !canReadWorkspaces) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Workspaces" description="Ask an administrator to grant the workspace:read permission." />
      </div>
    );
  }

  return (
    <div>
      <WorkspacesSubNav />
      {children}
    </div>
  );
}
