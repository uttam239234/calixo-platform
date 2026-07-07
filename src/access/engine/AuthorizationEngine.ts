/**
 * Calixo Platform - Authorization Engine
 *
 * Core authorization engine that evaluates access requests.
 * Supports role checks, permission checks, feature checks,
 * organization checks, workspace checks, subscription checks,
 * and policy evaluation.
 */

import { appLogger } from '@/logging';
import { PermissionError } from '@/errors';
import type {
  AuthorizationRequest,
  AuthorizationResult,
  AccessContext,
  Policy,
  PolicyCondition,
} from '@/access/types';
import type { UserRoleAssignmentRepository, PolicyRepository, PolicyAssignmentRepository } from '@/access/repositories/interfaces';
import { sharedPolicyAssignmentRepository, sharedPolicyRepository, sharedUserRoleAssignmentRepository } from '@/access/repositories/sharedInstances';
import { roleService } from '@/access/services/RoleService';

export class AuthorizationEngine {
  private userAssignmentRepo: UserRoleAssignmentRepository;
  private policyRepo: PolicyRepository;
  private policyAssignmentRepo: PolicyAssignmentRepository;

  constructor(
    userAssignmentRepo?: UserRoleAssignmentRepository,
    policyRepo?: PolicyRepository,
    policyAssignmentRepo?: PolicyAssignmentRepository
  ) {
    // Shared with `RoleService`/`PolicyService`'s default instances — see
    // `sharedInstances.ts`. Previously each independently default-constructed
    // its own repository, so a role assigned via `roleService` (or a policy
    // created via `policyService`) was invisible here — discovered via live
    // integration testing while building the Enterprise Access Control
    // Platform (Track 1 Phase 3).
    this.userAssignmentRepo = userAssignmentRepo || sharedUserRoleAssignmentRepository;
    this.policyRepo = policyRepo || sharedPolicyRepository;
    this.policyAssignmentRepo = policyAssignmentRepo || sharedPolicyAssignmentRepository;
  }

  /**
   * Check if a user is authorized to perform an action.
   * This is the main entry point for all authorization checks.
   */
  async authorize(request: AuthorizationRequest): Promise<AuthorizationResult> {
    const startTime = performance.now();

    try {
      // 1. Check if user has wildcard access (Owner role)
      const hasWildcard = await roleService.hasWildcardAccess(
        request.userId,
        request.organizationId
      );
      if (hasWildcard) {
        const result: AuthorizationResult = {
          authorized: true,
          source: 'role',
          evaluatedRoles: ['Owner'],
          metadata: { evaluationTime: performance.now() - startTime },
        };
        return result;
      }

      // 2. Get user permissions
      const userPermissions = await this.userAssignmentRepo.getPermissionNamesByUser(
        request.userId,
        request.organizationId
      );

      // 3. Direct permission check
      if (userPermissions.includes(request.permission)) {
        const result: AuthorizationResult = {
          authorized: true,
          source: 'permission',
          evaluatedRoles: await this.userAssignmentRepo.getRoleNamesByUser(
            request.userId,
            request.organizationId
          ),
          metadata: { evaluationTime: performance.now() - startTime },
        };
        return result;
      }

      // 4. Evaluate policies
      const policyResult = await this.evaluatePolicies(request);
      if (policyResult) {
        return policyResult;
      }

      // 5. Check subscription-based access
      const subscriptionResult = await this.checkSubscriptionAccess(request);
      if (subscriptionResult) {
        return subscriptionResult;
      }

      // 6. Deny access
      const deniedResult: AuthorizationResult = {
        authorized: false,
        reason: `Missing required permission: ${request.permission}`,
        source: 'denied',
        evaluatedRoles: await this.userAssignmentRepo.getRoleNamesByUser(
          request.userId,
          request.organizationId
        ),
        metadata: { evaluationTime: performance.now() - startTime },
      };

      appLogger.warn('AuthorizationEngine', `Access denied for user ${request.userId}`, {
        permission: request.permission,
        organizationId: request.organizationId,
      });

      return deniedResult;
    } catch (error) {
      appLogger.error('AuthorizationEngine', 'Authorization check failed', error as Error);
      return {
        authorized: false,
        reason: 'Authorization check failed due to internal error',
        source: 'denied',
        metadata: { error: (error as Error).message },
      };
    }
  }

  /**
   * Quick permission check - returns boolean for convenience.
   */
  async can(request: AuthorizationRequest): Promise<boolean> {
    const result = await this.authorize(request);
    return result.authorized;
  }

  /**
   * Assert that a user has permission - throws if not authorized.
   */
  async requirePermission(request: AuthorizationRequest): Promise<void> {
    const result = await this.authorize(request);
    if (!result.authorized) {
      throw new PermissionError(result.reason || 'Insufficient permissions');
    }
  }

  /**
   * Check if user has a specific role.
   */
  async hasRole(userId: string, roleSlug: string, organizationId?: string): Promise<boolean> {
    const roles = await this.userAssignmentRepo.getRoleNamesByUser(userId, organizationId);
    return roles.includes(roleSlug);
  }

  /**
   * Check if user has any of the specified roles.
   */
  async hasAnyRole(userId: string, roleSlugs: string[], organizationId?: string): Promise<boolean> {
    const roles = await this.userAssignmentRepo.getRoleNamesByUser(userId, organizationId);
    return roleSlugs.some(slug => roles.includes(slug));
  }

