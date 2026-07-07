/**
 * Calixo Platform - Licensing Platform API
 */
import { licensingEngine } from "./LicensingEngine";
import type { LicenseDefinition, LicenseKind } from "./types";

export class LicensingPlatformAPI {
  issue(input: Omit<LicenseDefinition, "id" | "seatsAssigned" | "status" | "createdAt" | "updatedAt">): LicenseDefinition {
    return licensingEngine.issue(input);
  }

  assignSeat(licenseId: string): LicenseDefinition {
    return licensingEngine.assignSeat(licenseId);
  }

  releaseSeat(licenseId: string): LicenseDefinition {
    return licensingEngine.releaseSeat(licenseId);
  }

  suspend(licenseId: string): LicenseDefinition {
    return licensingEngine.suspend(licenseId);
  }

  revoke(licenseId: string): LicenseDefinition {
    return licensingEngine.revoke(licenseId);
  }

  get(licenseId: string): LicenseDefinition | undefined {
    return licensingEngine.get(licenseId);
  }

  listForOrganization(organizationId: string): LicenseDefinition[] {
    return licensingEngine.listForOrganization(organizationId);
  }

  listByKind(kind: LicenseKind): LicenseDefinition[] {
    return licensingEngine.listByKind(kind);
  }

  hasActiveLicense(organizationId: string, kind: LicenseKind): boolean {
    return licensingEngine.hasActiveLicense(organizationId, kind);
  }
}

export const licensingPlatformAPI = new LicensingPlatformAPI();
