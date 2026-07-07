/**
 * Calixo Platform - Permission Cache
 *
 * Caches the effective permission set for a (userId, organizationId) pair
 * for a short TTL. Invalidation is dual-path, both genuinely wired:
 * (1) `RolePlatformAPI`/`PolicyPlatformAPI` call `invalidateUser()`/
 * `invalidateOrganization()` directly and synchronously on every mutation
 * — reliable today. (2) The same invalidation is ALSO registered as
 * `PlatformEventBus` handlers for `RoleAssigned`/`RoleRemoved`/
 * `PermissionGranted`/`PermissionRevoked`/`PolicyCreated/Updated/Deleted`
 * — correct, but dormant until a future phase starts the background
 * event bus's dispatch loop (per the established "never auto-start the
 * processor" precedent from the Platform Foundation phase). Registering
 * the handler now costs nothing and means path (2) needs zero extra work
 * once that loop starts.
 */
import { platformEventBus } from "../events/PlatformEventBus";
import type { PlatformEventType } from "../events/types";

interface CacheEntry {
  permissions: string[];
  expiresAt: number;
}

const TTL_MS = 60_000;
const INVALIDATING_EVENTS: PlatformEventType[] = ["RoleAssigned", "RoleRemoved", "PermissionGranted", "PermissionRevoked", "PolicyCreated", "PolicyUpdated", "PolicyDeleted"];

function cacheKey(userId: string, organizationId?: string): string {
  return `${userId}::${organizationId ?? "none"}`;
}

export class PermissionCache {
  private entries = new Map<string, CacheEntry>();

  constructor() {
    for (const eventType of INVALIDATING_EVENTS) {
      platformEventBus.registerHandler(`permission-cache-invalidate-${eventType}`, event => {
        if (event.userId) this.invalidateUser(event.userId, event.organizationId);
        else if (event.organizationId) this.invalidateOrganization(event.organizationId);
      });
    }
  }

  get(userId: string, organizationId?: string): string[] | undefined {
    const entry = this.entries.get(cacheKey(userId, organizationId));
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(cacheKey(userId, organizationId));
      return undefined;
    }
    return entry.permissions;
  }

  set(userId: string, permissions: string[], organizationId?: string): void {
    this.entries.set(cacheKey(userId, organizationId), { permissions, expiresAt: Date.now() + TTL_MS });
  }

  invalidateUser(userId: string, organizationId?: string): void {
    if (organizationId) {
      this.entries.delete(cacheKey(userId, organizationId));
      return;
    }
    for (const key of this.entries.keys()) {
      if (key.startsWith(`${userId}::`)) this.entries.delete(key);
    }
  }

  invalidateOrganization(organizationId: string): void {
    for (const key of this.entries.keys()) {
      if (key.endsWith(`::${organizationId}`)) this.entries.delete(key);
    }
  }

  size(): number {
    return this.entries.size;
  }
}

export const permissionCache = new PermissionCache();
