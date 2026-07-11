/**
 * Calixo Platform - Organization Types
 *
 * Core types for multi-tenant organization management.
 */

import type { OrganizationMemberRole } from "@/core/platform/organizations/types";

export type { OrganizationMemberRole };

/** Business-friendly labels for the underlying technical role — "Use business language only," per the Settings brief. */
export const ORGANIZATION_ROLE_LABELS: Record<OrganizationMemberRole, string> = {
  owner: "Owner",
  admin: "Consultant",
  member: "Member",
  guest: "Viewer",
};

export interface OrganizationProfile {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: OrganizationPlan;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  settings: OrganizationSettings;
  branding: OrganizationBranding;
  localization: OrganizationLocalization;
  business: OrganizationBusiness;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  /** The querying user's own role in this organization — absent only when the caller didn't ask for it. */
  myRole?: OrganizationMemberRole;
}

export type OrganizationPlan = 'free' | 'starter' | 'professional' | 'enterprise' | 'agency';

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 'monday' | 'sunday';
  language: string;
  defaultCurrency: string;
  security: {
    twoFactorRequired: boolean;
    ipAllowlist: string[];
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expiryDays: number;
    };
  };
  features: {
    allowMultipleWorkspaces: boolean;
    allowGuestAccess: boolean;
    allowApiAccess: boolean;
    allowWhiteLabel: boolean;
  };
}

export interface OrganizationBranding {
  logo?: string;
  logoDark?: string;
  favicon?: string;
  ogImage?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  typography?: {
    fontFamily?: string;
    headingFont?: string;
  };
  domain?: string;
  customCss?: string;
}

export interface OrganizationLocalization {
  defaultLocale: string;
  supportedLocales: string[];
  defaultTimezone: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 'monday' | 'sunday';
  numberFormat: {
    decimal: string;
    thousands: string;
    precision: number;
  };
}

export interface OrganizationBusiness {
  legalName?: string;
  taxId?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  ownerEmail?: string;
  industry?: string;
  companySize?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  settings?: Partial<OrganizationSettings>;
  branding?: Partial<OrganizationBranding>;
  localization?: Partial<OrganizationLocalization>;
  business?: Partial<OrganizationBusiness>;
}

// ============================================================================
// Organization Context
// ============================================================================

export interface OrganizationContextValue {
  organization: OrganizationProfile | null;
  organizations: OrganizationProfile[];
  isLoading: boolean;
  isSwitching: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (request: CreateOrganizationRequest) => Promise<OrganizationProfile>;
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => Promise<OrganizationProfile>;
  archiveOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

export interface OrganizationSwitcherProps {
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
  showCreateButton?: boolean;
  showSearch?: boolean;
  onSwitch?: (orgId: string) => void;
}