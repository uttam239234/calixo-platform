"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useWorkspaceAccess } from "@/hooks/useWorkspaceAccess";
import { iconForDepartment } from "@/features/settings/workspaces/constants";

export default function WorkspaceAccessPage() {
  const { tenantContext } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const workspaces = useWorkspaces(organizationId);
  const openedWorkspaceId = useSearchParams().get("workspace");

  const [selectedId, setSelectedId] = useState("");
  const activeId = selectedId || openedWorkspaceId || workspaces.cards[0]?.workspace.id || "";
  const card = workspaces.lookup(activeId);
  const access = useWorkspaceAccess(organizationId, card?.memberIds ?? []);

  return (
    <div>
      <ModuleHeader title="Access" description="What each workspace can access, in plain language." />

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

      {card && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 flex items-center gap-2 text-base">
            <span className="text-xl">{iconForDepartment(card.workspace.name)}</span>
            <span className="font-semibold text-foreground">{card.workspace.name} Workspace</span>
            <span className="text-muted-foreground">can access:</span>
          </p>
          {card.memberCount === 0 ? (
            <p className="text-sm text-muted-foreground">No one is in this workspace yet, so it can&apos;t access anything.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {access.featureAccess.map(({ feature, allowed }) => (
                <li key={feature.id} className="flex items-center gap-2.5 text-sm">
                  {allowed ? <Check size={16} className="flex-shrink-0 text-success" /> : <X size={16} className="flex-shrink-0 text-muted-foreground" />}
                  <span className={allowed ? "text-foreground" : "text-muted-foreground"}>{feature.label}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">Based on the real access level of everyone currently in this workspace — the same roles and permissions as Roles &amp; Permissions.</p>
        </div>
      )}
    </div>
  );
}
