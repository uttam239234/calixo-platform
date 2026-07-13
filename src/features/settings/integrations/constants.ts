/**
 * Calixo Platform - Integrations "Connected Apps Center": Plain-Language Data
 *
 * Translation dictionaries only — the business vocabulary the brief
 * requires ("My Connected Apps", not "Connector Providers") layered over
 * real platform types (`ProviderCapability`, `ConnectionStatus`,
 * `ConnectorHealthStatus`). Nothing here is fabricated data: every label is
 * chosen from a real connection's real fields.
 */
import type { ProviderCapability, ConnectionStatus } from "@/integrations/types";
import type { ConnectorCategory } from "@/core/platform/connectors";

export interface ConnectionStatusPresentation {
  label: string;
  className: string;
}

/** Section 1 (Connected Apps) status badge — plain language, no "OAuth token" / "auth status" wording. */
export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, ConnectionStatusPresentation> = {
  connected: { label: "Connected", className: "text-success bg-success/10 border-success/20" },
  pending: { label: "Connecting…", className: "text-primary bg-primary/10 border-primary/20" },
  connecting: { label: "Connecting…", className: "text-primary bg-primary/10 border-primary/20" },
  paused: { label: "Paused", className: "text-warning bg-warning/10 border-warning/20" },
  expired: { label: "Reconnect Needed", className: "text-destructive bg-destructive/10 border-destructive/20" },
  error: { label: "Needs Attention", className: "text-destructive bg-destructive/10 border-destructive/20" },
  disconnected: { label: "Disconnected", className: "text-muted-foreground bg-muted/10 border-border/60" },
};

/** The 5 Dashboard-demo providers predate the manifest system and can't be re-manifested (Ads Manager/Social Media adapters key off their exact ids and capabilities) — mapped here to the brief's 9-category taxonomy for Marketplace display only. */
export const LEGACY_PROVIDER_CATEGORY: Record<string, ConnectorCategory> = {
  "google-ads": "advertising",
  "meta-ads": "advertising",
  "linkedin-ads": "advertising",
  instagram: "social_media",
  youtube: "video",
};

export const APP_ICONS: Record<string, string> = {
  "google-analytics-manifest": "📊",
  "google-ads": "🎯",
  "meta-ads": "📘",
  instagram: "📷",
  "linkedin-ads": "💼",
  youtube: "▶️",
  tiktok: "🎵",
  x: "✖️",
  shopify: "🛍️",
  hubspot: "🧲",
  salesforce: "☁️",
  mailchimp: "🐵",
  slack: "💬",
  notion: "📝",
};

export function iconForApp(providerId: string): string {
  return APP_ICONS[providerId] ?? "🔌";
}

export const CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  analytics: "Analytics",
  advertising: "Advertising",
  social_media: "Social Media",
  video: "Video",
  email: "Email",
  commerce: "Ecommerce",
  ai: "AI",
  crm: "CRM",
  productivity: "Productivity",
  erp: "ERP",
  hr: "HR",
  finance: "Finance",
  communication: "Communication",
  cloud_storage: "Cloud Storage",
  cms: "CMS",
  databases: "Databases",
  developer_tools: "Developer Tools",
  custom_api: "Custom API",
  webhook: "Webhook",
};

/** The brief's 9-category Marketplace taxonomy, in display order. */
export const MARKETPLACE_CATEGORIES: ConnectorCategory[] = [
  "analytics", "advertising", "social_media", "video", "email", "commerce", "ai", "crm", "productivity",
];

/** Well-known, broadly-recognized business tools — an editorial "Popular" badge, not a fabricated usage count (this platform has no cross-organization install-count metric to report honestly). */
export const POPULAR_PROVIDER_IDS = new Set([
  "google-analytics-manifest", "google-ads", "meta-ads", "instagram", "shopify", "hubspot", "slack",
]);

/** Section 3 (Permissions) — "Google Analytics can: ✓ Read analytics data ✕ Publish content" — every ✓/✕ comes from a connection's real `capabilities` array. */
export const CAPABILITY_LABELS: Record<ProviderCapability, string> = {
  read_campaigns: "Read your ad campaigns",
  write_campaigns: "Create and edit ad campaigns",
  read_analytics: "Read analytics data",
  write_analytics: "Send analytics data",
  read_ads: "Read ad performance",
  write_ads: "Create and edit ads",
  read_social: "Read your posts and mentions",
  write_social: "Post content on your behalf",
  read_contacts: "Read your contacts",
  write_contacts: "Create and update contacts",
  read_reports: "Create reports from this data",
  manage_webhooks: "Send Calixo real-time updates",
};

export const ALL_CAPABILITIES: ProviderCapability[] = [
  "read_campaigns", "write_campaigns", "read_analytics", "write_analytics",
  "read_ads", "write_ads", "read_social", "write_social",
  "read_contacts", "write_contacts", "read_reports", "manage_webhooks",
];

export interface HealthPresentation {
  emoji: "🟢" | "🟡" | "🔴";
  label: "Healthy" | "Attention Needed" | "Reconnect Required";
}

/** Section 4 (Sync Status) — collapses the platform's 9-value `ConnectorHealthStatus` onto the brief's 3-state traffic light. Takes a plain `string` since `ConnectorObservabilitySummary.status` is loosely typed at its source; the values checked here are the only ones the platform ever actually produces. */
export function presentHealth(status: string): HealthPresentation {
  if (status === "healthy" || status === "connected" || status === "syncing") return { emoji: "🟢", label: "Healthy" };
  if (status === "expired" || status === "error" || status === "disconnected") return { emoji: "🔴", label: "Reconnect Required" };
  return { emoji: "🟡", label: "Attention Needed" };
}

/** Translates a technical failure into the human sentence the brief requires (e.g. "401 Unauthorized" -> "Your Google Analytics account needs to be reconnected.") — never shows the raw status code. */
export function explainHealth(status: string, appName: string): string {
  if (status === "expired" || status === "error" || status === "disconnected") {
    return `Your ${appName} account needs to be reconnected.`;
  }
  if (status === "warning" || status === "rate_limited" || status === "paused") {
    return `${appName} is syncing more slowly than usual — no action needed yet.`;
  }
  return `${appName} is syncing normally.`;
}

export interface StarterIntegrationSet {
  id: string;
  name: string;
  description: string;
  providerIds: string[];
}

/** The brief's one-click "Starter Integrations" recommendations, matched exactly to its worked examples. */
export const STARTER_INTEGRATION_SETS: StarterIntegrationSet[] = [
  { id: "university", name: "University", description: "Google Analytics, Google Ads, Meta, LinkedIn.", providerIds: ["google-analytics-manifest", "google-ads", "meta-ads", "linkedin-ads"] },
  { id: "agency", name: "Agency", description: "Google Analytics, Meta, LinkedIn, HubSpot.", providerIds: ["google-analytics-manifest", "meta-ads", "linkedin-ads", "hubspot"] },
  { id: "ecommerce", name: "Ecommerce", description: "Shopify, Google Analytics, Meta, Mailchimp.", providerIds: ["shopify", "google-analytics-manifest", "meta-ads", "mailchimp"] },
];
