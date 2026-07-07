/**
 * Calixo Platform - Ownership Engine
 *
 * `src/access`'s `AccessContext.isOwner` only ever meant "has the wildcard
 * permission" — there was no per-resource ownership model. This is new:
 * a real registry of who owns/created/edits/reviews/publishes/approves/
 * manages/is-assigned-to a specific resource instance, independent of RBAC
 * role assignment.
 */
import type { OwnershipGrant, OwnershipRoleType, ResourceType } from "./types";

export class OwnershipEngine {
  private grants: OwnershipGrant[] = [];

  assign(resourceType: ResourceType, resourceId: string, userId: string, role: OwnershipRoleType): OwnershipGrant {
    const existing = this.grants.find(g => g.resourceType === resourceType && g.resourceId === resourceId && g.userId === userId && g.role === role);
    if (existing) return existing;
    const grant: OwnershipGrant = { id: `own-${resourceType}-${resourceId}-${userId}-${role}`, resourceType, resourceId, userId, role, grantedAt: new Date().toISOString() };
    this.grants.push(grant);
    return grant;
  }

  revoke(resourceType: ResourceType, resourceId: string, userId: string, role: OwnershipRoleType): boolean {
    const before = this.grants.length;
    this.grants = this.grants.filter(g => !(g.resourceType === resourceType && g.resourceId === resourceId && g.userId === userId && g.role === role));
    return this.grants.length !== before;
  }

  isOwner(resourceType: ResourceType, resourceId: string, userId: string): boolean {
    return this.grants.some(g => g.resourceType === resourceType && g.resourceId === resourceId && g.userId === userId && g.role === "owner");
  }

  hasOwnershipRole(resourceType: ResourceType, resourceId: string, userId: string, role: OwnershipRoleType): boolean {
    return this.grants.some(g => g.resourceType === resourceType && g.resourceId === resourceId && g.userId === userId && g.role === role);
  }

  getRoles(resourceType: ResourceType, resourceId: string, userId: string): OwnershipRoleType[] {
    return this.grants.filter(g => g.resourceType === resourceType && g.resourceId === resourceId && g.userId === userId).map(g => g.role);
  }

  getGrantsForResource(resourceType: ResourceType, resourceId: string): OwnershipGrant[] {
    return this.grants.filter(g => g.resourceType === resourceType && g.resourceId === resourceId);
  }

  count(): number {
    return this.grants.length;
  }
}

export const ownershipEngine = new OwnershipEngine();
