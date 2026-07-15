/**
 * Calixo Platform - Organization Service
 *
 * A thin adapter, not a second organization store. Every method here
 * delegates to the canonical `organizationPlatformAPI`/`organizationEngine`
 * (`src/core/platform/organizations`) — the real, multi-org-aware,
 * per-organization-role-aware engine — and maps its `Organization` shape
 * to/from this module's pre-existing `OrganizationProfile` shape, which 12
 * files across every certified module already import via `useOrganization()`.
 * Keeping this adapter's public method signatures unchanged means none of
 * those 12 files need to change; only what backs them becomes real.
 */

import { NotFoundError } from '@/errors';
import { organizationPlatformAPI } from '@/core/platform/organizations/OrganizationPlatformAPI';
import type { Organization, OrganizationStatus } from '@/core/platform/organizations/types';
import type { SubscriptionTier } from '@/core/platform/subscription/types';
import { entitlementService } from '@/core/platform/access';
import type {
  OrganizationProfile,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationPlan,
} from '@/organizations/types';

/** Round 21: `SubscriptionTier` shrank to trial/starter/growth/enterprise — `OrganizationPlan` (this module's own pre-existing, legacy display-only vocabulary, unrelated to real billing) is untouched, so this mapping just drops the removed tier keys. */
const TIER_TO_PLAN: Record<SubscriptionTier, OrganizationPlan> = {
  trial: 'free',
  starter: 'starter',
  growth: 'professional',
  enterprise: 'enterprise',
};

/** `'agency'` has no surviving equivalent tier — mapped to `'growth'`, the closest remaining paid tier below Enterprise. */
const PLAN_TO_TIER: Record<OrganizationPlan, SubscriptionTier> = {
  free: 'trial',
  starter: 'starter',
  professional: 'growth',
  enterprise: 'enterprise',
  agency: 'growth',
};

const STRENGTH_TO_PASSWORD_POLICY: Record<Organization['settings']['security']['passwordPolicyStrength'], OrganizationProfile['settings']['security']['passwordPolicy']> = {
  basic: { minLength: 8, requireUppercase: false, requireNumbers: false, requireSpecialChars: false, expiryDays: 0 },
  strong: { minLength: 10, requireUppercase: true, requireNumbers: true, requireSpecialChars: false, expiryDays: 180 },
  strict: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSpecialChars: true, expiryDays: 90 },
};

function isActiveStatus(status: OrganizationStatus): boolean {
  return status === "active" || status === "trial";
}

/** Canonical `Organization` → this module's legacy `OrganizationProfile` display shape. The canonical record is the source of truth; this is a read/compat view for the 12 pre-existing consumers. `viewerId`, when given, resolves `myRole` via the real per-org membership list. */
function toProfile(org: Organization, viewerId?: string): OrganizationProfile {
  const myRole = viewerId ? organizationPlatformAPI.getMembers(org.id).find(m => m.userId === viewerId)?.role : undefined;
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    ownerId: org.ownerId,
    plan: TIER_TO_PLAN[org.tier],
    isActive: isActiveStatus(org.status),
    isDeleted: org.status === "archived",
    deletedAt: org.archivedAt,
    settings: {
      timezone: org.settings.timezone,
      dateFormat: org.settings.dateFormat,
      timeFormat: org.settings.timeFormat,
      weekStartsOn: 'monday',
      language: org.settings.language,
      defaultCurrency: org.settings.defaultCurrency,
      security: {
        twoFactorRequired: org.settings.security.twoFactorRequired,
        ipAllowlist: [],
        sessionTimeout: org.settings.security.sessionTimeoutMinutes,
        passwordPolicy: STRENGTH_TO_PASSWORD_POLICY[org.settings.security.passwordPolicyStrength],
      },
      features: {
        allowMultipleWorkspaces: true,
        allowGuestAccess: true,
        allowApiAccess: true,
        allowWhiteLabel: org.tier === "enterprise",
      },
    },
    branding: {
      logo: org.branding.logo,
      logoDark: org.branding.logoDark,
      favicon: org.branding.favicon,
      colors: { ...org.branding.colors, background: "#FFFFFF", foreground: "#111827" },
      domain: org.branding.domain,
    },
    localization: {
      defaultLocale: org.settings.language === "en" ? "en-US" : org.settings.language,
      supportedLocales: [org.settings.language === "en" ? "en-US" : org.settings.language],
      defaultTimezone: org.settings.timezone,
      defaultCurrency: org.settings.defaultCurrency,
      dateFormat: org.settings.dateFormat,
      timeFormat: org.settings.timeFormat,
      firstDayOfWeek: 'monday',
      numberFormat: { decimal: '.', thousands: ',', precision: 2 },
    },
    business: {
      email: org.profile.email,
      phone: org.profile.phone,
      website: org.profile.website,
      industry: org.profile.industry,
      companySize: org.profile.companySize,
      address: org.profile.address
        ? { street: org.profile.address.line1, city: org.profile.address.city, state: org.profile.address.state, postalCode: org.profile.address.postalCode, country: org.profile.address.country }
        : undefined,
    },
    memberCount: org.memberCount,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    myRole,
  };
}

