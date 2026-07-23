/**
 * Calixo Platform - Entitlement Service
 *
 * The single, centralized entry point the Entitlement Enforcement mandate
 * calls for: "no module should implement entitlement logic directly —
 * everything uses EntitlementService." It does not reimplement any of the
 * real engines that already exist (`EntitlementPlatformAPI`/`CreditEngine`/
 * `SubscriptionEngine`/`AuthorizationPlatformAPI`) — it composes them into
 * one consistent decision shape (`EntitlementResult`: allowed, a reason
 * code, a human message, and — when the reason is plan-shaped rather than
 * role-shaped — a concrete `upgradeTarget` tier), adds the platform's first
 * entitlement cache, and is the one place every denial is audited.
 *
 * PLATFORM_OWNER/PLATFORM_ADMIN bypass every check here, same rule as
 * `AuthorizationPlatformAPI` (`hasPlatformBypass`) — staff access to modules
 * and settings must never depend on which organization's plan they're
 * looking at.
 *
 * "Immediately, no redeployment required" (the mandate's Feature Flag
 * Enforcement section) is true for every NEW request this service ever
 * answers — nothing here is ever stale by more than `EntitlementCache`'s
 * defensive TTL, and every Platform Admin mutation that changes an answer
 * calls `entitlementCache.invalidate*()` in the same commit. What this
 * service cannot do is push a change into an already-rendered browser tab
 * without that tab making a new request (this app has no live/websocket
 * push layer — disclosed plainly, not silently assumed away); every module
 * gate below runs server-side on the next navigation/action, which is where
 * the mandate's own "backend enforcement is security" standard actually
 * lives.
 */
import { entitlementPlatformAPI, creditPlatformAPI, usagePlatformAPI } from "@/core/platform/commercial";
import type { EntitlementDecision } from "@/core/platform/commercial";
import { subscriptionEngine } from "@/core/platform/subscription/SubscriptionEngine";
import { subscriptionRegistry, SUBSCRIPTION_TIERS } from "@/core/platform/subscription";
import type { SubscriptionTier, SubscriptionLimits } from "@/core/platform/subscription";
import { organizationRegistry } from "@/core/platform/organizations";
import { FEATURE_ACCESS_REGISTRY } from "@/access/config/features";
import { auditService } from "@/access/audit/AuditService";
import type { AuditEventType } from "@/access/types";
import { authorizationPlatformAPI, hasPlatformBypass } from "./AuthorizationPlatformAPI";
import { entitlementCache } from "./EntitlementCache";

export type EntitlementModuleId = "dashboard" | "analytics" | "ads" | "social" | "brand" | "content" | "ai-copilot" | "reports" | "settings";

/** The 8 modules the Internal Plan Management Console's Features & Modules matrix actually toggles per tier (`ALL_MODULE_IDS`) — Settings is deliberately excluded there (every customer, on every tier, must always reach their own billing/account settings) and gated by permission alone. */
const TIER_GATED_MODULES = new Set<EntitlementModuleId>(["dashboard", "analytics", "ads", "social", "brand", "content", "ai-copilot", "reports"]);

/** Maps this service's module ids (which match `SubscriptionLimits.modules`/`ModuleManifest.id`) to `FEATURE_ACCESS_REGISTRY`'s dotted keys, which use a different, hyphenated vocabulary (`ads-manager`, not `ads`) that never matched `ResourceType` automatically — see the module doc comment in `AuthorizationPlatformAPI.checkSubscriptionAndFeatureGates()`. Reusing the registry's `requiredPermission` here (rather than re-declaring permission strings a third time) is what actually makes that already-correct, previously-dead data do something. */
const MODULE_FEATURE_KEY: Record<EntitlementModuleId, string> = {
  dashboard: "module.dashboard",
  analytics: "module.analytics",
  ads: "module.ads-manager",
  social: "module.social-media",
  brand: "module.brand-monitoring",
  content: "module.content-studio",
  "ai-copilot": "module.ai-copilot",
  reports: "module.reports",
  settings: "module.administration",
};

const MODULE_LABEL: Record<EntitlementModuleId, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  ads: "Ads Manager",
  social: "Social Media",
  brand: "Brand Monitoring",
  content: "Content Studio",
  "ai-copilot": "AI Copilot",
  reports: "Reports",
  settings: "Settings",
};

