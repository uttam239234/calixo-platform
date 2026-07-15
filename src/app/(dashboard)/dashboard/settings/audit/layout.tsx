"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { AuditSubNav } from "@/components/settings/audit/AuditSubNav";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";

export default function AuditLayout({ children }: { children: ReactNode }) {
  const { hydrated, canReadAudit } = useSettingsContext();

  if (hydrated && !canReadAudit) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Audit Logs" description="Ask an administrator to grant the audit:read permission." />
      </div>
    );
  }

  return (
    <div>
      <AuditSubNav />
      {children}
    </div>
  );
}
