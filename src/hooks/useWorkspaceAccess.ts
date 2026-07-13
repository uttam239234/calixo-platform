"use client";

/**
 * Calixo Workspaces - Access section state.
 * "Marketing Workspace can access: ✓ Analytics ✕ Billing" is the union of
 * real permissions held by everyone currently in the workspace — reuses
 * Round 11's entire Roles & Permissions infrastructure (`useRoles`,
 * `FEATURE_CHECKS`, `roleHasPermission`) rather than inventing a new
 * workspace-level permission model. No new authorization logic anywhere.
 */

import { useMemo } from "react";
import { useRoles } from "./useRoles";
import { permissionName } from "@/core/platform/access";
import { FEATURE_CHECKS, roleHasPermission } from "@/features/settings/roles/capabilities";

export function useWorkspaceAccess(organizationId: string, memberIds: string[]) {
  const roles = useRoles(organizationId);

  const unionPermissions = useMemo(() => {
    const merged = new Set<string>();
    for (const personId of memberIds) {
      for (const permission of roles.permissionsForPerson(personId)) merged.add(permission);
    }
    return Array.from(merged);
  }, [memberIds, roles]);

  const featureAccess = useMemo(
    () => FEATURE_CHECKS.map(feature => ({ feature, allowed: roleHasPermission(unionPermissions, permissionName(feature.resource, feature.action)) })),
    [unionPermissions]
  );

  return { unionPermissions, featureAccess };
}

export type UseWorkspaceAccessResult = ReturnType<typeof useWorkspaceAccess>;
