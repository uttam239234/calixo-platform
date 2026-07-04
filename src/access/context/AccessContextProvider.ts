/**
 * Calixo Platform - Access Context Provider
 *
 * Provides access context for the current user, organization, workspace,
 * team, permissions, and role. This is the bridge between the auth system
 * and the authorization engine.
 */

import { authorizationEngine } from '@/access/engine/AuthorizationEngine';
import type { AccessContext } from '@/access/types';

// ============================================================================
// Access Context Manager
// ============================================================================

export class AccessContextManager {
  private contextCache: Map<string, AccessContext> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  /**
   * Build a full access context for a user.
   */
  async buildContext(userId: string, organizationId?: string): Promise<AccessContext> {
    const cacheKey = `${userId}:${organizationId || 'global'}`;

    // Check cache
    const cached = this.contextCache.get(cacheKey);
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (cached && timestamp && Date.now() - timestamp < this.cacheTTL) {
      return cached;
    }

    const context = await authorizationEngine.getAccessContext(userId, organizationId);

    // Cache the context
    this.contextCache.set(cacheKey, context);
    this.cacheTimestamps.set(cacheKey, Date.now());

    return context;
  }

  /**
   * Invalidate cached context for a user.
   */
  invalidateContext(userId: string, organizationId?: string): void {
    const cacheKey = `${userId}:${organizationId || 'global'}`;
    this.contextCache.delete(cacheKey);
    this.cacheTimestamps.delete(cacheKey);
  }

  /**
   * Invalidate all cached contexts.
   */
  invalidateAll(): void {
    this.contextCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Set cache TTL in milliseconds.
   */
  setCacheTTL(ttlMs: number): void {
    this.cacheTTL = ttlMs;
  }

  /**
   * Get the current user's permissions from context.
   */
  async getUserPermissions(userId: string, organizationId?: string): Promise<string[]> {
    const context = await this.buildContext(userId, organizationId);
    return context.permissions;
  }

  /**
   * Get the current user's roles from context.
   */
  async getUserRoles(userId: string, organizationId?: string): Promise<string[]> {
    const context = await this.buildContext(userId, organizationId);
    return context.roleIds;
  }

  /**
   * Check if user is an owner (has wildcard access).
   */
  async isOwner(userId: string, organizationId?: string): Promise<boolean> {
    const context = await this.buildContext(userId, organizationId);
    return context.isOwner;
  }

  /**
   * Check if user is a super admin.
   */
  async isSuperAdmin(userId: string, organizationId?: string): Promise<boolean> {
    const context = await this.buildContext(userId, organizationId);
    return context.isSuperAdmin;
  }
}

export const accessContextManager = new AccessContextManager();