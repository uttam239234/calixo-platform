/**
 * Calixo Platform - Organization Notification Preferences
 *
 * A distinct concept from `NotificationPreference` (`communication/types`) —
 * that type is a genuinely real, already-implemented PERSONAL preference
 * (per user, per channel, with quiet hours/digest/category-level rules).
 * This is organization-wide policy instead: does this organization want
 * each of the 6 broad notification areas Settings exposes turned on at
 * all. Different purpose, different shape — not a replacement, not
 * reusing `NotificationCategory` (a per-notification severity/kind
 * taxonomy, not a feature-area toggle set), to avoid forcing a mismatch.
 * One record per organization, isolated by construction (looked up by
 * organizationId, same pattern as `OrganizationEngine`'s own maps).
 */

export interface OrganizationNotificationPreferences {
  organizationId: string;
  email: boolean;
  product: boolean;
  scheduledReports: boolean;
  workflow: boolean;
  security: boolean;
  ai: boolean;
  updatedAt: string;
}

export type OrganizationNotificationPreferencesPatch = Partial<Omit<OrganizationNotificationPreferences, "organizationId" | "updatedAt">>;

function defaults(organizationId: string): OrganizationNotificationPreferences {
  return { organizationId, email: true, product: true, scheduledReports: true, workflow: true, security: true, ai: true, updatedAt: new Date().toISOString() };
}

export class OrganizationNotificationPreferencesStore {
  private preferences = new Map<string, OrganizationNotificationPreferences>();

  get(organizationId: string): OrganizationNotificationPreferences {
    return this.preferences.get(organizationId) ?? defaults(organizationId);
  }

  update(organizationId: string, patch: OrganizationNotificationPreferencesPatch): OrganizationNotificationPreferences {
    const next: OrganizationNotificationPreferences = { ...this.get(organizationId), ...patch, organizationId, updatedAt: new Date().toISOString() };
    this.preferences.set(organizationId, next);
    return next;
  }
}

export const organizationNotificationPreferencesStore = new OrganizationNotificationPreferencesStore();
