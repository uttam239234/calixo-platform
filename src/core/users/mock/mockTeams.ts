/**
 * Calixo Platform - Mock Teams Generator
 */

import { generateId } from "@/shared/utils/string";
import type { Team } from "../types/index";
import { TEAM_FUNCTIONS, WORKSPACES, daysAgoISO, pick, pseudoRandomInt } from "./data";

const TEAM_COLORS = ["#4F46E5", "#0EA5E9", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#DB2777"];
const TEAM_ICONS = ["users", "layers", "target", "compass", "briefcase", "megaphone", "database", "shield"];

export function generateMockTeams(count = 40): Team[] {
  const perWorkspace = Math.ceil(count / WORKSPACES.length);
  const teams: Team[] = [];
  let index = 0;

  for (const workspace of WORKSPACES) {
    const workspaceTeams: Team[] = [];

    for (let w = 0; w < perWorkspace && index < count; w++, index++) {
      const fn = pick(TEAM_FUNCTIONS, index + w);
      const team: Team = {
        id: `team-${generateId(10)}`,
        name: `${workspace.name} ${fn}`,
        description: `${fn} team for ${workspace.name}.`,
        workspaceId: workspace.id,
        parentTeamId: undefined,
        childTeamIds: [],
        memberIds: [],
        managerId: undefined,
        color: TEAM_COLORS[index % TEAM_COLORS.length],
        icon: TEAM_ICONS[index % TEAM_ICONS.length],
        metadata: {},
        createdAt: daysAgoISO(pseudoRandomInt(60, 900, index)),
        updatedAt: daysAgoISO(pseudoRandomInt(0, 45, index + 1)),
      };
      workspaceTeams.push(team);
      teams.push(team);
    }

    const [rootTeam, ...rest] = workspaceTeams;
    if (rootTeam) {
      for (const child of rest.slice(0, 2)) {
        child.parentTeamId = rootTeam.id;
        rootTeam.childTeamIds.push(child.id);
      }
    }
  }

  return teams;
}
