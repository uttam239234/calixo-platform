/**
 * Calixo Platform - Quota Platform API
 */
import { quotaEngine } from "./QuotaEngine";
import type { QuotaCheckResult, QuotaDefinition } from "./types";
import type { SubscriptionTier } from "@/core/platform/subscription/types";

export class QuotaPlatformAPI {
  register(definition: QuotaDefinition): QuotaDefinition {
    return quotaEngine.register(definition);
  }

  get(id: string): QuotaDefinition | undefined {
    return quotaEngine.get(id);
  }

  list(): QuotaDefinition[] {
    return quotaEngine.list();
  }

  check(usageTypeId: string, organizationId: string, requested: number, tier?: SubscriptionTier, workspaceId?: string, userId?: string): QuotaCheckResult {
    return quotaEngine.check(usageTypeId, organizationId, requested, tier, workspaceId, userId);
  }
}

export const quotaPlatformAPI = new QuotaPlatformAPI();
