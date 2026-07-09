import { platformEventBus } from "../events/PlatformEventBus";
import { subscriptionRegistry, registerDefaultTiers } from "./SubscriptionRegistry";
import { USAGE_TO_LIMIT_KEY, type BillingCycle, type LimitCheckResult, type Subscription, type SubscriptionTier, type SubscriptionUsageKey } from "./types";

const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

function now(): string {
  return new Date().toISOString();
}

function emptyUsage() {
  return { seatsUsed: 0, aiCreditsUsed: 0, storageGBUsed: 0, connectorsUsed: 0, brandsUsed: 0, workspacesUsed: 0 };
}

/**
 * Assigns/tracks one Subscription per organization. Architecture only —
 * no payment processing, no invoicing; `assign()`/`changeTier()` are what a
 * future billing webhook would call once real payments exist.
 */
export class SubscriptionEngine {
  private subscriptions = new Map<string, Subscription>();

  assign(organizationId: string, tier: SubscriptionTier = "trial", billingCycle: BillingCycle = "monthly"): Subscription {
    // Defensive: several real call chains (Dashboard's and Analytics' entitlement checks among them) reach `getOrAssignDefault()` without any caller having first run the app's master `initializePlatformFoundation()` boot sequence, which is what normally seeds this registry via `initializeSubscriptionFoundation()`. Self-heal rather than throw.
    if (subscriptionRegistry.count() === 0) registerDefaultTiers();
    const definition = subscriptionRegistry.get(tier);
    if (!definition) throw new Error(`Unknown subscription tier: ${tier}`);
    const subscription: Subscription = {
      id: `sub-${organizationId}`,
      organizationId,
      tier,
      status: tier === "trial" ? "trialing" : "active",
      limits: { ...definition.limits },
      usage: emptyUsage(),
      billingCycle,
      autoRenew: true,
      trialEndsAt: tier === "trial" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      renewsAt: this.computeNextRenewal(billingCycle),
      createdAt: now(),
      updatedAt: now(),
    };
    this.subscriptions.set(organizationId, subscription);
    void platformEventBus.publish({ type: "SubscriptionCreated", organizationId, payload: { tier, status: subscription.status, billingCycle } });
    void platformEventBus.publish({ type: "SubscriptionChanged", organizationId, payload: { tier, status: subscription.status } });
    return subscription;
  }

  private computeNextRenewal(billingCycle: BillingCycle, from: Date = new Date()): string {
    const next = new Date(from);
    if (billingCycle === "annual") next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return next.toISOString();
  }

  get(organizationId: string): Subscription | undefined {
    return this.subscriptions.get(organizationId);
  }

  getOrAssignDefault(organizationId: string): Subscription {
    return this.get(organizationId) ?? this.assign(organizationId, "trial");
  }

  /** Upgrade or downgrade — same operation, direction is just whether the new tier's limits are bigger or smaller. */
  changeTier(organizationId: string, tier: SubscriptionTier): Subscription {
    const definition = subscriptionRegistry.get(tier);
    if (!definition) throw new Error(`Unknown subscription tier: ${tier}`);
    const existing = this.getOrAssignDefault(organizationId);
    const previousTier = existing.tier;
    existing.tier = tier;
    existing.limits = { ...definition.limits };
    existing.status = "active";
    existing.updatedAt = now();
    void platformEventBus.publish({ type: "PlanChanged", organizationId, payload: { previousTier, tier } });
    void platformEventBus.publish({ type: "SubscriptionChanged", organizationId, payload: { tier, status: existing.status } });
    return existing;
  }

