"use client";

/**
 * Calixo Workspaces - Activity section state.
 * Merges two real sources, same two-source pattern as Roles & Permissions'
 * Policies page: `core/users.ActivityEngine` (people-level events — already
 * has friendly `description`s from Round 10's seed, e.g. "Joined Marketing")
 * and `workspacePlatformAPI.getAuditTrail()` (workspace-level events —
 * created/updated/archived/member-removed, real, recorded by every
 * `WorkspaceEngine` mutation). Both translated to one merged, sorted,
 * plain-language timeline.
 */

import { useCallback, useEffect, useState } from "react";
import { activityEngine, userRegistry } from "@/core/users";
import { workspacePlatformAPI } from "@/core/platform/workspaces";

export interface WorkspaceActivityItem {
  id: string;
  actor: string;
  description: string;
  timestamp: string;
}

const WORKSPACE_ACTION_LABELS: Record<string, (targetName: string) => string> = {
  "workspace.created": () => "Workspace created",
  "workspace.updated": () => "Workspace details updated",
  "workspace.archived": () => "Workspace archived",
  "workspace.member-removed": targetName => `${targetName} left the workspace`,
};

export function useWorkspaceActivity(organizationId: string, workspaceId: string, memberIds: string[]) {
  const [items, setItems] = useState<WorkspaceActivityItem[]>([]);

  const refresh = useCallback(() => {
    const memberIdSet = new Set(memberIds);
    const peopleEvents = activityEngine
      .history({ organizationId, limit: 200 })
      .filter(event => memberIdSet.has(event.userId))
      .map(event => ({
        id: event.id,
        actor: userRegistry.lookup(event.userId)?.displayName ?? "Someone",
        description: event.description,
        timestamp: event.createdAt,
      }));

    const workspaceEvents = workspacePlatformAPI.getAuditTrail(workspaceId).map(entry => {
      const targetName = entry.target ? (userRegistry.lookup(entry.target)?.displayName ?? entry.target) : "";
      const label = WORKSPACE_ACTION_LABELS[entry.action]?.(targetName) ?? entry.action;
      return {
        id: entry.id,
        actor: userRegistry.lookup(entry.actorId)?.displayName ?? "Someone",
        description: label,
        timestamp: entry.timestamp,
      };
    });

    setItems([...peopleEvents, ...workspaceEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, [organizationId, workspaceId, memberIds]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  return { items, refresh };
}

export type UseWorkspaceActivityResult = ReturnType<typeof useWorkspaceActivity>;
