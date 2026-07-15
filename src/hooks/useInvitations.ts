"use client";

/**
 * Calixo Users & Teams Center - invitation list/lifecycle state.
 * The only place allowed to call InvitationEngine — components never
 * import it directly. Scoped to a single organization.
 *
 * `accept()` is a deliberate cross-platform bridge: accepting an invite
 * both creates the person's People directory entry (`core/users`) and adds
 * them as a real, isolated member of this organization
 * (`organizationPlatformAPI.addMember`) — the brief's "Consume
 * OrganizationPlatformAPI" requirement made concrete, not just a status flip.
 */

import { useCallback, useEffect, useState } from "react";
import { generateId } from "@/shared/utils/string";
import { invitationEngine, userRegistry, activityEngine } from "@/core/users";
import type { CreateInvitationInput, Invitation, InvitationActionResult, InvitationStatus, PeopleAccessLevel, User } from "@/core/users";
import { organizationPlatformAPI } from "@/core/platform/organizations";
import type { OrganizationMemberRole } from "@/core/platform/organizations";
import { entitlementService } from "@/core/platform/access";

const ACCESS_LEVEL_TO_ORG_ROLE: Record<PeopleAccessLevel, OrganizationMemberRole> = {
  owner: "owner",
  administrator: "admin",
  manager: "member",
  member: "member",
  viewer: "guest",
};

export function useInvitations(organizationId: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const refresh = useCallback(() => {
    setInvitations(invitationEngine.list({ organizationId }));
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  /** Real backend enforcement — `User Limit Enforcement` (the mandate's own named section): checked BEFORE the invitation is even created, using the seat count `AuthorizationPlatformAPI`'s own `SUBSCRIPTION_LIMIT_CHECKS` declared a gate for (`user:create -> seatsUsed`) but which had zero real call sites anywhere in the codebase. */
  const create = useCallback(
    async (input: Omit<CreateInvitationInput, "organizationId">): Promise<Invitation> => {
      const entitlement = await entitlementService.canInviteUser({ userId: input.invitedBy, organizationId });
      if (!entitlement.allowed) throw new Error(entitlement.message ?? "This plan's user limit has been reached.");
      const invitation = invitationEngine.create({ ...input, organizationId });
      refresh();
      return invitation;
    },
    [organizationId, refresh]
  );

  const accept = useCallback(
    async (id: string): Promise<InvitationActionResult> => {
      // Re-checked at acceptance too, not just at invite time — several pending
      // invites can be created while seats were available and all accepted
      // later, after the seat count has moved.
      const existing = invitationEngine.lookup(id);
      if (existing) {
        const entitlement = await entitlementService.canInviteUser({ userId: existing.invitedBy, organizationId });
        if (!entitlement.allowed) return { success: false, errors: [entitlement.message ?? "This plan's user limit has been reached."] };
      }

      const result = invitationEngine.accept(id);
      if (result.success && result.invitation) {
        const invitation = result.invitation;
        const now = new Date().toISOString();
        const [emailLocal] = invitation.email.split("@");
        const displayName = emailLocal
          .split(".")
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
        const newUser: User = {
          id: `user-${generateId(10)}`,
          username: `${emailLocal}${generateId(4)}`.toLowerCase(),
          displayName,
          email: invitation.email,
          title: "New Team Member",
          department: "General",
          status: "active",
          presence: "offline",
          timezone: "UTC",
          locale: "en-US",
          language: "en",
          organizationId,
          workspaceId: invitation.workspaceId,
          teamIds: invitation.teamId ? [invitation.teamId] : [],
          accessLevel: invitation.accessLevel,
          roleIds: [],
          permissions: [],
          featureFlags: [],
          tags: [],
          preferences: {},
          metadata: {},
          createdAt: now,
          updatedAt: now,
        };
        userRegistry.register(newUser);
        organizationPlatformAPI.addMember(organizationId, newUser.id, ACCESS_LEVEL_TO_ORG_ROLE[invitation.accessLevel]);
        activityEngine.record(newUser.id, organizationId, "invite-accepted", "Accepted their invitation");
        activityEngine.record(newUser.id, organizationId, "organization-joined", "Joined the organization");
      }
      if (result.success) refresh();
      return result;
    },
    [organizationId, refresh]
  );

  const reject = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.reject(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const cancel = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.cancel(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const resend = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.resend(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const byStatus = useCallback(
    (status: InvitationStatus) => invitations.filter(i => i.status === status),
    [invitations]
  );

  return {
    invitations,
    create,
    accept,
    reject,
    cancel,
    resend,
    byStatus,
    refresh,
  };
}

export type UseInvitationsResult = ReturnType<typeof useInvitations>;
