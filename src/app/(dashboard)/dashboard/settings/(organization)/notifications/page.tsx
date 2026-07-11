"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { WhatDoesThisDo } from "@/components/ui/Tooltip";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { notificationsPlatformAPI } from "@/communication";
import type { OrganizationNotificationPreferences } from "@/communication";

const TOGGLES: { key: keyof Omit<OrganizationNotificationPreferences, "organizationId" | "updatedAt">; label: string; description: string }[] = [
  { key: "email", label: "Email Notifications", description: "Send notifications to your organization's members by email, in addition to in-app." },
  { key: "product", label: "Product Notifications", description: "Updates about new Calixo features and improvements." },
  { key: "scheduledReports", label: "Scheduled Report Notifications", description: "Let people know when a scheduled report is ready." },
  { key: "workflow", label: "Workflow Notifications", description: "Alerts when a workflow or approval needs attention." },
  { key: "security", label: "Security Notifications", description: "Sign-in, permission, and other account security alerts. Recommended to keep on." },
  { key: "ai", label: "AI Notifications", description: "Updates when an AI-generated report, insight, or piece of content is ready." },
];

export default function NotificationsPage() {
  const { organization, canUpdate, tenantContext, showToast } = useSettingsContext();
  const [prefs, setPrefs] = useState<OrganizationNotificationPreferences | null>(null);

  useEffect(() => {
    (async () => {
      if (organization) setPrefs(notificationsPlatformAPI.getPreferences(organization.id));
    })();
  }, [organization]);

  if (!organization || !prefs) return null;

  function handleToggle(key: (typeof TOGGLES)[number]["key"], value: boolean) {
    if (!canUpdate) {
      showToast("You don't have permission to change notification settings.");
      return;
    }
    const updated = notificationsPlatformAPI.updatePreferences(tenantContext.organizationId, { [key]: value });
    setPrefs(updated);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what your organization gets notified about. No technical details, just on or off.</p>
      </div>
      <Card padding="none">
        <div className="divide-y divide-border/60">
          {TOGGLES.map(t => (
            <div key={t.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {t.label}
                  <WhatDoesThisDo>{t.description}</WhatDoesThisDo>
                </p>
              </div>
              <Toggle checked={prefs[t.key]} onChange={v => handleToggle(t.key, v)} disabled={!canUpdate} label={t.label} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