  /** Advances `renewsAt` by one billing cycle — the real webhook/scheduled-job call site is the Commercial Platform's recurring renewal tick. */
  renew(organizationId: string): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.status = "active";
    subscription.renewsAt = this.computeNextRenewal(subscription.billingCycle);
    subscription.gracePeriodEndsAt = undefined;
    subscription.updatedAt = now();
    void platformEventBus.publish({ type: "SubscriptionRenewed", organizationId, payload: { tier: subscription.tier, renewsAt: subscription.renewsAt } });
    return subscription;
  }

  pause(organizationId: string): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.status = "paused";
    subscription.pausedAt = now();
    subscription.updatedAt = subscription.pausedAt;
    void platformEventBus.publish({ type: "SubscriptionChanged", organizationId, payload: { tier: subscription.tier, status: subscription.status } });
    return subscription;
  }

  resume(organizationId: string): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.status = "active";
    subscription.pausedAt = undefined;
    subscription.updatedAt = now();
    void platformEventBus.publish({ type: "SubscriptionChanged", organizationId, payload: { tier: subscription.tier, status: subscription.status } });
    return subscription;
  }

  /** Marks cancellation effective at the end of the current billing period (matches standard SaaS "cancel, don't lose access yet" behavior) rather than immediately revoking access. */
  cancel(organizationId: string): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.autoRenew = false;
    subscription.cancelAt = subscription.renewsAt ?? now();
    subscription.updatedAt = now();
    void platformEventBus.publish({ type: "SubscriptionCancelled", organizationId, payload: { tier: subscription.tier, cancelAt: subscription.cancelAt } });
    return subscription;
  }

  reactivate(organizationId: string): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.status = "active";
    subscription.autoRenew = true;
    subscription.cancelAt = undefined;
    subscription.canceledAt = undefined;
    subscription.gracePeriodEndsAt = undefined;
    subscription.renewsAt = this.computeNextRenewal(subscription.billingCycle);
    subscription.updatedAt = now();
    void platformEventBus.publish({ type: "SubscriptionChanged", organizationId, payload: { tier: subscription.tier, status: subscription.status } });
    return subscription;
  }

  /** Transitions an expired-but-in-grace subscription to fully `expired` once the grace window has passed — called by the Commercial Platform's recurring renewal tick, not a per-request check. */
  expireIfGraceElapsed(organizationId: string): Subscription | undefined {
    const subscription = this.subscriptions.get(organizationId);
    if (!subscription?.gracePeriodEndsAt) return undefined;
    if (new Date(subscription.gracePeriodEndsAt).getTime() > Date.now()) return subscription;
    subscription.status = "expired";
    subscription.canceledAt = now();
    subscription.updatedAt = subscription.canceledAt;
    void platformEventBus.publish({ type: "SubscriptionExpired", organizationId, payload: { tier: subscription.tier } });
    return subscription;
  }

  /** Called by the renewal tick when a billing cycle's `renewsAt` has passed without a successful payment — starts the grace window instead of immediately expiring. */
  markPastDue(organizationId: string): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.status = "past_due";
    subscription.gracePeriodEndsAt = new Date(Date.now() + GRACE_PERIOD_MS).toISOString();
    subscription.updatedAt = now();
    void platformEventBus.publish({ type: "SubscriptionChanged", organizationId, payload: { tier: subscription.tier, status: subscription.status } });
    return subscription;
  }

  recordUsage(organizationId: string, key: SubscriptionUsageKey, delta: number): Subscription {
    const subscription = this.getOrAssignDefault(organizationId);
    subscription.usage[key] = Math.max(0, subscription.usage[key] + delta);
    subscription.updatedAt = now();
    return subscription;
  }

  /** The reusable gate every module should call before consuming a limited resource (a seat, an AI credit, a connector slot, ...). */
  checkLimit(organizationId: string, key: SubscriptionUsageKey, requested = 1): LimitCheckResult {
    const subscription = this.getOrAssignDefault(organizationId);
    const limitKey = USAGE_TO_LIMIT_KEY[key];
    const limit = subscription.limits[limitKey] as number;
    const used = subscription.usage[key];
    const remaining = Math.max(0, limit - used);
    const allowed = used + requested <= limit;
    const result: LimitCheckResult = { allowed, limit, used, requested, remaining };
    if (!allowed) {
      result.reason = `Requested ${requested} would exceed the ${subscription.tier} tier's ${String(limitKey)} limit (${limit}).`;
      void platformEventBus.publish({ type: "LimitExceeded", organizationId, payload: { key, limit, used, requested } });
    }
    return result;
  }

  /** Whether a feature-gated capability (e.g. "custom-kpi-builder") is unlocked for this organization's tier. */
  hasFeatureGate(organizationId: string, featureId: string): boolean {
    const subscription = this.getOrAssignDefault(organizationId);
    return subscription.limits.featureGates.includes(featureId);
  }

  /** Whether a module id is enabled for this organization's tier ("*" unlocks every module). */
  hasModule(organizationId: string, moduleId: string): boolean {
    const subscription = this.getOrAssignDefault(organizationId);
    return subscription.limits.modules.includes("*") || subscription.limits.modules.includes(moduleId);
  }

  count(): number {
    return this.subscriptions.size;
  }
}

export const subscriptionEngine = new SubscriptionEngine();
