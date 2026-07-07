/**
 * Calixo Platform - Tenant Context Service
 *
 * The reusable resolver every engine/service/AI request/report/workflow/
 * analytics query should call to get a fully-formed `TenantContext`.
 *
 * Deliberately resurrects the existing `src/access` Enterprise Access
 * Management Platform (`AuthorizationEngine`, `roleService`) for the
 * Permission Context instead of building a second RBAC model — per the
 * mandate's "reuse everything valuable" rule, this is the first real
 * runtime caller that orphaned platform has ever had.
 */
import { AuthorizationEngine } from "@/access/engine/AuthorizationEngine";
import { roleService } from "@/access/services/RoleService";
import { organizationRegistry } from "../organizations/OrganizationRegistry";
import { workspaceRegistry } from "../workspaces/WorkspaceRegistry";
import { subscriptionEngine } from "../subscription/SubscriptionEngine";
import { featureFlagEngine } from "../featureFlags/FeatureFlagEngine";
import type { ResolveTenantContextInput, TenantContext } from "./types";

const authorizationEngine = new AuthorizationEngine();

/** A context for background/system-initiated work (seeding, scheduled jobs) that has no real requesting user. */
const SYSTEM_USER_ID = "system";

export class TenantContextService {
  async resolve(input: ResolveTenantContextInput): Promise<TenantContext> {
    const organization = organizationRegistry.lookup(input.organizationId);
    const workspace = input.workspaceId ? workspaceRegistry.lookup(input.workspaceId) : undefined;
    const subscription = subscriptionEngine.getOrAssignDefault(input.organizationId);

    const [permissions, roles] = await Promise.all([
      roleService.getUserPermissions(input.userId, input.organizationId),
      roleService.getUserRoles(input.userId, input.organizationId).then(assignments => assignments.map(a => a.roleId)),
    ]);

    return {
      organization: { organizationId: input.organizationId, organization },
      workspace: { workspaceId: input.workspaceId, workspace },
      brand: { brandId: input.brandId, brandName: input.brandName },
      user: { userId: input.userId, roles },
      permissions: {
        permissions,
        hasPermission: (permission: string) => permissions.includes(permission),
        authorize: async (permission: string, resource?: string) => {
          const result = await authorizationEngine.authorize({ userId: input.userId, organizationId: input.organizationId, workspaceId: input.workspaceId, permission, resource });
          return result.authorized;
        },
      },
      subscription: {
        tier: subscription.tier,
        subscription,
        hasFeatureGate: (featureId: string) => subscriptionEngine.hasFeatureGate(input.organizationId, featureId),
        hasModule: (moduleId: string) => subscriptionEngine.hasModule(input.organizationId, moduleId),
        checkLimit: (key, requested = 1) => {
          const check = subscriptionEngine.checkLimit(input.organizationId, key, requested);
          return { allowed: check.allowed, remaining: check.remaining };
        },
      },
      connector: { organizationId: input.organizationId },
      audit: { actorId: input.userId, organizationId: input.organizationId, workspaceId: input.workspaceId },
      featureFlags: {
        isEnabled: (flagId: string) => featureFlagEngine.isEnabled(flagId, { organizationId: input.organizationId, workspaceId: input.workspaceId, userId: input.userId }),
      },
    };
  }

  /** For background jobs, seeding, and other system-initiated work that has no real requesting user. */
  async createSystemContext(organizationId: string, workspaceId?: string): Promise<TenantContext> {
    return this.resolve({ organizationId, workspaceId, userId: SYSTEM_USER_ID });
  }
}

export const tenantContextService = new TenantContextService();
