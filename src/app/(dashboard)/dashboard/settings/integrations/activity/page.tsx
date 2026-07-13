"use client";

import { ModuleHeader, ActivityTimeline, type ActivityItem } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useIntegrations } from "@/hooks/useIntegrations";
import { formatRelativeTime } from "@/shared/utils/date";

export default function IntegrationActivityPage() {
  const { tenantContext } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const integrations = useIntegrations(organizationId);

  const items: ActivityItem[] = integrations.activity.map(entry => ({
    id: entry.id,
    actor: "",
    action: entry.description,
    timestamp: formatRelativeTime(entry.timestamp),
  }));

  return (
    <div>
      <ModuleHeader title="Activity" description="A readable timeline of what happened with each connected app." />
      <ActivityTimeline activities={items} title="Integration Activity" maxItems={items.length || 1} />
    </div>
  );
}
