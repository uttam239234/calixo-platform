/**
 * Calixo Platform - Identity Platform API
 *
 * The ONE place every module (Dashboard, Analytics, Reports, Workflow,
 * Settings, Assets, Users, AI Copilot) should call to find out "who is the
 * current user" — bridges `src/identity`'s authenticated-session identity
 * (`AuthenticatedUser`/`UserProfile`) with the Users & Teams directory
 * record (`core/users`) and the full `TenantContext`, in one call, so no
 * module reaches into `authService`/`userRegistry`/`tenantContextService`
 * directly.
 *
 * Honest limitation: `src/identity`'s authenticated-account id space and
 * `core/users`' directory id space were built independently in different
 * phases and have never been reconciled (flagged in the Platform
 * Foundation audit as "two distinct, unreconciled User interfaces") — the
 * directory bridge below will only resolve once a real signup flow links
 * the two, which is out of scope for this phase.
 */
import { identityService } from "@/identity/services/IdentityService";
import { usersPlatformAPI } from "@/core/users";
import { tenantContextService } from "../tenant/TenantContextService";
import type { CurrentUser } from "./types";

export class IdentityPlatformAPI {
  async getCurrentUser(userId: string, organizationId?: string, workspaceId?: string): Promise<CurrentUser | null> {
    const user = identityService.getUser(userId);
    if (!user) return null;

    const profile = identityService.getProfile(userId);
    const directoryUser = usersPlatformAPI.getUserSummary(userId);
    const tenantContext = organizationId ? await tenantContextService.resolve({ organizationId, workspaceId, userId }) : null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      profile,
      directoryUserId: directoryUser?.id,
      organizationId,
      workspaceId,
      tenantContext,
    };
  }

  isAuthenticated(userId: string): boolean {
    return identityService.getUser(userId) !== null;
  }
}

export const identityPlatformAPI = new IdentityPlatformAPI();
