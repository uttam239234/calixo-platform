/**
 * Calixo Platform - Licensing Platform
 *
 * Distinct from Subscription: a Subscription is the commercial plan an
 * organization is on; a License is a specific grant under that plan (a
 * named-user seat, an enterprise-wide unlock, an add-on API/connector/AI
 * license). Nothing pre-existing modeled this — genuinely new.
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { LicenseDefinition, LicenseKind } from "./types";

export class LicensingEngine {
  private licenses = new Map<string, LicenseDefinition>();

  issue(input: Omit<LicenseDefinition, "id" | "seatsAssigned" | "status" | "createdAt" | "updatedAt">): LicenseDefinition {
    const now = new Date().toISOString();
    const license: LicenseDefinition = { ...input, id: generateId(16), seatsAssigned: 0, status: "active", createdAt: now, updatedAt: now };
    this.licenses.set(license.id, license);
    void platformEventBus.publish({ type: "LicenseAssigned", organizationId: license.organizationId, payload: { licenseId: license.id, kind: license.kind } });
    void platformEventBus.publish({ type: "EntitlementChanged", organizationId: license.organizationId, payload: { reason: "license_issued", kind: license.kind } });
    return license;
  }

  assignSeat(licenseId: string): LicenseDefinition {
    const license = this.mustGet(licenseId);
    if (license.seats !== undefined && license.seatsAssigned >= license.seats) {
      throw new Error(`License ${licenseId} has no remaining seats (${license.seatsAssigned}/${license.seats})`);
    }
    license.seatsAssigned += 1;
    license.updatedAt = new Date().toISOString();
    return license;
  }

  releaseSeat(licenseId: string): LicenseDefinition {
    const license = this.mustGet(licenseId);
    license.seatsAssigned = Math.max(0, license.seatsAssigned - 1);
    license.updatedAt = new Date().toISOString();
    return license;
  }

  suspend(licenseId: string): LicenseDefinition {
    const license = this.mustGet(licenseId);
    license.status = "suspended";
    license.updatedAt = new Date().toISOString();
    return license;
  }

  revoke(licenseId: string): LicenseDefinition {
    const license = this.mustGet(licenseId);
    license.status = "revoked";
    license.updatedAt = new Date().toISOString();
    void platformEventBus.publish({ type: "LicenseRevoked", organizationId: license.organizationId, payload: { licenseId } });
    void platformEventBus.publish({ type: "EntitlementChanged", organizationId: license.organizationId, payload: { reason: "license_revoked", kind: license.kind } });
    return license;
  }

  get(licenseId: string): LicenseDefinition | undefined {
    return this.licenses.get(licenseId);
  }

  listForOrganization(organizationId: string): LicenseDefinition[] {
    return Array.from(this.licenses.values()).filter(l => l.organizationId === organizationId);
  }

  listByKind(kind: LicenseKind): LicenseDefinition[] {
    return Array.from(this.licenses.values()).filter(l => l.kind === kind);
  }

  hasActiveLicense(organizationId: string, kind: LicenseKind): boolean {
    const now = new Date().toISOString();
    return this.listForOrganization(organizationId).some(l => l.kind === kind && l.status === "active" && (!l.expiresAt || l.expiresAt > now));
  }

  private mustGet(id: string): LicenseDefinition {
    const license = this.licenses.get(id);
    if (!license) throw new Error(`License not found: ${id}`);
    return license;
  }

  count(): number {
    return this.licenses.size;
  }
}

export const licensingEngine = new LicensingEngine();
