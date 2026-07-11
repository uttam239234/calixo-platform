/**
 * Calixo Platform - Users & Teams Mock Data Seeding
 *
 * Opt-in only — never called automatically. Seeds a small, realistic,
 * hand-shaped roster (see `./rosters.ts`) across the same 4 organizations
 * `seedOrganizationsPlatformMockData()` creates (Royal Global University,
 * Calixo Technologies, MIT WPU, Agency Client A), rather than a large pool
 * of randomized names — isolation across organizations needs to be
 * *visibly* demonstrable, not statistically diluted.
 */

import { userRegistry, UserRegistry } from "../registry/UserRegistry";
import { teamRegistry, TeamRegistry } from "../teams/TeamRegistry";
import { invitationEngine, InvitationEngine } from "../invitation/InvitationEngine";
import { activityEngine, ActivityEngine } from "../activity/ActivityEngine";
import { presenceEngine, PresenceEngine } from "../presence/PresenceEngine";
import { organizationRegistry, seedOrganizationsPlatformMockData } from "@/core/platform/organizations";
import { DEPARTMENTS, JOB_TITLES, WORKSPACES, daysAgoISO, pseudoRandomInt } from "./data";
import { ORG_ROSTERS } from "./rosters";
import type { Invitation, PeopleAccessLevel, Team, User } from "../types/index";

export interface UsersMockSeedResult {
  organizations: number;
  users: number;
  teams: number;
  departments: number;
  jobTitles: number;
  workspaces: number;
  invitations: number;
  activityEvents: number;
}

const INVITE_ACCESS_LEVELS: PeopleAccessLevel[] = ["manager", "member", "member", "viewer"];

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

  // Organizations are the source of truth for which 4 orgs exist — seed
  // them first (idempotent) so every roster below resolves a real id.
  seedOrganizationsPlatformMockData();

  let teamCount = 0;
  let userCount = 0;
  let invitationCount = 0;
  let activityCount = 0;

  ORG_ROSTERS.forEach((roster, orgIndex) => {
    const organization = organizationRegistry.list().find(o => o.name === roster.organizationName);
    if (!organization) return;
    const organizationId = organization.id;
    const workspace = WORKSPACES[orgIndex % WORKSPACES.length];

    const mockTeams: Team[] = roster.teams.map((t, i) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      organizationId,
      workspaceId: workspace.id,
      parentTeamId: undefined,
      childTeamIds: [],
      memberIds: roster.people.filter(p => p.teamIds.includes(t.id)).map(p => p.id),
      managerId: t.leadId,
      color: t.color,
      icon: t.icon,
      metadata: {},
      createdAt: daysAgoISO(pseudoRandomInt(200, 900, i + orgIndex)),
      updatedAt: daysAgoISO(pseudoRandomInt(0, 30, i + orgIndex)),
    }));
    teams.registerMany(mockTeams);
    teamCount += mockTeams.length;

    const mockUsers: User[] = roster.people.map((p, i) => ({
      id: p.id,
      username: `${p.emailLocal}${orgIndex}`,
      displayName: `${p.firstName} ${p.lastName}`,
      email: `${p.emailLocal}@${roster.organizationName.toLowerCase().replace(/[^a-z]/g, "")}.calixo-demo.io`,
      phone: undefined,
      avatar: undefined,
      title: p.title,
      department: p.department,
      status: p.status,
      presence: p.presence,
      timezone: "America/New_York",
      locale: "en-US",
      language: "en",
      organizationId,
      workspaceId: workspace.id,
      teamIds: p.teamIds,
      managerId: undefined,
      accessLevel: p.accessLevel,
      roleIds: [],
      permissions: [],
      featureFlags: [],
      tags: p.isViewer ? ["you"] : [],
      preferences: { theme: "system", notifications: { email: true } },
      metadata: {},
      createdAt: daysAgoISO(pseudoRandomInt(60, 700, i + orgIndex)),
      updatedAt: daysAgoISO(pseudoRandomInt(0, 20, i + orgIndex)),
    }));
    registry.registerMany(mockUsers);
    userCount += mockUsers.length;

    for (const user of mockUsers) {
      presence.setStatus(user.id, user.presence);
      if (user.presence !== "offline") presence.startSession(user.id, "web");
    }

    // Activity: an "organization-joined" event for everyone, plus a
    // scattering of logins/profile-updates/team-joins, and a matching
    // suspended/reinstated pair for whoever the roster marks suspended.
    for (const [i, user] of mockUsers.entries()) {
      activity.record(user.id, organizationId, "organization-joined", `Joined ${roster.organizationName}`, undefined, daysAgoISO(pseudoRandomInt(60, 700, i + orgIndex)));
      activityCount++;
      if (user.presence !== "offline") {
        activity.record(user.id, organizationId, "login", "Signed in", undefined, daysAgoISO(pseudoRandomInt(0, 5, i)));
        activityCount++;
      }
      if (user.teamIds.length > 0) {
        activity.record(user.id, organizationId, "team-join", `Joined ${teams.lookup(user.teamIds[0])?.name ?? "a team"}`, undefined, daysAgoISO(pseudoRandomInt(10, 200, i + 1)));
        activityCount++;
      }
      if (user.status === "suspended") {
        activity.record(user.id, organizationId, "suspended", "Access suspended", undefined, daysAgoISO(pseudoRandomInt(1, 10, i)));
        activityCount++;
      }
      if (i === 1) {
        activity.record(user.id, organizationId, "role-changed", `Access level set to ${user.accessLevel}`, undefined, daysAgoISO(pseudoRandomInt(15, 60, i)));
        activityCount++;
      }
    }

    // Invitations: a small realistic mix of pending/accepted/expired/cancelled,
    // genuinely driven through InvitationEngine's own state machine.
    const inviter = mockUsers.find(u => u.accessLevel === "owner") ?? mockUsers[0];
    const inviteeNames = [
      ["Alex", "Morgan"],
      ["Jordan", "Blake"],
      ["Taylor", "Reyes"],
      ["Sam", "Ortiz"],
    ];
    inviteeNames.forEach(([first, last], i) => {
      const teamId = mockTeams[i % mockTeams.length]?.id;
      const invitation = invitations.create({
        email: `${first}.${last}.invite@${roster.organizationName.toLowerCase().replace(/[^a-z]/g, "")}.calixo-demo.io`.toLowerCase(),
        organizationId,
        workspaceId: workspace.id,
        teamId,
        accessLevel: INVITE_ACCESS_LEVELS[i % INVITE_ACCESS_LEVELS.length],
        invitedBy: inviter.id,
        message: i === 0 ? "Excited to have you join the team!" : undefined,
        expiresInDays: pseudoRandomInt(3, 30, i + orgIndex),
      });
      switch (i % 4) {
        case 1:
          invitations.accept(invitation.id);
          break;
        case 2:
          invitations.expire(invitation.id);
          break;
        case 3:
          invitations.cancel(invitation.id);
          break;
        default:
          break;
      }
      invitationCount++;
    });
  });

  return {
    organizations: ORG_ROSTERS.length,
    users: userCount,
    teams: teamCount,
    departments: DEPARTMENTS.length,
    jobTitles: JOB_TITLES.length,
    workspaces: WORKSPACES.length,
    invitations: invitationCount,
    activityEvents: activityCount,
  };
}

export type { Invitation };
