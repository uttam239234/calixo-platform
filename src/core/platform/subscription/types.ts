/**
 * Calixo Platform - Subscription Foundation Types
 *
 * Extended by the Enterprise Commercial Platform (Track 1 Phase 9) —
 * additively, per this codebase's established convention: existing tiers/
 * statuses are never renamed, only appended, so the 16 existing call sites
 * (OrganizationEngine, TenantContextService, WorkspaceEngine, ...) keep
 * working unchanged.
 */

export type SubscriptionTier = "free" | "trial" | "starter" | "growth" | "enterprise" | "education" | "agency" | "custom";

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ["free", "trial", "starter", "growth", "enterprise", "education", "agency", "custom"];

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
