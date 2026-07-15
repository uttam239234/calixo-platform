import { platformEventBus } from "../events/PlatformEventBus";
import { subscriptionEngine } from "../subscription/SubscriptionEngine";
import type { SubscriptionTier } from "../subscription/types";
import { organizationRegistry } from "./OrganizationRegistry";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationAuditEntry,
  OrganizationInvitation,
  OrganizationInvitationStatus,
  OrganizationLifecycleEvent,
  OrganizationLifecycleEventType,
  OrganizationMember,
  OrganizationMemberRole,
  UpdateOrganizationInput,
} from "./types";

function now(): string {
  return new Date().toISOString();
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const DEFAULT_SETTINGS = (): Organization["settings"] => ({
  timezone: "UTC",
  dateFormat: "MMM d, yyyy",
  timeFormat: "12h",
  language: "en",
  defaultCurrency: "USD",
  measurementUnit: "imperial",
  security: { twoFactorRequired: false, sessionTimeoutMinutes: 60, passwordPolicyStrength: "basic", allowedEmailDomains: [] },
});

const DEFAULT_PROFILE = (): Organization["profile"] => ({});

const DEFAULT_BRANDING = (): Organization["branding"] => ({
  colors: { primary: "#4F46E5", secondary: "#0EA5E9", accent: "#F59E0B" },
});

const DEFAULT_PREFERENCES = (): Organization["preferences"] => ({
  defaultLandingModule: "dashboard",
  digestFrequency: "weekly",
  theme: "system",
});

/**
 * Canonical Organization lifecycle engine. Owns creation, membership,
 * invitations, status transitions, audit, and feature-flag overrides for
 * every Organization — the single implementation every module (and
 * `TenantContextService`) should resolve organizations through.
 */
export class OrganizationEngine {
  private members = new Map<string, OrganizationMember[]>();
  private invitations = new Map<string, OrganizationInvitation>();
  private lifecycle: OrganizationLifecycleEvent[] = [];
  private audit: OrganizationAuditEntry[] = [];

  create(input: CreateOrganizationInput): Organization {
    const id = `org-${slugify(input.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const tier: SubscriptionTier = input.tier ?? "trial";
    const organization: Organization = {
      id,
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      ownerId: input.ownerId,
      clerkOrgId: input.clerkOrgId,
      status: tier === "trial" ? "trial" : "active",
      tier,
      profile: { ...DEFAULT_PROFILE(), ...input.profile },
      settings: { ...DEFAULT_SETTINGS(), ...input.settings, security: { ...DEFAULT_SETTINGS().security, ...input.settings?.security } },
      branding: { ...DEFAULT_BRANDING(), ...input.branding },
      preferences: DEFAULT_PREFERENCES(),
      featureFlagOverrides: {},
      metadata: {},
      memberCount: 1,
      createdAt: now(),
      updatedAt: now(),
    };
    organizationRegistry.register(organization);
    subscriptionEngine.assign(id, tier);
    this.addMember(id, input.ownerId, "owner");
    this.recordLifecycle(id, "created", input.ownerId);
    this.recordAudit(id, input.ownerId, "organization.created", id);
    void platformEventBus.publish({ type: "OrganizationCreated", organizationId: id, userId: input.ownerId, payload: { name: organization.name, tier } });
    return organization;
  }

  update(id: string, input: UpdateOrganizationInput, actorId: string): Organization | undefined {
    const organization = organizationRegistry.lookup(id);
    if (!organization) return undefined;
    if (input.name) organization.name = input.name;
    if (input.profile) organization.profile = { ...organization.profile, ...input.profile, address: { ...organization.profile.address, ...input.profile.address } };
    if (input.settings) organization.settings = { ...organization.settings, ...input.settings, security: { ...organization.settings.security, ...input.settings.security } };
    if (input.branding) organization.branding = { ...organization.branding, ...input.branding, colors: { ...organization.branding.colors, ...input.branding.colors } };
    if (input.preferences) organization.preferences = { ...organization.preferences, ...input.preferences };
    organization.updatedAt = now();
    this.recordAudit(id, actorId, "organization.updated", id);
    void platformEventBus.publish({ type: "OrganizationUpdated", organizationId: id, userId: actorId, payload: { name: organization.name } });
    return organization;
  }

  changeTier(id: string, tier: SubscriptionTier, actorId: string): Organization | undefined {
    const organization = organizationRegistry.lookup(id);
    if (!organization) return undefined;
    organization.tier = tier;
    organization.updatedAt = now();
    subscriptionEngine.changeTier(id, tier);
    this.recordLifecycle(id, "tier-changed", actorId, `Tier changed to ${tier}`);
    this.recordAudit(id, actorId, "organization.tier-changed", tier);
    return organization;
  }

  suspend(id: string, actorId: string): Organization | undefined {
    const organization = organizationRegistry.lookup(id);
    if (!organization) return undefined;
    organization.status = "suspended";
    organization.updatedAt = now();
    this.recordLifecycle(id, "suspended", actorId);
    this.recordAudit(id, actorId, "organization.suspended", id);
    return organization;
  }

  restore(id: string, actorId: string): Organization | undefined {
    const organization = organizationRegistry.lookup(id);
    if (!organization) return undefined;
    organization.status = "active";
    organization.archivedAt = undefined;
    organization.updatedAt = now();
    this.recordLifecycle(id, "restored", actorId);
    this.recordAudit(id, actorId, "organization.restored", id);
    return organization;
  }

  archive(id: string, actorId: string): Organization | undefined {
    const organization = organizationRegistry.lookup(id);
    if (!organization) return undefined;
    organization.status = "archived";
    organization.archivedAt = now();
    organization.updatedAt = now();
    this.recordLifecycle(id, "archived", actorId);
    this.recordAudit(id, actorId, "organization.archived", id);
    void platformEventBus.publish({ type: "OrganizationArchived", organizationId: id, userId: actorId, payload: {} });
    return organization;
  }

  // -- Members --------------------------------------------------------

  addMember(organizationId: string, userId: string, role: OrganizationMemberRole = "member"): OrganizationMember {
    const member: OrganizationMember = { id: `orgmem-${organizationId}-${userId}`, organizationId, userId, role, joinedAt: now(), isActive: true };
    const list = this.members.get(organizationId) ?? [];
    list.push(member);
    this.members.set(organizationId, list);
    const organization = organizationRegistry.lookup(organizationId);
    if (organization) organization.memberCount = list.filter(m => m.isActive).length;
    return member;
  }

  removeMember(organizationId: string, userId: string, actorId: string): boolean {
    const list = this.members.get(organizationId);
    const member = list?.find(m => m.userId === userId);
    if (!member) return false;
    member.isActive = false;
    const organization = organizationRegistry.lookup(organizationId);
    if (organization) organization.memberCount = (list ?? []).filter(m => m.isActive).length;
    this.recordAudit(organizationId, actorId, "organization.member-removed", userId);
    return true;
  }

  updateMemberRole(organizationId: string, userId: string, role: OrganizationMemberRole, actorId: string): OrganizationMember | undefined {
    const member = this.members.get(organizationId)?.find(m => m.userId === userId);
    if (!member) return undefined;
    member.role = role;
    this.recordAudit(organizationId, actorId, "organization.member-role-changed", userId, { role });
    void platformEventBus.publish({ type: "MemberRoleChanged", organizationId, userId, payload: { role } });
    return member;
  }

  getMembers(organizationId: string): OrganizationMember[] {
    return (this.members.get(organizationId) ?? []).filter(m => m.isActive);
  }

  /** Organizations a given user is an active member of — the tenant-resolution step a login flow needs to pick which organization/workspace to enter. */
  getOrganizationsForUser(userId: string): Organization[] {
    const organizationIds = new Set<string>();
    for (const [organizationId, list] of this.members.entries()) {
      if (list.some(m => m.userId === userId && m.isActive)) organizationIds.add(organizationId);
    }
    return organizationRegistry.list().filter(o => organizationIds.has(o.id));
  }

  // -- Invitations ------------------------------------------------------

  invite(organizationId: string, email: string, role: OrganizationMemberRole, invitedBy: string): OrganizationInvitation {
    const invitation: OrganizationInvitation = {
      id: `orginv-${organizationId}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId,
      email,
      role,
      status: "pending",
      invitedBy,
      invitedAt: now(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.invitations.set(invitation.id, invitation);
    this.recordAudit(organizationId, invitedBy, "organization.invitation-sent", email);
    void platformEventBus.publish({ type: "UserInvited", organizationId, userId: invitedBy, payload: { email, role } });
    return invitation;
  }

  respondToInvitation(invitationId: string, status: Extract<OrganizationInvitationStatus, "accepted" | "rejected">, userId: string): OrganizationInvitation | undefined {
    const invitation = this.invitations.get(invitationId);
    if (!invitation || invitation.status !== "pending") return undefined;
    invitation.status = status;
    invitation.respondedAt = now();
    if (status === "accepted") {
      this.addMember(invitation.organizationId, userId, invitation.role);
      void platformEventBus.publish({ type: "UserJoined", organizationId: invitation.organizationId, userId, payload: { role: invitation.role } });
      void platformEventBus.publish({ type: "InvitationAccepted", organizationId: invitation.organizationId, userId, payload: { invitationId, email: invitation.email, role: invitation.role } });
    }
    return invitation;
  }

  revokeInvitation(invitationId: string, actorId: string): boolean {
    const invitation = this.invitations.get(invitationId);
    if (!invitation) return false;
    invitation.status = "revoked";
    this.recordAudit(invitation.organizationId, actorId, "organization.invitation-revoked", invitationId);
    return true;
  }

  getInvitations(organizationId: string): OrganizationInvitation[] {
    return Array.from(this.invitations.values()).filter(i => i.organizationId === organizationId);
  }

  // -- Feature flag overrides -------------------------------------------

  setFeatureFlagOverride(organizationId: string, flagId: string, enabled: boolean): void {
    const organization = organizationRegistry.lookup(organizationId);
    if (!organization) return;
    organization.featureFlagOverrides[flagId] = enabled;
    void platformEventBus.publish({ type: "FeatureFlagChanged", organizationId, payload: { flagId, enabled, scope: "organization" } });
  }

  // -- Lifecycle & audit --------------------------------------------------

  private recordLifecycle(organizationId: string, type: OrganizationLifecycleEventType, actor: string, details?: string): void {
    this.lifecycle.push({ id: `orglc-${organizationId}-${this.lifecycle.length}`, organizationId, type, actor, timestamp: now(), details });
  }

  private recordAudit(organizationId: string, actorId: string, action: string, target?: string, metadata?: Record<string, unknown>): void {
    this.audit.push({ id: `orgaudit-${organizationId}-${this.audit.length}`, organizationId, actorId, action, target, timestamp: now(), metadata });
  }

  getLifecycle(organizationId: string): OrganizationLifecycleEvent[] {
    return this.lifecycle.filter(l => l.organizationId === organizationId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAuditTrail(organizationId: string): OrganizationAuditEntry[] {
    return this.audit.filter(a => a.organizationId === organizationId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const organizationEngine = new OrganizationEngine();
