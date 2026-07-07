/**
 * Calixo Platform - Canonical Organization Platform Types
 *
 * Supersedes the orphaned `src/organizations/` prototype (real logic, never
 * wired into the running app — see the Enterprise Architecture Audit). This
 * is the canonical Organization model every module should build on.
 */

import type { SubscriptionTier } from "../subscription/types";

export type OrganizationStatus = "trial" | "active" | "suspended" | "archived";

export interface OrganizationBranding {
  logo?: string;
  logoDark?: string;
  favicon?: string;
  colors: { primary: string; secondary: string; accent: string };
  domain?: string;
}

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  language: string;
  defaultCurrency: string;
  security: { twoFactorRequired: boolean; sessionTimeoutMinutes: number };
}

export interface OrganizationPreferences {
  defaultLandingModule: string;
  digestFrequency: "daily" | "weekly" | "off";
  theme: "light" | "dark" | "system";
}

export type OrganizationMemberRole = "owner" | "admin" | "member" | "guest";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  joinedAt: string;
  isActive: boolean;
}

export type OrganizationInvitationStatus = "pending" | "accepted" | "rejected" | "expired" | "revoked";

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationMemberRole;
  status: OrganizationInvitationStatus;
  invitedBy: string;
  invitedAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export type OrganizationLifecycleEventType = "created" | "activated" | "suspended" | "restored" | "archived" | "tier-changed";

export interface OrganizationLifecycleEvent {
  id: string;
  organizationId: string;
  type: OrganizationLifecycleEventType;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface OrganizationAuditEntry {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  target?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  status: OrganizationStatus;
  tier: SubscriptionTier;
  settings: OrganizationSettings;
  branding: OrganizationBranding;
  preferences: OrganizationPreferences;
  /** Org-level overrides layered on top of platform/subscription defaults — resolved by `FeatureFlagEngine`. */
  featureFlagOverrides: Record<string, boolean>;
  metadata: Record<string, unknown>;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  ownerId: string;
  tier?: SubscriptionTier;
  settings?: Partial<OrganizationSettings>;
  branding?: Partial<OrganizationBranding>;
}

export interface UpdateOrganizationInput {
  name?: string;
  settings?: Partial<OrganizationSettings>;
  branding?: Partial<OrganizationBranding>;
  preferences?: Partial<OrganizationPreferences>;
}
