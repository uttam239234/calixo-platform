/**
 * Calixo Platform - Authorization Platform API
 *
 * The ONE entry point for every authorization decision platform-wide.
 * Composes, without duplicating:
 *  - `authorizationEngine.authorize()` (RBAC + policy evaluation, `src/access`, unmodified)
 *  - `ownershipEngine` (new — resource-instance ownership override)
 *  - `resourceHierarchy` (new — ancestor-permission cascade)
 *  - `subscriptionEngine` (Platform Foundation phase — plan/limit gating)
 *  - `featureFlagEngine` (Platform Foundation phase — feature gating)
 *  - `auditService.recordEvent()`/`recordAuthorizationFailure()` (`src/access`, unmodified)
 *
 * Policy evaluation is NEVER cached (it can be resource/context-specific);
 * only the user's direct permission/role list is cached via
 * `permissionCache`, invalidated on every mutation.
 */
import { authorizationEngine } from "@/access/engine/AuthorizationEngine";
import { auditService } from "@/access/audit/AuditService";
import { roleService } from "@/access/services/RoleService";
import { FEATURE_ACCESS_REGISTRY } from "@/access/config/features";
import type { AuthorizationResult } from "@/access/types";
import { platformEventBus } from "../events/PlatformEventBus";
import type { SubscriptionUsageKey } from "../subscription/types";
import { featureFlagEngine } from "../featureFlags/FeatureFlagEngine";
import type { TenantContext } from "../tenant/types";
import { permissionCache } from "./PermissionCache";
import { ownershipEngine } from "./OwnershipEngine";
import { resourceHierarchy } from "./ResourceHierarchy";
import { permissionName } from "./PermissionRegistry";
import type { ActionType, AuthorizationDecision, ExplainReasonCode, ResourceContext, ResourceType } from "./types";

/** Where a subscription usage limit genuinely applies to a (resourceType, action) pair — not every combination has one. */
const SUBSCRIPTION_LIMIT_CHECKS: Partial<Record<ResourceType, Partial<Record<ActionType, SubscriptionUsageKey>>>> = {
  ai: { execute: "aiCreditsUsed" },
  connector: { create: "connectorsUsed" },
  brand: { create: "brandsUsed" },
  workspace: { create: "workspacesUsed" },
  user: { create: "seatsUsed" },
};

function now(): string {
  return new Date().toISOString();
}

export class AuthorizationPlatformAPI {
  async authorize(tenantContext: TenantContext, resourceType: ResourceType, action: ActionType, resourceContext?: Partial<ResourceContext>): Promise<AuthorizationDecision> {
    const userId = tenantContext.user.userId;
    const organizationId = tenantContext.organization.organizationId;
    const workspaceId = tenantContext.workspace.workspaceId;
    const permission = permissionName(resourceType, action);

    // Organization/workspace boundary check — a resourceContext pointing at a different tenant is an immediate deny, before RBAC is even consulted.
    if (resourceContext?.organizationId && resourceContext.organizationId !== organizationId) {
      return this.deny(resourceType, action, permission, "organization_restriction", "The resource belongs to a different organization.", tenantContext, resourceContext);
    }
    if (resourceContext?.workspaceId && workspaceId && resourceContext.workspaceId !== workspaceId) {
      return this.deny(resourceType, action, permission, "workspace_restriction", "The resource belongs to a different workspace.", tenantContext, resourceContext);
    }

    // ABAC context handed to the existing generic PolicyCondition evaluator — no engine changes needed, it already merges `request.context`.
    const abacContext: Record<string, unknown> = {
      subscriptionTier: tenantContext.subscription.tier,
      resourceType,
      action,
      ...resourceContext?.attributes,
    };

    const engineResult = await authorizationEngine.authorize({
      userId,
      organizationId,
      workspaceId,
      permission,
      resource: resourceType,
      resourceId: resourceContext?.resourceId,
      context: abacContext,
    });

    if (engineResult.authorized) {
      const gateFailure = await this.checkSubscriptionAndFeatureGates(tenantContext, resourceType, action);
      if (gateFailure) return this.finalize(gateFailure, tenantContext, resourceContext);
      return this.finalize(this.allow(resourceType, action, permission, engineResult), tenantContext, resourceContext);
    }

    // RBAC/policy denied — try ownership and hierarchy cascade before giving up.
    if (resourceContext?.resourceId && ownershipEngine.isOwner(resourceType, resourceContext.resourceId, userId)) {
      return this.finalize(this.allow(resourceType, action, permission, engineResult, "Granted via resource ownership."), tenantContext, resourceContext);
    }

    const cachedPermissions = await this.getEffectivePermissions(userId, organizationId);
    for (const ancestor of resourceHierarchy.getAncestorTypes(resourceType)) {
      if (cachedPermissions.includes(permissionName(ancestor, action)) || cachedPermissions.includes(permissionName(ancestor, "manage")) || cachedPermissions.includes(permissionName(ancestor, "admin"))) {
        return this.finalize(this.allow(resourceType, action, permission, engineResult, `Granted via ${ancestor} permission cascade.`), tenantContext, resourceContext);
      }
    }

    const reasonCode: ExplainReasonCode = engineResult.source === "policy" ? "policy_failed" : "permission_missing";
    return this.finalize(this.deny(resourceType, action, permission, reasonCode, engineResult.reason ?? "Missing required permission.", tenantContext, resourceContext, engineResult), tenantContext, resourceContext);
  }

