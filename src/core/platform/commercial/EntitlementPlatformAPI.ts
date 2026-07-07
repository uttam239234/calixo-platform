/**
 * Calixo Platform - Entitlement Platform API
 *
 * The sanctioned way every other module checks "can this organization do
 * X" — never compare a tier name, never hardcode a limit.
 */
import { entitlementEngine, type EntitlementCheckParams } from "./EntitlementEngine";
import type { CreditType, EntitlementDecision, LicenseKind, UsagePeriod } from "./types";

export class EntitlementPlatformAPI {
  canUse(params: EntitlementCheckParams): EntitlementDecision {
    return entitlementEngine.canUse(params);
  }

  canCreate(params: EntitlementCheckParams): EntitlementDecision {
    return entitlementEngine.canCreate(params);
  }

  canExecute(params: EntitlementCheckParams): EntitlementDecision {
    return entitlementEngine.canExecute(params);
  }

  canAccess(organizationId: string, kind: "feature" | "module" | LicenseKind, id: string): EntitlementDecision {
    return entitlementEngine.canAccess(organizationId, kind, id);
  }

  canUseCredit(organizationId: string, creditType: CreditType, amount: number): EntitlementDecision {
    return entitlementEngine.canUseCredit(organizationId, creditType, amount);
  }

  limit(organizationId: string, key: string): number | undefined {
    return entitlementEngine.limit(organizationId, key);
  }

  remaining(organizationId: string, key: string, workspaceId?: string, userId?: string): number {
    return entitlementEngine.remaining(organizationId, key, workspaceId, userId);
  }

  usage(organizationId: string, key: string, period?: UsagePeriod, workspaceId?: string, userId?: string): number {
    return entitlementEngine.usage(organizationId, key, period, workspaceId, userId);
  }
}

export const entitlementPlatformAPI = new EntitlementPlatformAPI();
