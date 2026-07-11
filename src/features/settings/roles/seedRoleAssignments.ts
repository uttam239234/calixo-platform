/**
 * Calixo Platform - Roster Role Assignment Seed
 *
 * Bridges two platforms that don't otherwise know about each other:
 * `core/users` (the People/Teams roster, Round 10 — each person already has
 * a business-facing `accessLevel`) and `core/platform/access` (the real
 * Track 1 Authorization Platform, this round — 5 real `Role`s with the same
 * slugs as `PeopleAccessLevel`'s values). Without this, every person in the
 * roster would have an `accessLevel` label but zero real permission grant —
 * exactly the gap Round 10 disclosed and this round closes.
 *
 * Idempotent; safe to call from the same app-wide bootstrap that seeds the
 * roster and the business roles.
 */
import { userRegistry } from "@/core/users";
import { rolePlatformAPI } from "@/core/platform/access";

let seeded = false;

export async function seedRoleAssignmentsForRoster(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const roles = await rolePlatformAPI.getAllRoles();
  const roleBySlug = new Map(roles.map(role => [role.slug, role]));

  for (const person of userRegistry.list()) {
    const role = roleBySlug.get(person.accessLevel);
    if (!role) continue;

    const existingAssignments = await rolePlatformAPI.getUserRoles(person.id, person.organizationId);
    if (existingAssignments.some(a => a.roleId === role.id)) continue;

    await rolePlatformAPI.assignRoleToUser({
      userId: person.id,
      roleId: role.id,
      organizationId: person.organizationId,
      grantedBy: "system",
    });
  }
}
