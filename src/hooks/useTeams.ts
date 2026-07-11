"use client";

/**
 * Calixo Users & Teams Center - team list/hierarchy/creation state.
 * The only place allowed to call TeamRegistry — components never import
 * it directly. Scoped to a single organization.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateId } from "@/shared/utils/string";
import { teamRegistry, userRegistry, userEngine } from "@/core/users";
import type { Team } from "@/core/users";

export interface CreateTeamInput {
  name: string;
  description?: string;
  workspaceId: string;
  parentTeamId?: string;
  color?: string;
  icon?: string;
}

export function useTeams(organizationId: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTeams(teamRegistry.list({ organizationId }));
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  // `TeamRegistry` has no override/storage layer — `lookup()` always returns the same live, in-place-mutated object, so re-deriving on `teams` changes is redundant (see `useUsers`'s engine-merge pattern for the contrasting case where it isn't safe to drop).
  const selectedTeam = useMemo(() => (selectedTeamId ? (teamRegistry.lookup(selectedTeamId) ?? null) : null), [selectedTeamId]);

  const hierarchy = useCallback(() => teamRegistry.hierarchy({ organizationId }), [organizationId]);
  const parentTeams = useCallback((teamId: string) => teamRegistry.parentTeams(teamId), []);
  const childTeams = useCallback((teamId: string) => teamRegistry.childTeams(teamId), []);
  const lookup = useCallback((teamId: string) => teams.find(t => t.id === teamId), [teams]);

  const createTeam = useCallback(
    (input: CreateTeamInput): Team => {
      const now = new Date().toISOString();
      const team: Team = {
        id: `team-${generateId(10)}`,
        name: input.name,
        description: input.description,
        organizationId,
        workspaceId: input.workspaceId,
        parentTeamId: input.parentTeamId,
        childTeamIds: [],
        memberIds: [],
        managerId: undefined,
        color: input.color,
        icon: input.icon,
        metadata: {},
        createdAt: now,
        updatedAt: now,
      };
      teamRegistry.register(team);
      refresh();
      return team;
    },
    [organizationId, refresh]
  );

  const renameTeam = useCallback(
    (teamId: string, name: string) => {
      const team = teamRegistry.lookup(teamId);
      if (!team) return;
      team.name = name;
      team.updatedAt = new Date().toISOString();
      refresh();
    },
    [refresh]
  );

  const archiveTeam = useCallback(
    (teamId: string) => {
      teamRegistry.archive(teamId);
      refresh();
    },
    [refresh]
  );

  /** Adds people to a team — the cross-registry write TeamRegistry's own docs call a "hook-level concern". */
  const addMembers = useCallback(
    (teamId: string, userIds: string[]) => {
      const team = teamRegistry.lookup(teamId);
      if (!team) return;
      team.memberIds = Array.from(new Set([...team.memberIds, ...userIds]));
      team.updatedAt = new Date().toISOString();
      for (const userId of userIds) {
        const user = userEngine.load(userId) ?? userRegistry.lookup(userId);
        if (user && !user.teamIds.includes(teamId)) userEngine.save(userId, { teamIds: [...user.teamIds, teamId] });
      }
      refresh();
    },
    [refresh]
  );

  const removeMembers = useCallback(
    (teamId: string, userIds: string[]) => {
      const team = teamRegistry.lookup(teamId);
      if (!team) return;
      team.memberIds = team.memberIds.filter(id => !userIds.includes(id));
      team.updatedAt = new Date().toISOString();
      for (const userId of userIds) {
        const user = userEngine.load(userId) ?? userRegistry.lookup(userId);
        if (user) userEngine.save(userId, { teamIds: user.teamIds.filter(id => id !== teamId) });
      }
      refresh();
    },
    [refresh]
  );

  return {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    selectedTeam,
    hierarchy,
    parentTeams,
    childTeams,
    lookup,
    createTeam,
    renameTeam,
    archiveTeam,
    addMembers,
    removeMembers,
    refresh,
  };
}

export type UseTeamsResult = ReturnType<typeof useTeams>;
