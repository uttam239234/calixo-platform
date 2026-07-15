"use client";

import { ModuleHeader, ActivityTimeline } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAudit } from "@/features/settings/audit/useAudit";
import { toActivityItems } from "@/features/settings/audit/normalize";

export default function AuditFeedPage() {
  const { tenantContext } = useSettingsContext();
  const audit = useAudit(tenantContext.organizationId);

  return (
    <div className="space-y-6">
      <ModuleHeader title="Activity Feed" description="What happened, who did it, and when — in plain language." />

      <ActivityTimeline
        activities={toActivityItems(audit.filteredItems)}
        loading={audit.loading}
        maxItems={audit.filteredItems.length || 1}
        title="Everything that happened"
      />

      {audit.isInternalStaff && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Internal Only — Calixo Staff</p>
          <ActivityTimeline
            activities={toActivityItems(audit.platformAdminItems)}
            loading={audit.loading}
            maxItems={audit.platformAdminItems.length || 1}
            title="Platform Admin Logs"
            description="Changes made in the Internal Plan Management Console — never visible to customers."
          />
        </div>
      )}
    </div>
  );
}
