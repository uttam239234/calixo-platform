"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ModuleHeader, ActivityTimeline, type ActivityItem } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useWorkspaceActivity } from "@/hooks/useWorkspaceActivity";
import { formatRelativeTime } from "@/shared/utils/date";

export default function WorkspaceActivityPage() {
  const { tenantContext } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const workspaces = useWorkspaces(organizationId);
  const openedWorkspaceId = useSearchParams().get("workspace");

  const [selectedId, setSelectedId] = useState("");
  const activeId = selectedId || openedWorkspaceId || workspaces.cards[0]?.workspace.id || "";
  const card = workspaces.lookup(activeId);
  const activity = useWorkspaceActivity(organizationId, activeId, card?.memberIds ?? []);

  const items: ActivityItem[] = activity.items.map(event => ({
    id: event.id,
    actor: event.actor,
    action: event.description,
    timestamp: formatRelativeTime(event.timestamp),
  }));

  return (
    <div>
      <ModuleHeader title="Activity" description="A readable timeline of what happened in each workspace." />

      <div className="mb-6 max-w-xs">
        <label className="label">Workspace</label>
        <select className="input" value={activeId} onChange={e => setSelectedId(e.target.value)}>
          {workspaces.cards.map(c => (
            <option key={c.workspace.id} value={c.workspace.id}>
              {c.workspace.name}
            </option>
          ))}
        </select>
      </div>

      <ActivityTimeline activities={items} title={card ? `${card.workspace.name} Activity` : "Activity"} maxItems={items.length || 1} />
    </div>
  );
}
