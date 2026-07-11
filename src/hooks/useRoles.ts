"use client";

/**
 * Calixo Roles & Permissions - role list/CRUD/assignment-count state.
 * The only place allowed to call `rolePlatformAPI` — components never
 * import it directly. Scoped to a single organization: `Role` records
 * themselves are global (no organization dimension), but which ones are
 * *visible* here, and how many people hold each, is org-scoped.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { rolePlatformAPI, BUSINESS_ROLE_SLUGS } from "@/core/platform/access";
import type { Role } from "@/access/types";
import { userRegistry } from "@/core/users";
import { sessionCreatedRoleIds } from "@/features/settings/roles/sessionCreatedRoles";

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

export function useRoles(organizationId: string) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, string[]>>({});
  const [countByRole, setCountByRole] = useState<Record<string, number>>({});
  const [roleIdsByPerson, setRoleIdsByPerson] = useState<Record<string, string[]>>({});

  const refresh = useCallback(async () => {
    const allRoles = await rolePlatformAPI.getAllRoles();

    const people = userRegistry.list({ organizationId });
    const counts: Record<string, number> = {};
    const rolesByPerson: Record<string, string[]> = {};
    for (const person of people) {
      const assignments = await rolePlatformAPI.getUserRoles(person.id, organizationId);
      rolesByPerson[person.id] = assignments.map(a => a.roleId);
      for (const assignment of assignments) counts[assignment.roleId] = (counts[assignment.roleId] ?? 0) + 1;
    }

    // Visible here = the 5 global defaults, always, plus any custom role
    // actually assigned within this organization, plus roles just created this
    // session (from this org's Roles page or the Templates gallery) — custom
    // roles never leak into an organization that never touched them.
    const visible = allRoles.filter(role => BUSINESS_ROLE_SLUGS.has(role.slug) || (counts[role.id] ?? 0) > 0 || sessionCreatedRoleIds.has(role.id));

    const permissions: Record<string, string[]> = {};
    for (const role of visible) permissions[role.id] = await rolePlatformAPI.getRolePermissions(role.id);

    setRoles(visible.sort((a, b) => b.priority - a.priority));
    setPermissionsByRole(permissions);
    setCountByRole(counts);
    setRoleIdsByPerson(rolesByPerson);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const isDefaultRole = useCallback((role: Role) => BUSINESS_ROLE_SLUGS.has(role.slug), []);

  const createRole = useCallback(
    async (input: CreateRoleInput) => {
      const role = await rolePlatformAPI.createRole({ name: input.name, description: input.description, permissions: input.permissions });
      sessionCreatedRoleIds.add(role.id);
      await refresh();
      return role;
    },
    [refresh]
  );

  const duplicateRole = useCallback(
    async (role: Role) => {
      const permissions = permissionsByRole[role.id] ?? (await rolePlatformAPI.getRolePermissions(role.id));
      const created = await rolePlatformAPI.createRole({ name: `${role.name} (Copy)`, description: role.description, permissions });
      sessionCreatedRoleIds.add(created.id);
      await refresh();
      return created;
    },
    [permissionsByRole, refresh]
  );

  const updateRole = useCallback(
    async (id: string, data: { name?: string; description?: string; permissions?: string[] }) => {
      const updated = await rolePlatformAPI.updateRole(id, data);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const archiveRole = useCallback(
    async (id: string) => {
      const removed = await rolePlatformAPI.archiveRole(id);
      await refresh();
      return removed;
    },
    [refresh]
  );

  const lookup = useCallback((id: string) => roles.find(r => r.id === id), [roles]);

  /** Every permission any of a person's active roles in this organization grants — `["*"]` (Owner) included, handled by `roleHasPermission()` at the call site. */
  const permissionsForPerson = useCallback(
    (personId: string): string[] => {
      const roleIds = roleIdsByPerson[personId] ?? [];
      const merged = new Set<string>();
      for (const roleId of roleIds) for (const permission of permissionsByRole[roleId] ?? []) merged.add(permission);
      return Array.from(merged);
    },
    [roleIdsByPerson, permissionsByRole]
  );

  const totalPeople = useMemo(() => userRegistry.list({ organizationId }).length, [organizationId]);

  return {
    roles,
    permissionsByRole,
    countByRole,
    roleIdsByPerson,
    permissionsForPerson,
    totalPeople,
    isDefaultRole,
    createRole,
    duplicateRole,
    updateRole,
    archiveRole,
    lookup,
    refresh,
  };
}

export type UseRolesResult = ReturnType<typeof useRoles>;