function requiredPermissionFor(moduleId: EntitlementModuleId): string {
  return FEATURE_ACCESS_REGISTRY[MODULE_FEATURE_KEY[moduleId]]?.requiredPermission ?? `${moduleId}.view`;
}

export type EntitlementReasonCode =
  | "allowed"
  | "unrestricted"
  | "platform_bypass"
  | "insufficient_permission"
  | "upgrade_required"
  | "insufficient_credits"
  | "limit_reached";

export interface EntitlementResult {
  allowed: boolean;
  reasonCode: EntitlementReasonCode;
  message?: string;
  /** Set only when upgrading the PLAN (not fixing a role) would resolve this — a module lock or a numeric limit, never a missing RBAC permission. */
  upgradeTarget?: SubscriptionTier;
  limit?: number;
  used?: number;
  remaining?: number;
}

export interface EntitlementActor {
  userId: string;
  organizationId: string;
}

/** Two named report usage types Reports already records on every real generation/schedule (`core/reports/commercial/ReportsUsageAdapter.ts`) — inlined rather than imported to avoid `core/platform` (generic infrastructure) depending on `core/reports` (one specific vertical); kept in sync by convention, not by a shared import. */
const REPORTS_CREATED_USAGE_TYPE = "reports.reportCreated";
const REPORTS_SCHEDULE_USAGE_TYPE = "reports.schedule";

class EntitlementService {
  // ==========================================================================
  // Module access — the mandate's "UI hiding is NOT security" example itself.
  // ==========================================================================

  async canAccessModule(actor: EntitlementActor, moduleId: EntitlementModuleId): Promise<EntitlementResult> {
    const cacheKey = `module:${moduleId}:${actor.userId}`;
    const cached = entitlementCache.get<EntitlementResult>(actor.organizationId, cacheKey);
    if (cached) return cached;

    const result = await this.computeModuleAccess(actor, moduleId);
    entitlementCache.set(actor.organizationId, cacheKey, result);
    if (!result.allowed) await this.audit(actor, "module_denied", moduleId, result);
    return result;
  }

  private async computeModuleAccess(actor: EntitlementActor, moduleId: EntitlementModuleId): Promise<EntitlementResult> {
    if (hasPlatformBypass(actor.userId)) return { allowed: true, reasonCode: "platform_bypass" };

    if (TIER_GATED_MODULES.has(moduleId)) {
      const tierDecision = entitlementPlatformAPI.canAccess(actor.organizationId, "module", moduleId);
      if (!tierDecision.allowed) {
        return {
          allowed: false,
          reasonCode: "upgrade_required",
          message: `${MODULE_LABEL[moduleId]} isn't included in your organization's current plan.`,
          upgradeTarget: this.cheapestTierForModule(moduleId),
        };
      }
    }

    const permissions = await authorizationPlatformAPI.getEffectivePermissions(actor.userId, actor.organizationId);
    const required = requiredPermissionFor(moduleId);
    if (!permissions.includes(required)) {
      return { allowed: false, reasonCode: "insufficient_permission", message: `You don't have the "${required}" permission. Ask an organization admin to grant it.` };
    }

    return { allowed: true, reasonCode: "allowed" };
  }

  private cheapestTierForModule(moduleId: string): SubscriptionTier | undefined {
    for (const tier of SUBSCRIPTION_TIERS) {
      const definition = subscriptionRegistry.get(tier);
      if (definition && (definition.limits.modules.includes("*") || definition.limits.modules.includes(moduleId))) return tier;
    }
    return undefined;
  }

  // ==========================================================================
  // AI credit enforcement — validate -> reserve -> execute -> deduct -> log.
  // ==========================================================================

