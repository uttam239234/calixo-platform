/**
 * Calixo Platform - Mock Users Generator
 */

import { generateId } from "@/shared/utils/string";
import { PRESENCE_STATUSES } from "../types/index";
import type { Team, User, UserStatus } from "../types/index";
import { DEPARTMENTS, FIRST_NAMES, JOB_TITLES, LAST_NAMES, TIMEZONES, USER_STATUS_WEIGHTED, WORKSPACES, daysAgoISO, pick, pseudoRandomInt } from "./data";

function groupTeamsByWorkspace(teams: Team[]): Record<string, Team[]> {
  const groups: Record<string, Team[]> = {};
  for (const team of teams) (groups[team.workspaceId] ??= []).push(team);
  return groups;
}

export function generateMockUsers(count = 250, teams: Team[]): User[] {
  const teamsByWorkspace = groupTeamsByWorkspace(teams);
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const workspace = pick(WORKSPACES, i);
    const department = pick(DEPARTMENTS, i + 3);
    const title = pick(JOB_TITLES, i + 5);
    const firstName = pick(FIRST_NAMES, i);
    const lastName = pick(LAST_NAMES, i + 7);
    const displayName = `${firstName} ${lastName}`;
    const username = `${firstName}.${lastName}${i}`.toLowerCase();
    const email = `${firstName}.${lastName}${i}@calixo-demo.io`.toLowerCase();

    const workspaceTeams = teamsByWorkspace[workspace.id] ?? [];
    const teamIds: string[] = [];
    if (workspaceTeams.length > 0) {
      teamIds.push(pick(workspaceTeams, i).id);
      if (workspaceTeams.length > 1 && i % 4 === 0) teamIds.push(pick(workspaceTeams, i + 2).id);
    }

    users.push({
      id: `user-${generateId(10)}`,
      username,
      displayName,
      email,
      phone: i % 5 === 0 ? `+1${pseudoRandomInt(2000000000, 9999999999, i)}` : undefined,
      avatar: undefined,
      title,
      department,
      status: pick(USER_STATUS_WEIGHTED, i) as UserStatus,
      presence: pick(PRESENCE_STATUSES, i + 2),
      timezone: pick(TIMEZONES, i),
      locale: "en-US",
      language: "en",
      workspaceId: workspace.id,
      teamIds,
      managerId: undefined,
      roleIds: i % 20 === 0 ? ["role-admin"] : ["role-member"],
      permissions: i % 20 === 0 ? ["users.manage", "teams.manage"] : ["users.view"],
      featureFlags: i % 8 === 0 ? ["beta-features"] : [],
      tags: i % 6 === 0 ? ["mock", "vip"] : ["mock"],
      preferences: { theme: "system", notifications: { email: i % 2 === 0 } },
      metadata: {},
      createdAt: daysAgoISO(pseudoRandomInt(10, 1000, i)),
      updatedAt: daysAgoISO(pseudoRandomInt(0, 10, i + 1)),
    });
  }

  for (let i = 0; i < users.length; i++) {
    if (i === 0 || i % 3 !== 0) continue;
    const user = users[i];
    const candidates = users.slice(0, i).filter(u => u.teamIds.some(t => user.teamIds.includes(t)));
    if (candidates.length > 0) user.managerId = pick(candidates, i).id;
  }

  return users;
}
