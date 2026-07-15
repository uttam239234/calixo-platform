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

export type TimeFormat = "12h" | "24h";
export type MeasurementUnit = "metric" | "imperial";
export type PasswordPolicyStrength = "basic" | "strong" | "strict";

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  language: string;
  defaultCurrency: string;
  measurementUnit: MeasurementUnit;
  security: {
    twoFactorRequired: boolean;
    sessionTimeoutMinutes: number;
    passwordPolicyStrength: PasswordPolicyStrength;
    allowedEmailDomains: string[];
  };
}

export interface OrganizationPreferences {
  defaultLandingModule: string;
  digestFrequency: "daily" | "weekly" | "off";
  theme: "light" | "dark" | "system";
}

export interface OrganizationAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/** Business-facing organization contact/profile info — the fields "My Company" settings screens need beyond the core identity fields (name/slug/owner). */
export interface OrganizationProfileInfo {
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  address?: OrganizationAddress;
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
  /** The real Clerk Organization this record is bridged to — added for production identity (Round 18). Absent for organizations that predate the Clerk migration until first touched by a real sign-in. */
  clerkOrgId?: string;
  status: OrganizationStatus;
  tier: SubscriptionTier;
  profile: OrganizationProfileInfo;
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
  clerkOrgId?: string;
  tier?: SubscriptionTier;
  profile?: Partial<OrganizationProfileInfo>;
  settings?: Partial<OrganizationSettings>;
  branding?: Partial<OrganizationBranding>;
}

export interface UpdateOrganizationInput {
  name?: string;
  profile?: Partial<OrganizationProfileInfo>;
  settings?: Partial<OrganizationSettings>;
  branding?: Partial<OrganizationBranding>;
  preferences?: Partial<OrganizationPreferences>;
}
