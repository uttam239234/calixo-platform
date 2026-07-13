"use client";

/**
 * Calixo Workspaces - "Departments and Teams Center" list/CRUD state.
 * The only place allowed to call `workspacePlatformAPI` for this module —
 * components never import it directly. Scoped to a single organization.
 *
 * Workspace and Team are 1:1 by construction this round (see
 * `seedDepartmentWorkspaces.ts`) — every read here composes a real
 * `Workspace` with its paired real `Team` (lead, members, color) into one
 * `WorkspaceCard`, and every write keeps the pair in sync.
 */

import { useCallback, useEffect, useState } from "react";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import type { Workspace } from "@/core/platform/workspaces";
import { teamRegistry, userRegistry } from "@/core/users";
import type { Team } from "@/core/users";
import { getConnectionsForWorkspace } from "@/features/settings/integrations/workspaceVisibility";

/** No real login flow exists yet — same fallback convention every module uses locally. */
const DEMO_ACTOR_ID = "user-current";

export interface WorkspaceCard {
  workspace: Workspace;
  team: Team | null;
  leadId?: string;
  leadName?: string;
  memberIds: string[];
  memberCount: number;
  lastActivityAt?: string;
  connectedIntegrations: number;
  reportsCount: number;
  contentCount: number;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  color?: string;
}

function buildCard(workspace: Workspace): WorkspaceCard {
  const team = teamRegistry.list({ organizationId: workspace.organizationId }).find(t => t.workspaceId === workspace.id) ?? null;
  const lead = team?.managerId ? userRegistry.lookup(team.managerId) : undefined;
  const audit = workspacePlatformAPI.getAuditTrail(workspace.id);
  return {
    workspace,
    team,
    leadId: team?.managerId,
    leadName: lead?.displayName,
    memberIds: team?.memberIds ?? [],
    memberCount: team?.memberIds.length ?? workspace.memberCount,
    lastActivityAt: audit[0]?.timestamp,
    // Integrations now has a real per-workspace visibility store (see
    // `workspaceVisibility.ts`) — Reports/Content still have no per-workspace
    // data source anywhere in the platform, so those stay real zeros.
    connectedIntegrations: getConnectionsForWorkspace(workspace.id).length,
    reportsCount: 0,
    contentCount: 0,
  };
}

export function useWorkspaces(organizationId: string) {
  const [cards, setCards] = useState<WorkspaceCard[]>([]);

  const refresh = useCallback(() => {
    const workspaces = workspacePlatformAPI.list({ organizationId });
    setCards(workspaces.map(buildCard).sort((a, b) => a.workspace.name.localeCompare(b.workspace.name)));
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const lookup = useCallback((workspaceId: string) => cards.find(c => c.workspace.id === workspaceId), [cards]);

  /** Create Department = one real Workspace + its paired real Team, in a single action. */
  const createDepartment = useCallback(
    (input: CreateWorkspaceInput) => {
      const workspace = workspacePlatformAPI.create({ organizationId, name: input.name, description: input.description, type: "team" }, DEMO_ACTOR_ID);
      const team: Team = {
        id: `team-${workspace.id}`,
        name: input.name,
        description: input.description,
        organizationId,
        workspaceId: workspace.id,
        parentTeamId: undefined,
        childTeamIds: [],
        memberIds: [],
        managerId: undefined,
        color: input.color,
        icon: undefined,
        metadata: {},
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
      teamRegistry.register(team);
      refresh();
      return workspace;
    },
    [organizationId, refresh]
  );

  const updateDepartment = useCallback(
    (workspaceId: string, input: { name?: string; description?: string }) => {
      const updated = workspacePlatformAPI.update(workspaceId, { name: input.name, description: input.description }, DEMO_ACTOR_ID);
      const team = teamRegistry.list({ organizationId }).find(t => t.workspaceId === workspaceId);
      if (team) {
        if (input.name) team.name = input.name;
        if (input.description !== undefined) team.description = input.description;
        team.updatedAt = new Date().toISOString();
      }
      refresh();
      return updated;
    },
    [organizationId, refresh]
  );

  const archiveDepartment = useCallback(
    (workspaceId: string) => {
      const archived = workspacePlatformAPI.archive(workspaceId, DEMO_ACTOR_ID);
      const team = teamRegistry.list({ organizationId }).find(t => t.workspaceId === workspaceId);
      if (team) teamRegistry.archive(team.id);
      refresh();
      return archived;
    },
    [organizationId, refresh]
  );

  /** Moves a person into this workspace (and its paired team) — the drag-and-drop assignment target on the Members page. Leaves them on any other teams they hold; only their primary `workspaceId` and this team's roster change. */
  const moveMember = useCallback(
    (userId: string, fromWorkspaceId: string | undefined, toWorkspaceId: string) => {
      const toTeam = teamRegistry.list({ organizationId }).find(t => t.workspaceId === toWorkspaceId);
      const fromTeam = fromWorkspaceId ? teamRegistry.list({ organizationId }).find(t => t.workspaceId === fromWorkspaceId) : undefined;
      if (!toTeam) return;

      if (fromTeam && fromTeam.id !== toTeam.id) {
        fromTeam.memberIds = fromTeam.memberIds.filter(id => id !== userId);
        fromTeam.updatedAt = new Date().toISOString();
      }
      if (!toTeam.memberIds.includes(userId)) {
        toTeam.memberIds = [...toTeam.memberIds, userId];
        toTeam.updatedAt = new Date().toISOString();
      }

      const user = userRegistry.lookup(userId);
      if (user) {
        user.workspaceId = toWorkspaceId;
        user.teamIds = Array.from(new Set([...user.teamIds.filter(id => id !== fromTeam?.id), toTeam.id]));
        user.updatedAt = new Date().toISOString();
      }
      refresh();
    },
    [organizationId, refresh]
  );

  return {
    cards,
    lookup,
    createDepartment,
    updateDepartment,
    archiveDepartment,
    moveMember,
    refresh,
  };
}

export type UseWorkspacesResult = ReturnType<typeof useWorkspaces>;
