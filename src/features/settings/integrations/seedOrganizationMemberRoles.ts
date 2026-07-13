/**
 * Calixo Platform - Organization Member -> Real Role Assignment Bridge
 *
 * A gap this round's own multi-org isolation verification route surfaced:
 * `seedRoleAssignmentsForRoster()` (Round 11) grants real, permission-checked
 * roles only to *roster* people (`core/users`), who use org-specific
 * synthetic ids (e.g. "user-royalglobal-owner") — NOT to the real
 * `Organization.ownerId`/`OrganizationMember` records `organizationEngine`
 * creates (e.g. "user-current" as Royal Global University's real owner).
 * Except at Calixo Technologies, where the two happen to coincide, "user-current"
 * has zero real RBAC role assignment in any other organization's scope —
 * every hard-gated permission check (`resourceAuthorizationAPI`, used by
 * `ConnectorRuntime.install()` among others) fails there with
 * "Missing required permission", regardless of Settings' own soft demo-mode
 * gating. This grants the real business role matching each organization
 * membership's real role, closing the gap for every organization the demo
 * user actually belongs to — not just Integrations.
 */
import { organizationRegistry, organizationPlatformAPI } from "@/core/platform/organizations";
import { rolePlatformAPI } from "@/core/platform/access";
import type { OrganizationMemberRole } from "@/core/platform/organizations";

const MEMBER_ROLE_TO_BUSINESS_ROLE_SLUG: Record<OrganizationMemberRole, string> = {
  owner: "owner",
  admin: "administrator",
  member: "member",
  guest: "viewer",
};

let seeded = false;

export async function seedRoleAssignmentsForOrganizationMembers(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const roles = await rolePlatformAPI.getAllRoles();
  const roleBySlug = new Map(roles.map(role => [role.slug, role]));

  for (const organization of organizationRegistry.list()) {
    for (const member of organizationPlatformAPI.getMembers(organization.id)) {
      const role = roleBySlug.get(MEMBER_ROLE_TO_BUSINESS_ROLE_SLUG[member.role]);
      if (!role) continue;

      const existingAssignments = await rolePlatformAPI.getUserRoles(member.userId, organization.id);
      if (existingAssignments.some(a => a.roleId === role.id)) continue;

      await rolePlatformAPI.assignRoleToUser({
        userId: member.userId,
        roleId: role.id,
        organizationId: organization.id,
        grantedBy: "system",
      });
    }
  }
}
