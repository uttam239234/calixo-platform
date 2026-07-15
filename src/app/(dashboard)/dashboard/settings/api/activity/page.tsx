"use client";

import { ModuleHeader, ActivityTimeline } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useApiActivity } from "@/features/settings/api/useApiActivity";

export default function ApiActivityPage() {
  const { tenantContext } = useSettingsContext();
  const activity = useApiActivity(tenantContext.organizationId);

  return (
    <div className="space-y-6">
      <ModuleHeader title="Activity" description="What your automations and API keys have done, in plain language." />
      <ActivityTimeline
        activities={activity.items}
        loading={activity.loading}
        title="Recent Activity"
        description="Webhook deliveries and API key changes, most recent first"
        maxItems={50}
      />
    </div>
  );
}