export class OrganizationService {
  async createOrganization(userId: string, request: CreateOrganizationRequest): Promise<OrganizationProfile> {
    const entitlement = await entitlementService.canCreateOrganization(userId);
    if (!entitlement.allowed) throw new Error(entitlement.message ?? 'Organization limit reached for your current plan.');

    const org = organizationPlatformAPI.create({
      name: request.name,
      slug: request.slug,
      ownerId: userId,
      tier: "trial",
      profile: { industry: request.industry, companySize: request.companySize },
      settings: {
        ...(request.timezone ? { timezone: request.timezone } : {}),
        ...(request.currency ? { defaultCurrency: request.currency } : {}),
        ...(request.locale ? { language: request.locale.split('-')[0] } : {}),
      },
    });
    return toProfile(org, userId);
  }

  async getOrganization(orgId: string, viewerId?: string): Promise<OrganizationProfile | null> {
    const org = organizationPlatformAPI.get(orgId);
    if (!org || org.status === "archived") return null;
    return toProfile(org, viewerId);
  }

  async getUserOrganizations(userId: string): Promise<OrganizationProfile[]> {
    return organizationPlatformAPI
      .getForUser(userId)
      .filter(org => org.status !== "archived")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(org => toProfile(org, userId));
  }

  async updateOrganization(orgId: string, data: UpdateOrganizationRequest, actorId?: string): Promise<OrganizationProfile> {
    const existing = organizationPlatformAPI.get(orgId);
    if (!existing || existing.status === "archived") throw new NotFoundError('Organization');

    const org = organizationPlatformAPI.update(
      orgId,
      {
        name: data.name,
        profile: data.business
          ? {
              email: data.business.email,
              phone: data.business.phone,
              website: data.business.website,
              industry: data.business.industry,
              companySize: data.business.companySize,
              address: data.business.address
                ? { line1: data.business.address.street, city: data.business.address.city, state: data.business.address.state, postalCode: data.business.address.postalCode, country: data.business.address.country }
                : undefined,
            }
          : undefined,
        settings: data.settings || data.localization
          ? {
              ...(data.settings?.timezone ? { timezone: data.settings.timezone } : {}),
              ...(data.settings?.dateFormat ? { dateFormat: data.settings.dateFormat } : {}),
              ...(data.settings?.timeFormat ? { timeFormat: data.settings.timeFormat } : {}),
              ...(data.settings?.language ? { language: data.settings.language } : {}),
              ...(data.settings?.defaultCurrency ? { defaultCurrency: data.settings.defaultCurrency } : {}),
              ...(data.localization?.defaultTimezone ? { timezone: data.localization.defaultTimezone } : {}),
              ...(data.localization?.defaultCurrency ? { defaultCurrency: data.localization.defaultCurrency } : {}),
              ...(data.settings?.security
                ? { security: { ...existing.settings.security, twoFactorRequired: data.settings.security.twoFactorRequired, sessionTimeoutMinutes: data.settings.security.sessionTimeout } }
                : {}),
            }
          : undefined,
        branding: data.branding
          ? { logo: data.branding.logo, logoDark: data.branding.logoDark, favicon: data.branding.favicon, domain: data.branding.domain, colors: data.branding.colors ? { primary: data.branding.colors.primary, secondary: data.branding.colors.secondary, accent: data.branding.colors.accent } : undefined }
          : undefined,
      },
      actorId ?? existing.ownerId
    );
    if (!org) throw new NotFoundError('Organization');
    return toProfile(org, actorId);
  }

  async archiveOrganization(orgId: string, actorId?: string): Promise<void> {
    const existing = organizationPlatformAPI.get(orgId);
    if (!existing || existing.status === "archived") throw new NotFoundError('Organization');
    organizationPlatformAPI.archive(orgId, actorId ?? existing.ownerId);
  }

  async switchOrganization(userId: string, orgId: string): Promise<OrganizationProfile> {
    const memberOf = organizationPlatformAPI.getForUser(userId);
    const org = memberOf.find(o => o.id === orgId);
    if (!org) throw new NotFoundError('Organization access denied');
    return toProfile(org, userId);
  }

  async addUserToOrganization(userId: string, orgId: string): Promise<void> {
    const existing = organizationPlatformAPI.get(orgId);
    if (!existing) throw new NotFoundError('Organization');
    organizationPlatformAPI.addMember(orgId, userId, "member");
  }
}

export const organizationService = new OrganizationService();

/** Maps a full canonical→plan tier for callers that need the reverse of `TIER_TO_PLAN` (e.g. tier upgrade flows outside this adapter). */
export function planToTier(plan: OrganizationPlan): SubscriptionTier {
  return PLAN_TO_TIER[plan];
}
