/**
 * Calixo Platform - Authorization Middleware
 *
 * Reusable middleware for protecting routes, API endpoints, services, and actions.
 * Provides both async/await and higher-order function patterns.
 */

import { PermissionError, AuthenticationError } from '@/errors';
import { authorizationEngine } from '@/access/engine/AuthorizationEngine';
import { auditService } from '@/access/audit/AuditService';
import type { AuthorizationRequest } from '@/access/types';

// ============================================================================
// Types
// ============================================================================

export interface AuthContext {
  userId: string;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export type PermissionCheck = string | string[];

export interface MiddlewareOptions {
  requireAll?: boolean; // If true, requires ALL permissions (default: any)
  requireAuth?: boolean; // If true, requires authentication (default: true)
  auditOnDeny?: boolean; // If true, logs audit event on denial (default: true)
}

// ============================================================================
// Authorization Middleware
// ============================================================================

export class AuthorizationMiddleware {
  /**
   * Check if the current user has a specific permission.
   * Use this for protecting individual actions/service calls.
   */
  async requirePermission(
    authContext: AuthContext,
    permission: string,
    options: MiddlewareOptions = {}
  ): Promise<void> {
    if (options.requireAuth !== false && !authContext.userId) {
      throw new AuthenticationError('Authentication required');
    }

    const request: AuthorizationRequest = {
      userId: authContext.userId,
      organizationId: authContext.organizationId,
      workspaceId: authContext.workspaceId,
      teamId: authContext.teamId,
      permission,
    };

    const result = await authorizationEngine.authorize(request);

    if (!result.authorized) {
      if (options.auditOnDeny !== false) {
        await auditService.recordAuthorizationFailure({
          organizationId: authContext.organizationId,
          workspaceId: authContext.workspaceId,
          userId: authContext.userId,
          permission,
          reason: result.reason || 'Insufficient permissions',
          ipAddress: authContext.ipAddress,
          userAgent: authContext.userAgent,
        });
      }
      throw new PermissionError(result.reason || `Missing required permission: ${permission}`);
    }
  }

  /**
   * Check if the current user has any of the specified permissions.
   */
  async requireAnyPermission(
    authContext: AuthContext,
    permissions: string[],
    options: MiddlewareOptions = {}
  ): Promise<void> {
    if (options.requireAuth !== false && !authContext.userId) {
      throw new AuthenticationError('Authentication required');
    }

    for (const permission of permissions) {
      const request: AuthorizationRequest = {
        userId: authContext.userId,
        organizationId: authContext.organizationId,
        workspaceId: authContext.workspaceId,
        teamId: authContext.teamId,
        permission,
      };

      const result = await authorizationEngine.authorize(request);
      if (result.authorized) return;
    }

    if (options.auditOnDeny !== false) {
      await auditService.recordAuthorizationFailure({
        organizationId: authContext.organizationId,
        workspaceId: authContext.workspaceId,
        userId: authContext.userId,
        permission: permissions.join(', '),
        reason: 'None of the required permissions granted',
        ipAddress: authContext.ipAddress,
        userAgent: authContext.userAgent,
      });
    }

    throw new PermissionError(`Missing required permission. Requires one of: ${permissions.join(', ')}`);
  }

  /**
   * Check if the current user has all of the specified permissions.
   */
  async requireAllPermissions(
    authContext: AuthContext,
    permissions: string[],
    options: MiddlewareOptions = {}
  ): Promise<void> {
    if (options.requireAuth !== false && !authContext.userId) {
      throw new AuthenticationError('Authentication required');
    }

    for (const permission of permissions) {
      const request: AuthorizationRequest = {
        userId: authContext.userId,
        organizationId: authContext.organizationId,
        workspaceId: authContext.workspaceId,
        teamId: authContext.teamId,
        permission,
      };

      const result = await authorizationEngine.authorize(request);
      if (!result.authorized) {
        if (options.auditOnDeny !== false) {
          await auditService.recordAuthorizationFailure({
            organizationId: authContext.organizationId,
            workspaceId: authContext.workspaceId,
            userId: authContext.userId,
            permission,
            reason: result.reason || 'Insufficient permissions',
            ipAddress: authContext.ipAddress,
            userAgent: authContext.userAgent,
          });
        }
        throw new PermissionError(result.reason || `Missing required permission: ${permission}`);
      }
    }
  }

