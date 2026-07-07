/**
 * Calixo Platform - Access Platform API
 *
 * The Permission Simulator ("what can this user do?") and Explain
 * Authorization surface — composes `AuthorizationPlatformAPI` rather than
 * re-evaluating anything itself.
 */
import { authorizationPlatformAPI } from "./AuthorizationPlatformAPI";
import { permissionRegistry } from "./PermissionRegistry";
import type { TenantContext } from "../tenant/types";
import type { AuthorizationDecision, ExplainReasonCode, ModuleAccessibility, PermissionSimulationResult, ResourceType } from "./types";

/** The module-shaped resource types the simulator reports module-level accessibility for. */
const SIMULATED_MODULES: ResourceType[] = ["dashboard", "analytics", "report", "workflow", "asset", "settings", "connector", "ai", "billing", "brand", "campaign", "content"];

const EXPLAIN_SUGGESTIONS: Record<ExplainReasonCode, string> = {
  allowed: "Access granted.",
  permission_missing: "Ask an organization administrator to grant the required permission or assign a role that includes it.",
  policy_failed: "An authorization policy explicitly denies this action under the current conditions.",
  subscription_restriction: "Upgrade the organization's subscription plan to increase this limit.",
  feature_disabled: "This feature is not enabled for the organization — contact an administrator or enable it in Feature Flags.",
  ownership_failed: "Only the resource's owner (or an editor/manager with explicit rights) can perform this action.",
  organization_restriction: "This resource does not belong to the current organization.",
  workspace_restriction: "This resource does not belong to the current workspace.",
  ai_restriction: "The organization's AI credit limit has been reached, or AI access is restricted for this plan.",
  connector_restriction: "Connector access is restricted by the organization's subscription plan or policy.",
};

export class AccessPlatformAPI {
  /** "What can this user do?" — real per-module checks, not guesses. */
  async simulate(tenantContext: TenantContext): Promise<PermissionSimulationResult> {
    const organizationId = tenantContext.organization.organizationId;
    const userId = tenantContext.user.userId;

    const accessibleModules: string[] = [];
    const deniedModules: ModuleAccessibility[] = [];
    const featureAvailability: Record<string, boolean> = {};
    const subscriptionRestrictions: string[] = [];

    for (const moduleType of SIMULATED_MODULES) {
      const decision = await authorizationPlatformAPI.authorize(tenantContext, moduleType, "read");
      featureAvailability[moduleType] = decision.allowed || decision.reasonCode !== "feature_disabled";
      if (decision.allowed) {
        accessibleModules.push(moduleType);
      } else {
        deniedModules.push({ moduleId: moduleType, accessible: false, reasonCode: decision.reasonCode });
        if (decision.reasonCode === "subscription_restriction" || decision.reasonCode === "ai_restriction" || decision.reasonCode === "connector_restriction") {
          subscriptionRestrictions.push(moduleType);
        }
      }
    }

    const grantedPermissions = await authorizationPlatformAPI.getEffectivePermissions(userId, organizationId);
    const missingPermissions = permissionRegistry
      .getAll()
      .filter(p => SIMULATED_MODULES.some(m => p.startsWith(`${m}:`)))
      .filter(p => !grantedPermissions.includes(p) && !grantedPermissions.includes("*"));

    return {
      userId,
      organizationId,
      accessibleModules,
      deniedModules,
      grantedPermissions,
      missingPermissions,
      featureAvailability,
      subscriptionRestrictions,
    };
  }

  /** Instead of "Access Denied" — a specific reason plus a concrete next step. */
  explain(decision: AuthorizationDecision): string {
    if (decision.allowed) return decision.explanation;
    return `${decision.explanation} ${EXPLAIN_SUGGESTIONS[decision.reasonCode]}`;
  }
}

export const accessPlatformAPI = new AccessPlatformAPI();
