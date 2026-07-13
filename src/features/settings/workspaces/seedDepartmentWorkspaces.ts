/**
 * Calixo Platform - Department → Workspace Seed
 *
 * Bridges two platforms that don't otherwise know about each other: the
 * canonical `core/platform/workspaces` (real, fully implemented, zero
 * consumers until this round) and `core/users`' existing Team roster
 * (Round 10 — Marketing/Admissions/Outreach/Leadership/Finance/Agency,
 * already real, already org-scoped, already has a lead and members).
 *
 * Creates one real `Workspace` per existing Team, matching the brief's own
 * Workspace Overview examples by name exactly, then re-points that team's
 * (and its members') `workspaceId` at the new real id — replacing the
 * generic, disconnected mock-pool id every team/person previously shared
 * per organization (`WORKSPACES[orgIndex % WORKSPACES.length]` in
 * `core/users/mock/seed.ts`). Idempotent; safe to call from the same
 * app-wide bootstrap that seeds the roster and the business roles.
 */
import { organizationRegistry } from "@/core/platform/organizations";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import { teamRegistry, userRegistry } from "@/core/users";

let seeded = false;

export async function seedDepartmentWorkspaces(): Promise<void> {
  if (seeded) return;
  seeded = true;

  for (const organization of organizationRegistry.list()) {
    const teams = teamRegistry.list({ organizationId: organization.id });
    if (teams.length === 0) continue;
    let firstWorkspaceId: string | undefined;

    for (const team of teams) {
      const workspace = workspacePlatformAPI.create({ organizationId: organization.id, name: team.name, description: team.description, type: "team" }, team.managerId ?? organization.ownerId);
      firstWorkspaceId ??= workspace.id;

      team.workspaceId = workspace.id;
      team.updatedAt = new Date().toISOString();

      for (const memberId of team.memberIds) {
        const user = userRegistry.lookup(memberId);
        if (user) user.workspaceId = workspace.id;
        // The team lead is already an "admin" member — `create()` added them as the actor.
        if (memberId !== team.managerId) workspacePlatformAPI.addMember(workspace.id, memberId, "editor");
      }
    }

    // People with no team (the roster's viewer-only entries) land in the
    // organization's first real workspace rather than keeping a stale
    // reference to the old generic mock-pool id.
    if (firstWorkspaceId) {
      for (const user of userRegistry.list({ organizationId: organization.id })) {
        if (user.teamIds.length === 0) user.workspaceId = firstWorkspaceId;
      }
    }
  }
}