  /**
   * Check if the current user has a specific role.
   */
  async requireRole(
    authContext: AuthContext,
    roleSlug: string,
    options: MiddlewareOptions = {}
  ): Promise<void> {
    if (options.requireAuth !== false && !authContext.userId) {
      throw new AuthenticationError('Authentication required');
    }

    const hasRole = await authorizationEngine.hasRole(
      authContext.userId,
      roleSlug,
      authContext.organizationId
    );

    if (!hasRole) {
      throw new PermissionError(`Required role: ${roleSlug}`);
    }
  }

  /**
   * Check if the current user has any of the specified roles.
   */
  async requireAnyRole(
    authContext: AuthContext,
    roleSlugs: string[],
    options: MiddlewareOptions = {}
  ): Promise<void> {
    if (options.requireAuth !== false && !authContext.userId) {
      throw new AuthenticationError('Authentication required');
    }

    const hasAny = await authorizationEngine.hasAnyRole(
      authContext.userId,
      roleSlugs,
      authContext.organizationId
    );

    if (!hasAny) {
      throw new PermissionError(`Required one of roles: ${roleSlugs.join(', ')}`);
    }
  }

  /**
   * Create a permission guard function that can be used as a higher-order function.
   * Useful for wrapping service methods or API handlers.
   */
  createPermissionGuard(permission: string, options: MiddlewareOptions = {}) {
    return async (authContext: AuthContext): Promise<void> => {
      return this.requirePermission(authContext, permission, options);
    };
  }

  /**
   * Create a role guard function.
   */
  createRoleGuard(roleSlug: string, options: MiddlewareOptions = {}) {
    return async (authContext: AuthContext): Promise<void> => {
      return this.requireRole(authContext, roleSlug, options);
    };
  }

  /**
   * Check permissions silently (no throw) - returns boolean.
   */
  async can(
    authContext: AuthContext,
    permission: string
  ): Promise<boolean> {
    if (!authContext.userId) return false;

    const request: AuthorizationRequest = {
      userId: authContext.userId,
      organizationId: authContext.organizationId,
      workspaceId: authContext.workspaceId,
      teamId: authContext.teamId,
      permission,
    };

    const result = await authorizationEngine.authorize(request);
    return result.authorized;
  }

  /**
   * Check any permissions silently.
   */
  async canAny(
    authContext: AuthContext,
    permissions: string[]
  ): Promise<boolean> {
    if (!authContext.userId) return false;

    for (const permission of permissions) {
      const request: AuthorizationRequest = {
        userId: authContext.userId,
        organizationId: authContext.organizationId,
        workspaceId: authContext.workspaceId,
        teamId: authContext.teamId,
        permission,
      };

      const result = await authorizationEngine.authorize(request);
      if (result.authorized) return true;
    }

    return false;
  }

  /**
   * Check all permissions silently.
   */
  async canAll(
    authContext: AuthContext,
    permissions: string[]
  ): Promise<boolean> {
    if (!authContext.userId) return false;

    for (const permission of permissions) {
      const request: AuthorizationRequest = {
        userId: authContext.userId,
        organizationId: authContext.organizationId,
        workspaceId: authContext.workspaceId,
        teamId: authContext.teamId,
        permission,
      };

      const result = await authorizationEngine.authorize(request);
      if (!result.authorized) return false;
    }

    return true;
  }
}

export const authorizationMiddleware = new AuthorizationMiddleware();