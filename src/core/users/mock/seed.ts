/**
 * Calixo Platform - Users & Teams Platform Mock Data Seeding
 *
 * Opt-in only — never called automatically. Populates the registries,
 * invitation engine, activity engine, and presence engine with realistic
 * demo data (250 users, 40 teams, 120 invitations, 1000 activity events)
 * across 8 workspaces / 15 departments / 12 job titles, for development,
 * demos, and future UI work.
 */

import { userRegistry, UserRegistry } from "../registry/UserRegistry";
import { teamRegistry, TeamRegistry } from "../teams/TeamRegistry";
import { invitationEngine, InvitationEngine } from "../invitation/InvitationEngine";
import { activityEngine, ActivityEngine } from "../activity/ActivityEngine";
import { presenceEngine, PresenceEngine } from "../presence/PresenceEngine";
import { DEPARTMENTS, JOB_TITLES, WORKSPACES } from "./data";
import { generateMockTeams } from "./mockTeams";
import { generateMockUsers } from "./mockUsers";
import { generateMockInvitations } from "./mockInvitations";
import { generateMockActivity } from "./mockActivity";

export interface UsersMockSeedResult {
  users: number;
  teams: number;
  departments: number;
  jobTitles: number;
  workspaces: number;
  invitations: number;
  activityEvents: number;
}

export function seedUsersPlatformMockData(deps: {
  registry?: UserRegistry;
  teams?: TeamRegistry;
  invitations?: InvitationEngine;
  activity?: ActivityEngine;
  presence?: PresenceEngine;
} = {}): UsersMockSeedResult {
  const registry = deps.registry ?? userRegistry;
  const teams = deps.teams ?? teamRegistry;
  const invitations = deps.invitations ?? invitationEngine;
  const activity = deps.activity ?? activityEngine;
  const presence = deps.presence ?? presenceEngine;

  const mockTeams = generateMockTeams(40);
  teams.registerMany(mockTeams);

  const mockUsers = generateMockUsers(250, mockTeams);
  registry.registerMany(mockUsers);

  for (const team of mockTeams) {
    team.memberIds = mockUsers.filter(u => u.teamIds.includes(team.id)).map(u => u.id);
    if (!team.managerId && team.memberIds.length > 0) team.managerId = team.memberIds[0];
  }

  for (const user of mockUsers) {
    presence.setStatus(user.id, user.presence);
    if (user.presence !== "offline") presence.startSession(user.id, "web");
  }

  const mockInvitations = generateMockInvitations(120, mockUsers, mockTeams, invitations);
  const mockActivityEvents = generateMockActivity(1000, mockUsers, activity);

  return {
    users: mockUsers.length,
    teams: mockTeams.length,
    departments: DEPARTMENTS.length,
    jobTitles: JOB_TITLES.length,
    workspaces: WORKSPACES.length,
    invitations: mockInvitations.length,
    activityEvents: mockActivityEvents.length,
  };
}
