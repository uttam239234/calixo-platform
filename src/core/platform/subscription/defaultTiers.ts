import type { SubscriptionTierDefinition } from "./types";

/** The canonical tiers — Trial, Starter, Growth, Enterprise only (Round 21: Free/Education/Agency/Custom removed entirely). Pricing lives in the Commercial Platform's `PricingEngine` (Track 1 Phase 9) — this stays limits-only, matching Phase 1's original scope. */
export const DEFAULT_SUBSCRIPTION_TIERS: SubscriptionTierDefinition[] = [
  {
    tier: "trial",
    label: "Trial",
    description: "Full-featured evaluation period with hard usage ceilings.",
    limits: { seats: 3, aiCredits: 500, storageGB: 5, connectors: 2, brands: 1, workspaces: 1, organizations: 1, reports: 10, scheduledReports: 2, apiRequests: 2000, modules: ["dashboard", "analytics", "reports"], featureGates: [] },
    isActive: true,
  },
  {
    tier: "starter",
    label: "Starter",
    description: "Small teams running a single brand out of one workspace.",
    limits: { seats: 10, aiCredits: 2000, storageGB: 25, connectors: 5, brands: 1, workspaces: 2, organizations: 2, reports: 25, scheduledReports: 5, apiRequests: 10000, modules: ["dashboard", "analytics", "reports", "ads", "social", "ai-copilot"], featureGates: [] },
    isActive: true,
  },
  {
    tier: "growth",
    label: "Growth",
    description: "Growing marketing orgs managing multiple brands and workspaces.",
    limits: { seats: 50, aiCredits: 10000, storageGB: 150, connectors: 20, brands: 5, workspaces: 10, organizations: 5, reports: 100, scheduledReports: 25, apiRequests: 100000, modules: ["dashboard", "analytics", "reports", "ads", "social", "ai-copilot", "brand", "content", "workflow"], featureGates: ["custom-kpi-builder", "saved-segments"] },
    isActive: true,
  },
  {
    tier: "enterprise",
    label: "Enterprise",
    description: "Large multi-brand organizations with advanced governance needs.",
    limits: { seats: 500, aiCredits: 100000, storageGB: 2000, connectors: 200, brands: 50, workspaces: 100, organizations: 50, reports: 1000, scheduledReports: 250, apiRequests: 2000000, modules: ["*"], featureGates: ["custom-kpi-builder", "saved-segments", "sso", "audit-export", "white-label"] },
    isActive: true,
  },
];
