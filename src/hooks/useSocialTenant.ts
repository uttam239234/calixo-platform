"use client";

/**
 * Calixo Platform - Social tenant/permission state.
 *
 * Unlike Ads Manager (one `CampaignProvider` at the layout level), Social Media has five
 * independent Context providers, each lazily mounted on its own route page — by design, so a
 * user visiting Calendar doesn't pay for Inbox state. Rather than introduce a new wrapping
 * Context (a real architectural change), each provider calls this plain hook internally to get
 * the same tenant/permission state Ads' `CampaignProvider` computes once.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { SOCIAL_CURRENT_USER_ID, SOCIAL_ORGANIZATION_ID } from "@/core/social";
import { useUser } from "@/identity/hooks/useAuth";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";

/**
 * The brief's `social.edit`/`social.schedule`/`social.reply`/`social.analytics.read`/
 * `social.calendar.manage` don't each map to a distinct string in the platform's closed
 * 15-verb `ActionType` vocabulary — consolidated the same way Ads' pause/resume both mapped to
 * `update`: edit→update, schedule→publish (scheduling is deferred publishing), reply→create (a
 * reply is a new message), analytics.read→read (viewing social analytics is part of general
 * social read access), calendar.manage→manage. `connector.manage` reuses the existing
 * `connector` resource type rather than inventing a social-scoped duplicate.
 */
export const SOCIAL_ACTION_PERMISSIONS = {
  read: permissionName("social", "read"),
  create: permissionName("social", "create"),
  update: permissionName("social", "update"),
  publish: permissionName("social", "publish"),
  delete: permissionName("social", "delete"),
  approve: permissionName("social", "approve"),
  export: permissionName("social", "export"),
  manage: permissionName("social", "manage"),
  connectorManage: permissionName("connector", "manage"),
} as const;

export interface SocialTenantContext {
  organizationId: string;
  userId: string;
}

export function useSocialTenant() {
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const sessionUser = useUser();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo<SocialTenantContext>(
    () => ({ organizationId: organizationId ?? SOCIAL_ORGANIZATION_ID, userId: sessionUser?.id ?? SOCIAL_CURRENT_USER_ID }),
    [organizationId, sessionUser?.id]
  );
  const currentUserName = sessionUser?.name ?? "Aarav Mehta";

  /** `null` = no gating (unauthenticated demo default, unchanged behavior). Once a real session exists this becomes the user's real effective permission list. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sessionUser) {
        if (!cancelled) setPermissions(null);
        return;
      }
      await initializePlatformFoundation();
      const effective = await authorizationPlatformAPI.getEffectivePermissions(sessionUser.id, organizationId ?? undefined);
      if (!cancelled) setPermissions(effective);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionUser, organizationId]);

  const hasPermission = useCallback((permission: string) => !permissions || permissions.includes(permission), [permissions]);

  return {
    tenantContext,
    currentUserName,
    canRead: hasPermission(SOCIAL_ACTION_PERMISSIONS.read),
    canCreate: hasPermission(SOCIAL_ACTION_PERMISSIONS.create),
    canUpdate: hasPermission(SOCIAL_ACTION_PERMISSIONS.update),
    canPublish: hasPermission(SOCIAL_ACTION_PERMISSIONS.publish),
    canDelete: hasPermission(SOCIAL_ACTION_PERMISSIONS.delete),
    canApprove: hasPermission(SOCIAL_ACTION_PERMISSIONS.approve),
    canExport: hasPermission(SOCIAL_ACTION_PERMISSIONS.export),
    canManage: hasPermission(SOCIAL_ACTION_PERMISSIONS.manage),
    canManageConnectors: hasPermission(SOCIAL_ACTION_PERMISSIONS.connectorManage),
  };
}
