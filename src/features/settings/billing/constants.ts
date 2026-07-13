/**
 * Calixo Platform - Billing & Plans "Subscription and AI Usage Center":
 * Plain-Language Data
 *
 * Translation dictionaries and locked business data only — every number a
 * page renders from these comes from a real `Subscription`/`Invoice`/
 * `CreditBalance` elsewhere; nothing here is a fabricated metric.
 */
import type { SubscriptionTier, SubscriptionStatus } from "@/core/platform/subscription";

/** Plain-language translations for the real `SubscriptionStatus` union — never shows raw status codes. */
export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Payment Needed",
  paused: "Paused",
  canceled: "Canceled",
  expired: "Expired",
};

/** The brief's self-serve catalog — a curated subset of the real 8-tier backend (`free`/`education`/`agency`/`custom` also exist and are shown honestly if an organization is actually on one, just not offered here as an upgrade target). */
export const SELF_SERVE_TIERS: SubscriptionTier[] = ["trial", "starter", "growth", "enterprise"];

export const TIER_RECOMMENDED_USE_CASE: Record<SubscriptionTier, string> = {
  free: "Trying Calixo on your own, one workspace at a time.",
  trial: "Evaluating Calixo before committing — full features, 14 days.",
  starter: "Small teams running one brand out of a single workspace.",
  growth: "Growing marketing teams managing multiple brands and departments.",
  enterprise: "Large organizations that need advanced governance and dedicated support.",
  education: "Accredited schools and universities — discounted pricing.",
  agency: "Agencies managing marketing for many clients at once.",
  custom: "Organizations with negotiated, bespoke requirements.",
};

/** Plain-language translations for the real module ids a tier unlocks (`SubscriptionLimits.modules`). */
export const MODULE_LABELS: Record<string, string> = {
  "*": "Every module",
  dashboard: "Dashboard",
  analytics: "Analytics",
  reports: "Reports",
  ads: "Ads Manager",
  social: "Social Media",
  "ai-copilot": "AI Copilot",
  brand: "Brand Monitoring",
  content: "Content Studio",
  workflow: "Workflows",
};

/** Plain-language translations for the real feature-gate ids a tier unlocks (`SubscriptionLimits.featureGates`). */
export const FEATURE_GATE_LABELS: Record<string, string> = {
  "custom-kpi-builder": "Custom KPI builder",
  "saved-segments": "Saved audience segments",
  sso: "Single sign-on (SSO)",
  "audit-export": "Audit log export",
  "white-label": "White-label branding",
};

/** The brief's 3 usage-alert checkpoints, in ascending order. */
export const USAGE_ALERT_THRESHOLDS = [80, 90, 100] as const;

export function usageAlertMessage(percentUsed: number): string | null {
  if (percentUsed >= 100) return "You have used all your included AI credits.";
  if (percentUsed >= 90) return "You have used 90% of your AI credits.";
  if (percentUsed >= 80) return "You have used 80% of your AI credits.";
  return null;
}
