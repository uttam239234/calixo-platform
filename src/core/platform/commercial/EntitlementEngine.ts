/**
 * Calixo Platform - Entitlement Platform
 *
 * The ONLY source of truth (mandate section 4) — every module calls
 * `canUse()`/`canCreate()`/`canExecute()`/`canAccess()` here instead of
 * comparing a tier name or hardcoding a limit. Internally this combines
 * three real systems rather than reimplementing any of them: Phase 1's
 * `subscriptionEngine` (the fixed 6-key legacy limits, feature gates,
 * module unlocks), this phase's own `QuotaEngine` (open, registrable usage
 * types), and `CreditEngine` (AI/API/Connector/Marketing credit balances).
 * A caller never needs to know which of the three actually backs a given
 * key.
 */
import { subscriptionEngine } from "@/core/platform/subscription/SubscriptionEngine";
import type { SubscriptionUsageKey } from "@/core/platform/subscription/types";
import { usageMeteringEngine } from "./UsageMeteringEngine";
import { quotaEngine } from "./QuotaEngine";
import { creditEngine } from "./CreditEngine";
import { licensingEngine } from "./LicensingEngine";
import type { CreditType, EntitlementDecision, LicenseKind, UsagePeriod } from "./types";

const LEGACY_USAGE_KEYS: SubscriptionUsageKey[] = ["seatsUsed", "aiCreditsUsed", "storageGBUsed", "connectorsUsed", "brandsUsed", "workspacesUsed"];

function isLegacyUsageKey(key: string): key is SubscriptionUsageKey {
  return (LEGACY_USAGE_KEYS as string[]).includes(key);
}

export interface EntitlementCheckParams {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  /** Either a legacy `SubscriptionUsageKey` (seatsUsed/aiCreditsUsed/...) or an open, registered `UsageTypeDefinition.id` — resolved automatically. */
  key: string;
  requested?: number;
}

export class EntitlementEngine {
  /** The one consumable-resource gate: tries the legacy fixed-limit system first, then the open quota system, and is "unrestricted" if neither has a rule for this key — not every resource needs a limit. */
  canUse(params: EntitlementCheckParams): EntitlementDecision {
    const { organizationId, workspaceId, userId, key, requested = 1 } = params;

    if (isLegacyUsageKey(key)) {
      const result = subscriptionEngine.checkLimit(organizationId, key, requested);
      return { allowed: result.allowed, reason: result.reason, limit: result.limit, used: result.used, remaining: result.remaining, source: "subscription_limit" };
    }

    const subscription = subscriptionEngine.getOrAssignDefault(organizationId);
    const quotaResult = quotaEngine.check(key, organizationId, requested, subscription.tier, workspaceId, userId);
    if (quotaResult.quota) {
      return { allowed: quotaResult.allowed, reason: quotaResult.reason, limit: quotaResult.quota.limit, used: quotaResult.used, remaining: quotaResult.remaining, source: "quota" };
    }

    return { allowed: true, source: "unrestricted" };
  }

  /** Creation is consumption of a countable resource — same check as `canUse`, distinct name because the mandate calls for a separate verb at call sites. */
  canCreate(params: EntitlementCheckParams): EntitlementDecision {
    return this.canUse(params);
  }

  canExecute(params: EntitlementCheckParams): EntitlementDecision {
    return this.canUse(params);
  }

  /** Binary unlock checks — feature gates, module access, or an active license — never a countable resource. */
  canAccess(organizationId: string, kind: "feature" | "module" | LicenseKind, id: string): EntitlementDecision {
    if (kind === "feature") {
      const allowed = subscriptionEngine.hasFeatureGate(organizationId, id);
      return { allowed, source: "feature_gate", reason: allowed ? undefined : `Feature "${id}" is not enabled for this organization's tier.` };
    }
    if (kind === "module") {
      const allowed = subscriptionEngine.hasModule(organizationId, id);
      return { allowed, source: "module", reason: allowed ? undefined : `Module "${id}" is not enabled for this organization's tier.` };
    }
    const allowed = licensingEngine.hasActiveLicense(organizationId, kind);
    return { allowed, source: "license", reason: allowed ? undefined : `No active ${kind} license for this organization.` };
  }

  /** Whether there is enough credit balance to cover a credit-metered operation (AI inference, connector API call billed via credits, ...). */
  canUseCredit(organizationId: string, creditType: CreditType, amount: number): EntitlementDecision {
    const balance = creditEngine.getBalance(organizationId, creditType);
    const allowed = balance.balance >= amount;
    return { allowed, used: balance.lifetimeConsumed, remaining: balance.balance, source: "credit", reason: allowed ? undefined : `Insufficient ${creditType} credits: requested ${amount}, balance ${balance.balance}.` };
  }

  limit(organizationId: string, key: string): number | undefined {
    const subscription = subscriptionEngine.getOrAssignDefault(organizationId);
    if (isLegacyUsageKey(key)) {
      const decision = this.canUse({ organizationId, key, requested: 0 });
      return decision.limit;
    }
    const quota = quotaEngine.list().find(q => q.usageTypeId === key && (q.tier === subscription.tier || !q.tier));
    return quota?.limit;
  }

  remaining(organizationId: string, key: string, workspaceId?: string, userId?: string): number {
    if (isLegacyUsageKey(key)) {
      return subscriptionEngine.checkLimit(organizationId, key, 0).remaining;
    }
    const subscription = subscriptionEngine.getOrAssignDefault(organizationId);
    return quotaEngine.check(key, organizationId, 0, subscription.tier, workspaceId, userId).remaining;
  }

  usage(organizationId: string, key: string, period: UsagePeriod = "monthly", workspaceId?: string, userId?: string): number {
    if (isLegacyUsageKey(key)) {
      return subscriptionEngine.getOrAssignDefault(organizationId).usage[key];
    }
    return usageMeteringEngine.getTotal(key, organizationId, period, workspaceId, userId);
  }
}

export const entitlementEngine = new EntitlementEngine();
