/**
 * Calixo Platform - Mock Invitations Generator
 *
 * Genuinely drives InvitationEngine (create + accept/reject/expire/cancel)
 * rather than constructing Invitation objects by hand — this doubles as a
 * live demonstration that the engine's state machine works.
 */

import { InvitationEngine, invitationEngine } from "../invitation/InvitationEngine";
import type { Invitation, Team, User } from "../types/index";
import { FIRST_NAMES, LAST_NAMES, WORKSPACES, pick, pseudoRandomInt } from "./data";

export function generateMockInvitations(count = 120, users: User[], teams: Team[], engine: InvitationEngine = invitationEngine): Invitation[] {
  const invitations: Invitation[] = [];

  for (let i = 0; i < count; i++) {
    const workspace = pick(WORKSPACES, i);
    const workspaceTeams = teams.filter(t => t.workspaceId === workspace.id);
    const workspaceUsers = users.filter(u => u.workspaceId === workspace.id);
    const inviter = workspaceUsers.length > 0 ? pick(workspaceUsers, i) : pick(users, i);
    const firstName = pick(FIRST_NAMES, i + 11);
    const lastName = pick(LAST_NAMES, i + 13);

    const invitation = engine.create({
      email: `${firstName}.${lastName}.invite${i}@calixo-demo.io`.toLowerCase(),
      workspaceId: workspace.id,
      teamId: workspaceTeams.length > 0 && i % 2 === 0 ? pick(workspaceTeams, i).id : undefined,
      roleIds: i % 10 === 0 ? ["role-admin"] : ["role-member"],
      invitedBy: inviter?.id ?? "system",
      message: i % 4 === 0 ? "Excited to have you join the team!" : undefined,
      expiresInDays: pseudoRandomInt(3, 30, i),
    });

    switch (i % 5) {
      case 1:
        engine.accept(invitation.id);
        break;
      case 2:
        engine.reject(invitation.id);
        break;
      case 3:
        engine.expire(invitation.id);
        break;
      case 4:
        engine.cancel(invitation.id);
        break;
      default:
        break;
    }

    invitations.push(invitation);
  }

  return invitations;
}
