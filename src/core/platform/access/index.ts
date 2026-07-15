/**
 * Calixo Platform - Enterprise Access Control Platform
 *
 * Built on top of (never replacing) `src/access`'s AuthorizationEngine,
 * RoleService, PermissionService, PolicyService, and AuditService — all
 * reused, none duplicated. New this phase: a canonical resource/action
 * permission matrix, ownership-based access, resource-hierarchy cascade,
 * a permission cache, permission templates, an orchestrating
 * AuthorizationPlatformAPI that adds ABAC/subscription/feature gating on
 * top of the existing RBAC+policy engine, a permission simulator with
 * "explain authorization," and API-authorization extension points.
 */
import { initializeAccessPlatform } from "@/access";
import { seedDefaultAccessPolicies } from "./policies";
import { seedBusinessRoles } from "./mock/seedBusinessRoles";

export * from "./types";

export { PermissionRegistry, permissionRegistry, permissionName, parsePermissionName } from "./PermissionRegistry";
export { OwnershipEngine, ownershipEngine } from "./OwnershipEngine";
export { ResourceHierarchy, resourceHierarchy } from "./ResourceHierarchy";
export { PermissionCache, permissionCache } from "./PermissionCache";
export { PermissionTemplateRegistry, permissionTemplateRegistry } from "./PermissionTemplateRegistry";

export { AuthorizationPlatformAPI, authorizationPlatformAPI, hasPlatformBypass } from "./AuthorizationPlatformAPI";
export { entitlementService } from "./EntitlementService";
export type { EntitlementModuleId, EntitlementReasonCode, EntitlementResult, EntitlementActor } from "./EntitlementService";
export { entitlementCache } from "./EntitlementCache";
export { PermissionPlatformAPI, permissionPlatformAPI } from "./PermissionPlatformAPI";
export { PolicyPlatformAPI, policyPlatformAPI } from "./PolicyPlatformAPI";
export { RolePlatformAPI, rolePlatformAPI } from "./RolePlatformAPI";
export { AccessPlatformAPI, accessPlatformAPI } from "./AccessPlatformAPI";
export { ResourceAuthorizationAPI, resourceAuthorizationAPI } from "./ResourceAuthorizationAPI";

export { seedDefaultAccessPolicies } from "./policies";
export { seedBusinessRoles, BUSINESS_ROLES, BUSINESS_ROLE_SLUGS } from "./mock/seedBusinessRoles";
export type { BusinessRoleSeed } from "./mock/seedBusinessRoles";
export * from "./apiAuth";

let initialized = false;

/**
 * Activates the existing (previously never-invoked) `initializeAccessPlatform()`
 * — seeds the real permission/system-role catalog — and registers the new
 * illustrative default access policies. Safe to call more than once.
 */
export async function initializeAccessControlFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;
  await initializeAccessPlatform();
  await seedDefaultAccessPolicies();
  await seedBusinessRoles();
}