  /**
   * Check if user has all of the specified roles.
   */
  async hasAllRoles(userId: string, roleSlugs: string[], organizationId?: string): Promise<boolean> {
    const roles = await this.userAssignmentRepo.getRoleNamesByUser(userId, organizationId);
    return roleSlugs.every(slug => roles.includes(slug));
  }

  /**
   * Check if user has a specific permission.
   */
  async hasPermission(userId: string, permission: string, organizationId?: string): Promise<boolean> {
    const permissions = await this.userAssignmentRepo.getPermissionNamesByUser(userId, organizationId);
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions.
   */
  async hasAnyPermission(userId: string, permissions: string[], organizationId?: string): Promise<boolean> {
    const userPerms = await this.userAssignmentRepo.getPermissionNamesByUser(userId, organizationId);
    if (userPerms.includes('*')) return true;
    return permissions.some(p => userPerms.includes(p));
  }

  /**
   * Check if user has all of the specified permissions.
   */
  async hasAllPermissions(userId: string, permissions: string[], organizationId?: string): Promise<boolean> {
    const userPerms = await this.userAssignmentRepo.getPermissionNamesByUser(userId, organizationId);
    if (userPerms.includes('*')) return true;
    return permissions.every(p => userPerms.includes(p));
  }

  /**
   * Get the full access context for a user.
   */
  async getAccessContext(userId: string, organizationId?: string): Promise<AccessContext> {
    const permissions = await this.userAssignmentRepo.getPermissionNamesByUser(userId, organizationId);
    const roleIds = await this.userAssignmentRepo.getRoleNamesByUser(userId, organizationId);

    return {
      userId,
      organizationId,
      roleIds,
      permissions,
      isOwner: permissions.includes('*'),
      isSuperAdmin: roleIds.includes('super-admin'),
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async evaluatePolicies(request: AuthorizationRequest): Promise<AuthorizationResult | null> {
    const enabledPolicies = await this.policyRepo.getEnabled();

    // Filter policies relevant to this request
    const relevantPolicies = enabledPolicies.filter(policy => {
      return this.isPolicyRelevant(policy, request);
    });

    if (relevantPolicies.length === 0) return null;

    // Sort by priority (higher priority first)
    relevantPolicies.sort((a, b) => b.priority - a.priority);

    const evaluatedPolicies: string[] = [];

    for (const policy of relevantPolicies) {
      evaluatedPolicies.push(policy.name);

      // Check conditions
      if (policy.conditions && policy.conditions.length > 0) {
        const conditionsMet = this.evaluateConditions(policy.conditions, request);
        if (!conditionsMet) continue;
      }

      // Policy matched
      if (policy.effect === 'deny') {
        return {
          authorized: false,
          reason: `Access denied by policy: ${policy.name}`,
          source: 'policy',
          evaluatedPolicies,
        };
      }

      if (policy.effect === 'allow') {
        return {
          authorized: true,
          source: 'policy',
          evaluatedPolicies,
        };
      }
    }

    return null;
  }

  private isPolicyRelevant(policy: Policy, request: AuthorizationRequest): boolean {
    const { scope } = policy;

    if (!scope) return false;

    // Check organization scope
    if (scope.organizationIds && request.organizationId) {
      if (!scope.organizationIds.includes(request.organizationId)) return false;
    }

    // Check workspace scope
    if (scope.workspaceIds && request.workspaceId) {
      if (!scope.workspaceIds.includes(request.workspaceId)) return false;
    }

    // Check team scope
    if (scope.teamIds && request.teamId) {
      if (!scope.teamIds.includes(request.teamId)) return false;
    }

    // Check user scope
    if (scope.userIds) {
      if (!scope.userIds.includes(request.userId)) return false;
    }

    return true;
  }

  private evaluateConditions(conditions: PolicyCondition[], request: AuthorizationRequest): boolean {
    return conditions.every(condition => {
      const value = this.getContextValue(request, condition.field);
      return this.evaluateCondition(value, condition);
    });
  }

  private getContextValue(request: AuthorizationRequest, field: string): unknown {
    const contextMap: Record<string, unknown> = {
      'user.id': request.userId,
      'organization.id': request.organizationId,
      'workspace.id': request.workspaceId,
      'team.id': request.teamId,
      'resource': request.resource,
      'resourceId': request.resourceId,
      'permission': request.permission,
      ...request.context,
    };
    return contextMap[field];
  }

  private evaluateCondition(value: unknown, condition: PolicyCondition): boolean {
    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'neq':
        return value !== condition.value;
      case 'gt':
        return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value;
      case 'gte':
        return typeof value === 'number' && typeof condition.value === 'number' && value >= condition.value;
      case 'lt':
        return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value;
      case 'lte':
        return typeof value === 'number' && typeof condition.value === 'number' && value <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case 'contains':
        return typeof value === 'string' && typeof condition.value === 'string' && value.includes(condition.value);
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  private async checkSubscriptionAccess(request: AuthorizationRequest): Promise<AuthorizationResult | null> {
    // Subscription-based access checks
    // This is a placeholder for future implementation
    return null;
  }
}

export const authorizationEngine = new AuthorizationEngine();