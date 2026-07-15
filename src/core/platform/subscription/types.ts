/**
 * Calixo Platform - Subscription Foundation Types
 *
 * Round 21: the catalog was cut from 8 tiers to the 4 Calixo actually sells
 * — `free`/`education`/`agency`/`custom` are removed outright, not just
 * hidden, per an explicit "delete entirely from Subscription Plans, Usage
 * Limits, Pricing Rules, Billing, Upgrade Center, Entitlement Engine"
 * mandate. `SubscriptionTier` narrowing to a 4-value union is deliberate:
 * every remaining reference to a removed tier literal becomes a real
 * compile error, which is what actually found every call site this round
 * touched (mock seed data, the landing page, Contract-seeding logic) rather
 * than relying on grep alone.
 */

export type SubscriptionTier = "trial" | "starter" | "growth" | "enterprise";

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ["trial", "starter", "growth", "enterprise"];

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "paused" | "canceled" | "expired";

export type BillingCycle = "monthly" | "annual";

/** Everything a Subscription gates — seats/credits/storage are counters, `modules`/`featureGates` are unlock lists. */
export interface SubscriptionLimits {
  seats: number;
  aiCredits: number;
  storageGB: number;
  connectors: number;
  brands: number;
  workspaces: number;
  /** Added for the Internal Plan Management Console's Usage Limits section — an organization can belong to at most this many sub-organizations/departments. */
  organizations: number;
  reports: number;
  scheduledReports: number;
  apiRequests: number;
  modules: string[];
  featureGates: string[];
}

export interface SubscriptionTierDefinition {
  tier: SubscriptionTier;
  label: string;
  description: string;
  limits: SubscriptionLimits;
  /** Added for the Internal Plan Management Console — a disabled/archived tier is never offered as an upgrade target, but existing subscribers keep working. */
  isActive: boolean;
}

export interface SubscriptionUsage {
  seatsUsed: number;
  aiCreditsUsed: number;
  storageGBUsed: number;
  connectorsUsed: number;
  brandsUsed: number;
  workspacesUsed: number;
}

export type SubscriptionUsageKey = keyof SubscriptionUsage;

/** The limit dimension a usage key maps to, e.g. `seatsUsed` is checked against `limits.seats`. */
export const USAGE_TO_LIMIT_KEY: Record<SubscriptionUsageKey, keyof SubscriptionLimits> = {
  seatsUsed: "seats",
  aiCreditsUsed: "aiCredits",
  storageGBUsed: "storageGB",
  connectorsUsed: "connectors",
  brandsUsed: "brands",
  workspacesUsed: "workspaces",
};

export interface Subscription {
  id: string;
  organizationId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  trialEndsAt?: string;
  renewsAt?: string;
  pausedAt?: string;
  cancelAt?: string;
  canceledAt?: string;
  gracePeriodEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LimitCheckResult {
  allowed: boolean;
  limit: number;
  used: number;
  requested: number;
  remaining: number;
  reason?: string;
}