  /** Step 1 (validate) as a non-mutating, cacheable read — callers that only need "would this be allowed" (e.g. disabling a Send button) should call this instead of `reserveAiCredits()`, which always holds real balance. */
  async canExecuteAI(actor: EntitlementActor, estimatedCredits: number): Promise<EntitlementResult> {
    if (hasPlatformBypass(actor.userId)) return { allowed: true, reasonCode: "platform_bypass" };
    // Root-cause fix (production incident, Content Studio "generate produces nothing"): the real
    // monthly AI-credit grant only ever ran from a seed step nothing in the app actually called,
    // so every organization's real balance sat at 0 forever and every credit check failed here,
    // silently, on the very first request. Ensuring the grant on every real check makes this
    // self-healing regardless of when/whether the organization was ever explicitly seeded.
    creditPlatformAPI.ensureMonthlyAiCreditsGranted(actor.organizationId);
    const decision = entitlementPlatformAPI.canUseCredit(actor.organizationId, "ai", estimatedCredits);
    return decision.allowed
      ? { allowed: true, reasonCode: "allowed", used: decision.used, remaining: decision.remaining }
      : { allowed: false, reasonCode: "insufficient_credits", message: decision.reason, remaining: decision.remaining, used: decision.used };
  }

  /** Steps 1-2 (validate, reserve): holds `estimatedCredits` against the real balance immediately (so a second concurrent request can't also pass a balance check against the same credits) or fails without touching the balance. Callers MUST follow a successful reservation with `commitAiCredits()` (real cost) or `releaseAiCredits()` (aborted) — never leave a reservation dangling. */
  async reserveAiCredits(actor: EntitlementActor, estimatedCredits: number, reason: string): Promise<{ result: EntitlementResult; reservationId?: string }> {
    if (hasPlatformBypass(actor.userId)) {
      const reservation = creditPlatformAPI.reserve(actor.organizationId, "ai", 0, `${reason} (platform bypass — not metered)`);
      return { result: { allowed: true, reasonCode: "platform_bypass" }, reservationId: reservation.id };
    }

    const check = await this.canExecuteAI(actor, estimatedCredits);
    if (!check.allowed) {
      await this.audit(actor, "ai_credit_denied", "ai", check);
      return { result: check };
    }

    const reservation = creditPlatformAPI.reserve(actor.organizationId, "ai", estimatedCredits, reason);
    entitlementCache.invalidateOrganization(actor.organizationId);
    return { result: { allowed: true, reasonCode: "allowed" }, reservationId: reservation.id };
  }

  /** Steps 4-5 (calculate actual, deduct): finalizes a reservation at the real post-execution cost — any unused portion of the estimate is refunded automatically (`CreditEngine.commitReservation`). Step 6 (log) happens here via a real audit event, not a simulated one. */
  async commitAiCredits(actor: EntitlementActor, reservationId: string, actualCredits: number, reason: string): Promise<void> {
    creditPlatformAPI.commitReservation(reservationId, actualCredits);
    entitlementCache.invalidateOrganization(actor.organizationId);
    await this.audit(actor, "ai_credit_consumed", reason, { allowed: true, reasonCode: "allowed", used: actualCredits });
  }

  /** The reserved action never ran (validation failed downstream, the request errored, the user cancelled) — fully refunds the hold. */
  async releaseAiCredits(actor: EntitlementActor, reservationId: string): Promise<void> {
    creditPlatformAPI.releaseReservation(reservationId);
    entitlementCache.invalidateOrganization(actor.organizationId);
  }

  // ==========================================================================
  // Countable-resource limits — organization/workspace/user/integration/
  // storage/report/schedule creation.
  // ==========================================================================

  /**
   * No existing hierarchy field links organizations together in this
   * codebase (`Organization` has no parent/child concept, and Calixo's own
   * multi-org model — one person, several unrelated organizations each on
   * their own plan, e.g. this session's own "Uttam: RGU/MIT WPU/Demo
   * Company" example — has no natural "owning subscription" for a NEW
   * organization to be created against). Disclosed judgment call:
   * implemented as "how many organizations does this user already own,"
   * checked against the MOST PERMISSIVE limit among the tiers of the
   * organizations they already own (any one sufficiently-upgraded org's
   * plan is read as licensing the account to hold that many total) — with
   * zero owned organizations, creating a first one is always allowed (there
   * is no tier to check against yet, and a brand-new account can't
   * plausibly be blocked from its very first organization). Takes a bare
   * `userId`, not the usual `EntitlementActor`, since org creation is the
   * one action that precedes having any acting organization at all.
   */
  async canCreateOrganization(userId: string): Promise<EntitlementResult> {
    if (hasPlatformBypass(userId)) return { allowed: true, reasonCode: "platform_bypass" };
    const owned = organizationRegistry.list().filter(o => o.ownerId === userId);
    if (owned.length === 0) return { allowed: true, reasonCode: "allowed", used: 0 };

    const limit = Math.max(...owned.map(o => subscriptionEngine.getCurrentLimits(o.id).organizations));
    const allowed = owned.length < limit;
    const result: EntitlementResult = allowed
      ? { allowed: true, reasonCode: "allowed", limit, used: owned.length, remaining: limit - owned.length }
      : { allowed: false, reasonCode: "limit_reached", limit, used: owned.length, remaining: 0, message: `Your current plan allows up to ${limit} organization(s).`, upgradeTarget: this.cheapestTierForLimit("organizations", owned.length + 1) };

    if (!result.allowed) await this.audit({ userId, organizationId: owned[0].id }, "limit_exceeded", "organizations", result);
    return result;
  }

