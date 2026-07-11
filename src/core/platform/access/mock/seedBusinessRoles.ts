/**
 * Calixo Platform - The 5 Business Roles
 *
 * Owner / Administrator / Manager / Member / Viewer — the vocabulary the
 * whole platform now shows people (Round 10's `PeopleAccessLevel` in
 * `core/users`, this round's Roles & Permissions UI). These are real,
 * global `Role` records (roles carry no organization dimension — see
 * `RolePlatformAPI`), created once via `rolePlatformAPI.createRole()` with
 * colon-notation (`resource:action`) permissions — the one permission
 * grammar `AuthorizationPlatformAPI` actually checks, unlike the legacy
 * dot-notation `SYSTEM_ROLES` in `src/access/config/roles.ts`, which this
 * round deliberately does not touch or build on.
 */
import { rolePlatformAPI } from "../RolePlatformAPI";
import { permissionName } from "../PermissionRegistry";
import type { ResourceType, ActionType } from "../types";

function grants(resources: ResourceType[], actions: ActionType[]): string[] {
  return resources.flatMap(resource => actions.map(action => permissionName(resource, action)));
}

const ADMINISTRATOR_MANAGE_RESOURCES: ResourceType[] = ["organization", "workspace", "brand", "campaign", "content", "asset", "report", "analytics", "social", "connector", "user", "team", "department", "module"];

export interface BusinessRoleSeed {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
}

export const BUSINESS_ROLES: BusinessRoleSeed[] = [
  {
    slug: "owner",
    name: "Owner",
    description: "Full control over everything in the organization, including billing and deleting the organization itself.",
    permissions: ["*"],
  },
  {
    slug: "administrator",
    name: "Administrator",
    description: "Manages people, teams, and day-to-day operations. Cannot change billing or delete the organization.",
    permissions: [...grants(ADMINISTRATOR_MANAGE_RESOURCES, ["read", "create", "update", "manage"]), permissionName("settings", "admin"), permissionName("billing", "read")],
  },
  {
    slug: "manager",
    name: "Manager",
    description: "Creates and publishes campaigns, content, and reports. Can't manage billing, people, or organization settings.",
    permissions: [
      ...grants(["campaign", "content", "social"], ["read", "create", "update", "publish"]),
      ...grants(["asset"], ["read", "create"]),
      ...grants(["report"], ["read", "create", "export"]),
      permissionName("analytics", "read"),
      permissionName("team", "read"),
      permissionName("user", "read"),
      permissionName("role", "read"),
    ],
  },
  {
    slug: "member",
    name: "Member",
    description: "Creates campaigns, content, and assets, and views reports and analytics. Can't publish or manage anything.",
    permissions: [...grants(["campaign", "content", "asset", "social"], ["read", "create"]), permissionName("report", "read"), permissionName("analytics", "read")],
  },
  {
    slug: "viewer",
    name: "Viewer",
    description: "Read-only access to dashboards, analytics, reports, and content. Can't create, edit, or manage anything.",
    permissions: grants(["dashboard", "analytics", "report", "campaign", "content", "social", "brand"], ["read"]),
  },
];

/** Every business-role slug, regardless of whether it ended up backed by a fresh role or an augmented legacy one — the UI uses this to hide Archive/Delete on the 5 defaults (they're the platform's core vocabulary, not a user's customization), independent of the underlying, inconsistent `isSystem` flag. */
export const BUSINESS_ROLE_SLUGS = new Set(BUSINESS_ROLES.map(role => role.slug));

let seeded = false;

/**
 * Idempotent — creates the 5 business roles once. Three of the five names
 * ("Owner", "Manager", "Viewer") collide exactly with names already taken by
 * the legacy dot-notation `SYSTEM_ROLES` (`src/access/config/roles.ts`,
 * seeded earlier in the same bootstrap by `initializeAccessPlatform()`) —
 * `RoleService.createRole()` throws on a duplicate name, and even a silent
 * skip would leave those three roles permanently pointing at dot-notation
 * permissions that never match a real colon-notation check. Rather than
 * touch the protected legacy roles' identity (blocked anyway —
 * `updateRole()`/`deleteRole()` both refuse `isSystem` roles) or invent
 * duplicate-looking names, this additively grants the working colon-notation
 * permissions onto the SAME existing role via `assignPermissionToRole()`
 * (which has no `isSystem` guard — it's designed for exactly this: adding
 * permissions to any role without altering its core identity). "Owner"
 * already carries `permissions: ['*']` from the legacy seed, so nothing
 * needs adding there. "Administrator" and "Member" don't collide with any
 * legacy name and are created fresh.
 */
export async function seedBusinessRoles(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const existing = await rolePlatformAPI.getAllRoles();
  const existingByName = new Map(existing.map(role => [role.name, role]));

  for (const role of BUSINESS_ROLES) {
    const legacyRole = existingByName.get(role.name);
    if (legacyRole) {
      const alreadyGranted = new Set(await rolePlatformAPI.getRolePermissions(legacyRole.id));
      for (const permission of role.permissions) {
        if (permission !== "*" && !alreadyGranted.has(permission)) {
          await rolePlatformAPI.assignPermissionToRole(legacyRole.id, permission);
        }
      }
      continue;
    }
    await rolePlatformAPI.createRole({ name: role.name, description: role.description, permissions: role.permissions });
  }
}
