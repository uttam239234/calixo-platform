/**
 * Calixo Platform - Subscription Platform API
 *
 * Thin facade over Phase 1's real `subscriptionEngine`, extended this phase
 * with billing-cycle/lifecycle methods (renew/pause/resume/cancel/
 * reactivate/markPastDue).
 */
import { subscriptionEngine } from "@/core/platform/subscription/SubscriptionEngine";
import type { BillingCycle, Subscription, SubscriptionTier } from "@/core/platform/subscription/types";

export class SubscriptionPlatformAPI {
  start(organizationId: string, tier: SubscriptionTier = "trial", billingCycle: BillingCycle = "monthly"): Subscription {
    return subscriptionEngine.assign(organizationId, tier, billingCycle);
  }

  get(organizationId: string): Subscription | undefined {
    return subscriptionEngine.get(organizationId);
  }

  getOrDefault(organizationId: string): Subscription {
    return subscriptionEngine.getOrAssignDefault(organizationId);
  }

  upgrade(organizationId: string, tier: SubscriptionTier): Subscription {
    return subscriptionEngine.changeTier(organizationId, tier);
  }

  downgrade(organizationId: string, tier: SubscriptionTier): Subscription {
    return subscriptionEngine.changeTier(organizationId, tier);
  }

  renew(organizationId: string): Subscription {
    return subscriptionEngine.renew(organizationId);
  }

  pause(organizationId: string): Subscription {
    return subscriptionEngine.pause(organizationId);
  }

  resume(organizationId: string): Subscription {
    return subscriptionEngine.resume(organizationId);
  }

  cancel(organizationId: string): Subscription {
    return subscriptionEngine.cancel(organizationId);
  }

  reactivate(organizationId: string): Subscription {
    return subscriptionEngine.reactivate(organizationId);
  }

  markPastDue(organizationId: string): Subscription {
    return subscriptionEngine.markPastDue(organizationId);
  }

  expireIfGraceElapsed(organizationId: string): Subscription | undefined {
    return subscriptionEngine.expireIfGraceElapsed(organizationId);
  }
}

export const subscriptionPlatformAPI = new SubscriptionPlatformAPI();
