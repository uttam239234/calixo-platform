"use client";

/**
 * Calixo Users & Teams Center - team list/hierarchy/creation state.
 * The only place allowed to call TeamRegistry — components never import
 * it directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateId } from "@/shared/utils/string";
import { teamRegistry } from "@/core/users";
import type { Team } from "@/core/users";

export interface CreateTeamInput {
  name: string;
  description?: string;
  workspaceId: string;
  parentTeamId?: string;
  color?: string;
  icon?: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTeams(teamRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const selectedTeam = useMemo(() => (selectedTeamId ? (teamRegistry.lookup(selectedTeamId) ?? null) : null), [selectedTeamId]);

  const hierarchy = useCallback((workspaceId?: string) => teamRegistry.hierarchy(workspaceId), []);
  const parentTeams = useCallback((teamId: string) => teamRegistry.parentTeams(teamId), []);
  const childTeams = useCallback((teamId: string) => teamRegistry.childTeams(teamId), []);
  const teamMembers = useCallback((teamId: string) => teamRegistry.teamMembers(teamId), []);
  const lookup = useCallback((teamId: string) => teamRegistry.lookup(teamId), []);

  const createTeam = useCallback(
    (input: CreateTeamInput): Team => {
      const now = new Date().toISOString();
      const team: Team = {
        id: `team-${generateId(10)}`,
        name: input.name,
        description: input.description,
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
    teamMembers,
    lookup,
    createTeam,
    refresh,
  };
}

export type UseTeamsResult = ReturnType<typeof useTeams>;