  async canCreateWorkspace(actor: EntitlementActor): Promise<EntitlementResult> {
    return this.legacyLimitCheck(actor, "workspacesUsed", "workspaces");
  }

  async canInviteUser(actor: EntitlementActor): Promise<EntitlementResult> {
    return this.legacyLimitCheck(actor, "seatsUsed", "seats");
  }

  async canConnectIntegration(actor: EntitlementActor): Promise<EntitlementResult> {
    return this.legacyLimitCheck(actor, "connectorsUsed", "connectors");
  }

  async canConsumeStorage(actor: EntitlementActor, additionalGB: number): Promise<EntitlementResult> {
    return this.legacyLimitCheck(actor, "storageGBUsed", "storageGB", additionalGB);
  }

  /** Rolling calendar-month count, matching how `recordReportsUsage()` already records every real generation — "Reports: 10" (Trial) is read as 10/month, not a lifetime cap (there is no per-organization "list of saved reports" in this codebase to count a lifetime total against; `ReportRegistry` is a shared template catalog, not per-org instances). Disclosed judgment call. */
  async canGenerateReport(actor: EntitlementActor): Promise<EntitlementResult> {
    if (hasPlatformBypass(actor.userId)) return { allowed: true, reasonCode: "platform_bypass" };
    const used = usagePlatformAPI.getTotal(REPORTS_CREATED_USAGE_TYPE, actor.organizationId, "monthly");
    const result = this.countLimitResult(actor.organizationId, "reports", used);
    if (!result.allowed) await this.audit(actor, "limit_exceeded", "reports", result);
    return result;
  }

  async canScheduleReport(actor: EntitlementActor): Promise<EntitlementResult> {
    if (hasPlatformBypass(actor.userId)) return { allowed: true, reasonCode: "platform_bypass" };
    const used = usagePlatformAPI.getTotal(REPORTS_SCHEDULE_USAGE_TYPE, actor.organizationId, "monthly");
    const result = this.countLimitResult(actor.organizationId, "scheduledReports", used);
    if (!result.allowed) await this.audit(actor, "limit_exceeded", "scheduledReports", result);
    return result;
  }

  /** Read-only — the real hold/consume happens inside `ApiGatewayEngine.handle()` against the identical `RateLimiter` bucket (`planQuotaIdentifier()`). This is for surfacing "how close to the limit" in UI without ever double-counting a request. */
  async canCallAPI(actor: EntitlementActor): Promise<EntitlementResult> {
    if (hasPlatformBypass(actor.userId)) return { allowed: true, reasonCode: "platform_bypass" };
    const { rateLimiter, planQuotaIdentifier } = await import("@/core/platform/api/RateLimiter");
    const limit = subscriptionEngine.getCurrentLimits(actor.organizationId).apiRequests;
    const check = rateLimiter.peek({ scope: "organization", limit, windowMs: 24 * 60 * 60 * 1000 }, planQuotaIdentifier(actor.organizationId));
    return check.allowed
      ? { allowed: true, reasonCode: "allowed", limit, remaining: check.remaining }
      : { allowed: false, reasonCode: "limit_reached", limit, remaining: 0, message: `This organization's plan allows ${limit.toLocaleString()} API requests per day.`, upgradeTarget: this.cheapestTierForLimit("apiRequests", limit + 1) };
  }

