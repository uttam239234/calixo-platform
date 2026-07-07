import type { SubscriptionTierDefinition } from "./types";

/** The canonical tiers. Pricing lives in the Commercial Platform's `PricingEngine` (Track 1 Phase 9) — this stays limits-only, matching Phase 1's original scope. */
export const DEFAULT_SUBSCRIPTION_TIERS: SubscriptionTierDefinition[] = [
  {
    tier: "free",
    label: "Free",
    description: "Perpetual, narrow-limits tier for individuals evaluating a single workspace.",
    limits: { seats: 1, aiCredits: 50, storageGB: 1, connectors: 1, brands: 1, workspaces: 1, modules: ["dashboard"], featureGates: [] },
  },
  {
    tier: "trial",
    label: "Trial",
    description: "Full-featured evaluation period with hard usage ceilings.",
    limits: { seats: 3, aiCredits: 500, storageGB: 5, connectors: 2, brands: 1, workspaces: 1, modules: ["dashboard", "analytics", "reports"], featureGates: [] },
  },
  {
    tier: "starter",
    label: "Starter",
    description: "Small teams running a single brand out of one workspace.",
    limits: { seats: 10, aiCredits: 2000, storageGB: 25, connectors: 5, brands: 1, workspaces: 2, modules: ["dashboard", "analytics", "reports", "ads", "social", "ai-copilot"], featureGates: [] },
  },
  {
    tier: "growth",
    label: "Growth",
    description: "Growing marketing orgs managing multiple brands and workspaces.",
    limits: { seats: 50, aiCredits: 10000, storageGB: 150, connectors: 20, brands: 5, workspaces: 10, modules: ["dashboard", "analytics", "reports", "ads", "social", "ai-copilot", "brand", "content", "workflow"], featureGates: ["custom-kpi-builder", "saved-segments"] },
  },
  {
    tier: "enterprise",
    label: "Enterprise",
    description: "Large multi-brand organizations with advanced governance needs.",
    limits: { seats: 500, aiCredits: 100000, storageGB: 2000, connectors: 200, brands: 50, workspaces: 100, modules: ["*"], featureGates: ["custom-kpi-builder", "saved-segments", "sso", "audit-export", "white-label"] },
  },
  {
    tier: "education",
    label: "Education",
    description: "Discounted tier for accredited educational institutions.",
    limits: { seats: 100, aiCredits: 20000, storageGB: 300, connectors: 20, brands: 10, workspaces: 20, modules: ["dashboard", "analytics", "reports", "ai-copilot", "content", "workflow"], featureGates: ["saved-segments"] },
  },
  {
    tier: "agency",
    label: "Agency",
    description: "Multi-client management for marketing/creative agencies managing brands on behalf of clients.",
    limits: { seats: 100, aiCredits: 50000, storageGB: 1000, connectors: 100, brands: 100, workspaces: 50, modules: ["*"], featureGates: ["custom-kpi-builder", "saved-segments", "white-label"] },
  },
  {
    tier: "custom",
    label: "Custom",
    description: "Negotiated limits for accounts with bespoke requirements.",
    limits: { seats: 0, aiCredits: 0, storageGB: 0, connectors: 0, brands: 0, workspaces: 0, modules: [], featureGates: [] },
  },
];
