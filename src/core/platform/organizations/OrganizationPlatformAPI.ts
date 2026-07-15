/**
 * Calixo Platform - Organization Platform API
 *
 * Added during the Track 1 Enterprise Platform Certification: every other
 * `core/platform` domain (15 of 17 subpackages) exposes a `*PlatformAPI`
 * facade as its one sanctioned entry point, but Organizations — arguably
 * the most fundamental multi-tenancy primitive in the system — only ever
 * exposed its raw `organizationEngine`/`organizationRegistry` singletons.
 * This is a thin wrapper, not new logic: every method below already existed
 * on `OrganizationEngine`/`OrganizationRegistry` (both untouched).
 */
import { organizationEngine } from "./OrganizationEngine";
import { organizationRegistry, type OrganizationListParams } from "./OrganizationRegistry";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationAuditEntry,
  OrganizationInvitation,
  OrganizationInvitationStatus,
  OrganizationLifecycleEvent,
  OrganizationMember,
  OrganizationMemberRole,
  UpdateOrganizationInput,
} from "./types";
import type { SubscriptionTier } from "@/core/platform/subscription/types";

export class OrganizationPlatformAPI {
  create(input: CreateOrganizationInput): Organization {
    return organizationEngine.create(input);
  }

  update(id: string, input: UpdateOrganizationInput, actorId: string): Organization | undefined {
    return organizationEngine.update(id, input, actorId);
  }

  changeTier(id: string, tier: SubscriptionTier, actorId: string): Organization | undefined {
    return organizationEngine.changeTier(id, tier, actorId);
  }

  suspend(id: string, actorId: string): Organization | undefined {
    return organizationEngine.suspend(id, actorId);
  }

  restore(id: string, actorId: string): Organization | undefined {
    return organizationEngine.restore(id, actorId);
  }

  archive(id: string, actorId: string): Organization | undefined {
    return organizationEngine.archive(id, actorId);
  }

  get(id: string): Organization | undefined {
    return organizationRegistry.lookup(id);
  }

  getBySlug(slug: string): Organization | undefined {
    return organizationRegistry.lookupBySlug(slug);
  }

  list(params?: OrganizationListParams): Organization[] {
    return organizationRegistry.list(params);
  }

  getForUser(userId: string): Organization[] {
    return organizationEngine.getOrganizationsForUser(userId);
  }

  addMember(organizationId: string, userId: string, role?: OrganizationMemberRole): OrganizationMember {
    return organizationEngine.addMember(organizationId, userId, role);
  }

  removeMember(organizationId: string, userId: string, actorId: string): boolean {
    return organizationEngine.removeMember(organizationId, userId, actorId);
  }

  getMembers(organizationId: string): OrganizationMember[] {
    return organizationEngine.getMembers(organizationId);
  }

  invite(organizationId: string, email: string, role: OrganizationMemberRole, invitedBy: string): OrganizationInvitation {
    return organizationEngine.invite(organizationId, email, role, invitedBy);
  }

  respondToInvitation(invitationId: string, status: Extract<OrganizationInvitationStatus, "accepted" | "rejected">, userId: string): OrganizationInvitation | undefined {
    return organizationEngine.respondToInvitation(invitationId, status, userId);
  }

  count(): number {
    return organizationRegistry.count();
  }

  /** Added for the Audit Logs module — the engine has always recorded these (org create/update/tier-change/suspend/restore/archive/member changes/invitations); this is the first read path exposing them outside the raw engine. */
  getAuditTrail(organizationId: string): OrganizationAuditEntry[] {
    return organizationEngine.getAuditTrail(organizationId);
  }

  getLifecycle(organizationId: string): OrganizationLifecycleEvent[] {
    return organizationEngine.getLifecycle(organizationId);
  }
}

export const organizationPlatformAPI = new OrganizationPlatformAPI();