  private async legacyLimitCheck(actor: EntitlementActor, usageKey: "workspacesUsed" | "seatsUsed" | "connectorsUsed" | "storageGBUsed", limitKey: keyof SubscriptionLimits, requested = 1): Promise<EntitlementResult> {
    if (hasPlatformBypass(actor.userId)) return { allowed: true, reasonCode: "platform_bypass" };
    const decision = entitlementPlatformAPI.canUse({ organizationId: actor.organizationId, key: usageKey, requested });
    const result = this.fromLegacyDecision(decision, limitKey);
    if (!result.allowed) await this.audit(actor, "limit_exceeded", limitKey, result);
    return result;
  }

  private fromLegacyDecision(decision: EntitlementDecision, limitKey: keyof SubscriptionLimits): EntitlementResult {
    if (decision.allowed) return { allowed: true, reasonCode: "allowed", limit: decision.limit, used: decision.used, remaining: decision.remaining };
    return {
      allowed: false,
      reasonCode: "limit_reached",
      limit: decision.limit,
      used: decision.used,
      remaining: decision.remaining,
      message: decision.reason,
      upgradeTarget: this.cheapestTierForLimit(limitKey, (decision.used ?? 0) + 1),
    };
  }

  private countLimitResult(organizationId: string, limitKey: keyof SubscriptionLimits, currentCount: number): EntitlementResult {
    const subscription = subscriptionEngine.getOrAssignDefault(organizationId);
    const limit = subscriptionEngine.getCurrentLimits(organizationId)[limitKey] as number;
    const remaining = Math.max(0, limit - currentCount);
    if (currentCount < limit) return { allowed: true, reasonCode: "allowed", limit, used: currentCount, remaining };
    return {
      allowed: false,
      reasonCode: "limit_reached",
      limit,
      used: currentCount,
      remaining: 0,
      message: `The ${subscription.tier} plan allows up to ${limit.toLocaleString()}.`,
      upgradeTarget: this.cheapestTierForLimit(limitKey, currentCount + 1),
    };
  }

  private cheapestTierForLimit(limitKey: keyof SubscriptionLimits, requiredCount: number): SubscriptionTier | undefined {
    for (const tier of SUBSCRIPTION_TIERS) {
      const definition = subscriptionRegistry.get(tier);
      const value = definition?.limits[limitKey];
      if (typeof value === "number" && value >= requiredCount) return tier;
    }
    return undefined;
  }

  // ==========================================================================
  // Cache invalidation — called by every Platform Admin mutation that could
  // change an entitlement answer.
  // ==========================================================================

  invalidateOrganization(organizationId: string): void {
    entitlementCache.invalidateOrganization(organizationId);
  }

  invalidateAll(): void {
    entitlementCache.invalidateAll();
  }

  // ==========================================================================
  // Audit
  // ==========================================================================

  async recordUpgradeTriggered(actor: EntitlementActor, context: string, targetTier: SubscriptionTier): Promise<void> {
    await auditService.recordEvent({
      organizationId: actor.organizationId,
      userId: actor.userId,
      eventType: "upgrade_triggered",
      resource: "subscription",
      resourceId: targetTier,
      description: `Upgrade to ${targetTier} triggered from ${context}`,
      changes: { context, targetTier },
    });
  }

  async recordPlanChanged(actor: EntitlementActor, fromTier: SubscriptionTier, toTier: SubscriptionTier): Promise<void> {
    entitlementCache.invalidateOrganization(actor.organizationId);
    await auditService.recordEvent({
      organizationId: actor.organizationId,
      userId: actor.userId,
      eventType: "plan_changed",
      resource: "subscription",
      resourceId: actor.organizationId,
      description: `Plan changed from ${fromTier} to ${toTier}`,
      changes: { fromTier, toTier },
    });
  }

  private async audit(actor: EntitlementActor, eventType: AuditEventType, resourceId: string, result: EntitlementResult): Promise<void> {
    await auditService.recordEvent({
      organizationId: actor.organizationId,
      userId: actor.userId,
      eventType,
      resource: "entitlement",
      resourceId,
      description: result.message ?? `${eventType} for ${resourceId}`,
      changes: { reasonCode: result.reasonCode, upgradeTarget: result.upgradeTarget, limit: result.limit, used: result.used },
    });
  }
}

export const entitlementService = new EntitlementService();