  /** Effective Permission Calculator (section 1) — cached, invalidated on every role/permission/policy mutation. */
  async getEffectivePermissions(userId: string, organizationId?: string): Promise<string[]> {
    const cached = permissionCache.get(userId, organizationId);
    if (cached) return cached;
    const permissions = await roleService.getUserPermissions(userId, organizationId);
    permissionCache.set(userId, permissions, organizationId);
    return permissions;
  }

  private async checkSubscriptionAndFeatureGates(tenantContext: TenantContext, resourceType: ResourceType, action: ActionType): Promise<AuthorizationDecision | null> {
    const organizationId = tenantContext.organization.organizationId;
    const permission = permissionName(resourceType, action);

    const limitKey = SUBSCRIPTION_LIMIT_CHECKS[resourceType]?.[action];
    if (limitKey) {
      const check = tenantContext.subscription.checkLimit(limitKey, 1);
      if (!check.allowed) {
        const reasonCode: ExplainReasonCode = resourceType === "ai" ? "ai_restriction" : resourceType === "connector" ? "connector_restriction" : "subscription_restriction";
        return this.deny(resourceType, action, permission, reasonCode, `The organization's ${tenantContext.subscription.tier} plan limit has been reached.`, tenantContext);
      }
    }

    const featureAccess = FEATURE_ACCESS_REGISTRY[`module.${resourceType}`];
    if (featureAccess?.requiredFeatureFlag && !featureFlagEngine.isEnabled(featureAccess.requiredFeatureFlag, { organizationId, workspaceId: tenantContext.workspace.workspaceId, userId: tenantContext.user.userId })) {
      return this.deny(resourceType, action, permission, "feature_disabled", `The "${featureAccess.requiredFeatureFlag}" feature is not enabled for this organization.`, tenantContext);
    }

    return null;
  }

  private allow(resourceType: ResourceType, action: ActionType, permission: string, engineResult: AuthorizationResult, note?: string): AuthorizationDecision {
    return { allowed: true, reasonCode: "allowed", explanation: note ?? "Access granted.", resourceType, action, permission, engineResult, evaluatedAt: now() };
  }

  private deny(resourceType: ResourceType, action: ActionType, permission: string, reasonCode: ExplainReasonCode, explanation: string, _tenantContext: TenantContext, _resourceContext?: Partial<ResourceContext>, engineResult?: AuthorizationResult): AuthorizationDecision {
    return { allowed: false, reasonCode, explanation, resourceType, action, permission, engineResult, evaluatedAt: now() };
  }

  private async finalize(decision: AuthorizationDecision, tenantContext: TenantContext, resourceContext?: Partial<ResourceContext>): Promise<AuthorizationDecision> {
    const userId = tenantContext.user.userId;
    const organizationId = tenantContext.organization.organizationId;
    const workspaceId = tenantContext.workspace.workspaceId;

    if (decision.allowed) {
      void auditService.recordEvent({
        organizationId,
        workspaceId,
        userId,
        eventType: "authorization_granted",
        resource: decision.resourceType,
        resourceId: resourceContext?.resourceId,
        description: `Access granted for ${decision.permission}`,
        changes: { reasonCode: decision.reasonCode },
      });
      void platformEventBus.publish({ type: "AccessGranted", organizationId, workspaceId, userId, payload: { permission: decision.permission } });
      void platformEventBus.publish({ type: "AuthorizationSucceeded", organizationId, workspaceId, userId, payload: { permission: decision.permission } });
    } else {
      void auditService.recordAuthorizationFailure({
        organizationId,
        workspaceId,
        userId,
        permission: decision.permission,
        resource: decision.resourceType,
        resourceId: resourceContext?.resourceId,
        reason: decision.explanation,
      });
      void platformEventBus.publish({ type: "AccessDenied", organizationId, workspaceId, userId, payload: { permission: decision.permission, reasonCode: decision.reasonCode } });
      void platformEventBus.publish({ type: "AuthorizationFailed", organizationId, workspaceId, userId, payload: { permission: decision.permission, reasonCode: decision.reasonCode } });
    }
    return decision;
  }
}

export const authorizationPlatformAPI = new AuthorizationPlatformAPI();
