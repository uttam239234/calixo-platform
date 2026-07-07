/**
 * Calixo Platform - Quota Platform
 *
 * Evaluates registered quota rules against `UsageMeteringEngine`'s real
 * counters. Deliberately not built on Phase 6's `RateLimiter` — that's a
 * sliding real-time window (good for "100 requests/minute"); quotas here
 * are calendar-period budgets ("10,000 AI requests this month") with soft/
 * hard distinction and grace overage, a different shape of problem.
 */
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import { usageMeteringEngine } from "./UsageMeteringEngine";
import { addOnRegistry } from "./AddOnRegistry";
import type { QuotaCheckResult, QuotaDefinition } from "./types";
import type { SubscriptionTier } from "@/core/platform/subscription/types";

export class QuotaEngine {
  private quotas = new Map<string, QuotaDefinition>();

  register(definition: QuotaDefinition): QuotaDefinition {
    this.quotas.set(definition.id, definition);
    return definition;
  }

  get(id: string): QuotaDefinition | undefined {
    return this.quotas.get(id);
  }

  list(): QuotaDefinition[] {
    return Array.from(this.quotas.values());
  }

  /** Prefers a tier-specific rule over a generic (no-tier) one for the same usage type. */
  private resolve(usageTypeId: string, tier?: SubscriptionTier): QuotaDefinition | undefined {
    const rules = Array.from(this.quotas.values()).filter(q => q.usageTypeId === usageTypeId);
    return rules.find(q => q.tier === tier) ?? rules.find(q => !q.tier);
  }

  check(usageTypeId: string, organizationId: string, requested: number, tier?: SubscriptionTier, workspaceId?: string, userId?: string): QuotaCheckResult {
    const quota = this.resolve(usageTypeId, tier);
    if (!quota) return { allowed: true, used: 0, requested, remaining: Number.POSITIVE_INFINITY, isWarning: false };

    // Add-on subscriptions (Add-On Platform) raise the effective limit — purchasing "additional AI requests" genuinely
    // increases what's allowed here rather than being a disconnected, decorative record.
    const effectiveLimit = quota.limit + addOnRegistry.getAdditionalLimit(organizationId, usageTypeId);

    const used = usageMeteringEngine.getTotal(usageTypeId, organizationId, quota.period, quota.scope === "workspace" ? workspaceId : undefined, quota.scope === "user" ? userId : undefined);
    const remaining = Math.max(0, effectiveLimit - used);
    const graceLimit = effectiveLimit * (1 + quota.graceUsagePercent / 100);
    const allowed = quota.kind === "soft" || used + requested <= graceLimit;
    const isWarning = effectiveLimit > 0 && used + requested >= effectiveLimit * (quota.warningThresholdPercent / 100);

    const result: QuotaCheckResult = { allowed, quota: { ...quota, limit: effectiveLimit }, used, requested, remaining, isWarning };

    if (!allowed) {
      result.reason = `Requested ${requested} would exceed the ${quota.period} quota of ${effectiveLimit} for "${usageTypeId}".`;
      void platformEventBus.publish({ type: "QuotaExceeded", organizationId, payload: { usageTypeId, limit: effectiveLimit, used, requested } });
    } else if (isWarning) {
      void platformEventBus.publish({ type: "QuotaWarning", organizationId, payload: { usageTypeId, limit: effectiveLimit, used } });
    }

    return result;
  }

  count(): number {
    return this.quotas.size;
  }
}

export const quotaEngine = new QuotaEngine();
