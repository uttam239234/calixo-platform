/**
 * Calixo Platform - Organization Service
 * 
 * Manages organization lifecycle: create, update, archive, switch.
 */

import { appLogger } from '@/logging';
import { NotFoundError } from '@/errors';
import { generateId, slugify } from '@/shared/utils/string';
import type {
  OrganizationProfile,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationSettings,
  OrganizationBranding,
  OrganizationLocalization,
} from '@/organizations/types';

const DEFAULT_SETTINGS: OrganizationSettings = {
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  weekStartsOn: 'monday',
  language: 'en',
  defaultCurrency: 'USD',
  security: {
    twoFactorRequired: false,
    ipAllowlist: [],
    sessionTimeout: 60,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expiryDays: 90,
    },
  },
  features: {
    allowMultipleWorkspaces: true,
    allowGuestAccess: false,
    allowApiAccess: true,
    allowWhiteLabel: false,
  },
};

const DEFAULT_BRANDING: OrganizationBranding = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    foreground: '#111827',
  },
};

const DEFAULT_LOCALIZATION: OrganizationLocalization = {
  defaultLocale: 'en-US',
  supportedLocales: ['en-US'],
  defaultTimezone: 'UTC',
  defaultCurrency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  firstDayOfWeek: 'monday',
  numberFormat: {
    decimal: '.',
    thousands: ',',
    precision: 2,
  },
};

export class OrganizationService {
  private organizations: Map<string, OrganizationProfile> = new Map();
  private userOrganizations: Map<string, Set<string>> = new Map(); // userId -> Set<orgId>

  async createOrganization(userId: string, request: CreateOrganizationRequest): Promise<OrganizationProfile> {
    const now = new Date().toISOString();
    const slug = request.slug || slugify(request.name);

    const org: OrganizationProfile = {
      id: generateId(16),
      name: request.name,
      slug,
      ownerId: userId,
      plan: 'free',
      isActive: true,
      isDeleted: false,
      settings: {
        ...DEFAULT_SETTINGS,
        timezone: request.timezone || DEFAULT_SETTINGS.timezone,
        language: request.locale?.split('-')[0] || DEFAULT_SETTINGS.language,
        defaultCurrency: request.currency || DEFAULT_SETTINGS.defaultCurrency,
      },
      branding: { ...DEFAULT_BRANDING },
      localization: {
        ...DEFAULT_LOCALIZATION,
        defaultTimezone: request.timezone || DEFAULT_LOCALIZATION.defaultTimezone,
        defaultCurrency: request.currency || DEFAULT_LOCALIZATION.defaultCurrency,
        defaultLocale: request.locale || DEFAULT_LOCALIZATION.defaultLocale,
      },
      business: {
        industry: request.industry,
        companySize: request.companySize,
      },
      memberCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.organizations.set(org.id, org);
    
    if (!this.userOrganizations.has(userId)) {
      this.userOrganizations.set(userId, new Set());
    }
    this.userOrganizations.get(userId)!.add(org.id);

    appLogger.info('OrganizationService', `Organization created: ${org.name} (${org.id})`);
    return { ...org };
  }

  async getOrganization(orgId: string): Promise<OrganizationProfile | null> {
    const org = this.organizations.get(orgId);
    if (!org || org.isDeleted) return null;
    return { ...org };
  }

  async getUserOrganizations(userId: string): Promise<OrganizationProfile[]> {
    const orgIds = this.userOrganizations.get(userId);
    if (!orgIds) return [];

    return Array.from(orgIds)
      .map(id => this.organizations.get(id))
      .filter((org): org is OrganizationProfile => !!org && !org.isDeleted)
      .map(org => ({ ...org }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async updateOrganization(orgId: string, data: UpdateOrganizationRequest): Promise<OrganizationProfile> {
    const org = this.organizations.get(orgId);
    if (!org || org.isDeleted) {
      throw new NotFoundError('Organization');
    }

    if (data.name !== undefined) org.name = data.name;
    if (data.settings !== undefined) {
      org.settings = { ...org.settings, ...data.settings };
    }
    if (data.branding !== undefined) {
      org.branding = { ...org.branding, ...data.branding, colors: { ...org.branding.colors, ...data.branding.colors } };
    }
    if (data.localization !== undefined) {
      org.localization = { ...org.localization, ...data.localization };
    }
    if (data.business !== undefined) {
      org.business = { ...org.business, ...data.business };
    }

    org.updatedAt = new Date().toISOString();
    appLogger.info('OrganizationService', `Organization updated: ${org.id}`);
    return { ...org };
  }

  async archiveOrganization(orgId: string): Promise<void> {
    const org = this.organizations.get(orgId);
    if (!org || org.isDeleted) {
      throw new NotFoundError('Organization');
    }

    org.isDeleted = true;
    org.deletedAt = new Date().toISOString();
    appLogger.info('OrganizationService', `Organization archived: ${org.id}`);
  }

  async switchOrganization(userId: string, orgId: string): Promise<OrganizationProfile> {
    const org = await this.getOrganization(orgId);
    if (!org) {
      throw new NotFoundError('Organization');
    }

    const userOrgs = this.userOrganizations.get(userId);
    if (!userOrgs || !userOrgs.has(orgId)) {
      throw new NotFoundError('Organization access denied');
    }

    appLogger.info('OrganizationService', `User ${userId} switched to organization ${orgId}`);
    return org;
  }

  async addUserToOrganization(userId: string, orgId: string): Promise<void> {
    if (!this.organizations.has(orgId)) {
      throw new NotFoundError('Organization');
    }
    if (!this.userOrganizations.has(userId)) {
      this.userOrganizations.set(userId, new Set());
    }
    this.userOrganizations.get(userId)!.add(orgId);
  }
}

export const organizationService = new OrganizationService();