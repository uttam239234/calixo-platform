/**
 * Calixo Platform - Integrations "Connected Apps Center": Plain-Language Data
 *
 * Translation dictionaries only, layered over the real Universal Connector
 * Framework types (`ConnectorInstanceStatus`, `ConnectorHealthStatus`,
 * `ConnectorFeature`, `ConnectorCategory`). Nothing here is fabricated data —
 * every label is chosen from a real connector's real fields.
 */
import type { ConnectorCategory, ConnectorFeature, ConnectorInstanceStatus, ConnectorHealthStatus } from "@/core/connectors/types";

export interface StatusPresentation {
  label: string;
  className: string;
}

/** Connected Apps status badge — plain language, no "OAuth token"/"auth status" wording. */
export const INSTANCE_STATUS_LABELS: Record<ConnectorInstanceStatus, StatusPresentation> = {
  active: { label: "Connected", className: "text-success bg-success/10 border-success/20" },
  paused: { label: "Paused", className: "text-warning bg-warning/10 border-warning/20" },
  disconnected: { label: "Not Connected", className: "text-muted-foreground bg-muted/10 border-border/60" },
  error: { label: "Needs Attention", className: "text-destructive bg-destructive/10 border-destructive/20" },
};

export const APP_ICONS: Record<string, string> = {
  "google-ads": "🎯",
  "google-analytics": "📊",
  "search-console": "🔍",
  "business-profile": "📍",
  gmail: "📧",
  drive: "🗂️",
  youtube: "▶️",
  calendar: "📅",
  sheets: "📈",
  docs: "📝",
  "tag-manager": "🏷️",
  meta: "📘",
  linkedin: "💼",
  microsoft: "🪟",
  slack: "💬",
  hubspot: "🧲",
  salesforce: "☁️",
  shopify: "🛍️",
  wordpress: "📰",
  tiktok: "🎵",
  x: "✖️",
  mailchimp: "🐵",
  notion: "🗒️",
};

export function iconForApp(connectorId: string): string {
  return APP_ICONS[connectorId] ?? "🔌";
}

/** Short marketplace description per connector — presentational copy only, not business data. */
export const CONNECTOR_DESCRIPTIONS: Record<string, string> = {
  "google-ads": "Manage and report on Google Ads campaigns.",
  "google-analytics": "See traffic, conversions, and audience insights from GA4.",
  "search-console": "Track search performance and indexing health.",
  "business-profile": "Keep your Google Business listing and reviews in view.",
  gmail: "Ground reporting and outreach workflows in your inbox.",
  drive: "Bring shared files into your asset workflows.",
  youtube: "Track channel and video performance.",
  calendar: "See scheduling context from your team's calendar.",
  sheets: "Pull spreadsheet data into reporting workflows.",
  docs: "Bring shared documents into content workflows.",
  "tag-manager": "See which tags and triggers are firing.",
  meta: "Facebook and Instagram ads, pages, and audiences.",
  linkedin: "LinkedIn campaigns, company pages, and lead gen forms.",
  microsoft: "Outlook, Teams, and Microsoft 365 data.",
  slack: "Send Calixo updates to your team's Slack channels.",
  hubspot: "Sync contacts, deals, and marketing activity.",
  salesforce: "Sync leads, contacts, and opportunities.",
  shopify: "Storefront orders, products, and customers.",
  wordpress: "Publish and track content on your WordPress site.",
  tiktok: "TikTok Ads campaign and audience data.",
  x: "X (Twitter) posts, mentions, and audience data.",
  mailchimp: "Email campaigns, audiences, and automations.",
  notion: "Bring shared docs and databases into your workflows.",
};

export const CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  advertising: "Advertising",
  analytics: "Analytics",
  search: "Search",
  social: "Social",
  crm: "CRM",
  productivity: "Productivity",
  communication: "Communication",
  ecommerce: "Ecommerce",
  cms: "CMS",
};

/** Display order for the Marketplace category filter row. */
export const MARKETPLACE_CATEGORIES: ConnectorCategory[] = [
  "advertising", "analytics", "search", "social", "crm", "productivity", "communication", "ecommerce", "cms",
];

/** Well-known, broadly-recognized business tools — an editorial "Popular" badge, not a fabricated usage count. */
export const POPULAR_CONNECTOR_IDS = new Set(["google-analytics", "google-ads", "meta", "shopify", "hubspot", "slack"]);

/** Providers with no real adapter in the Universal Connector Framework yet — shown as "Coming Soon" cards rather than demo data. Presentational only; installing one is not possible. */
export interface PlannedConnector {
  id: string;
  displayName: string;
  category: ConnectorCategory;
}

export const PLANNED_CONNECTORS: PlannedConnector[] = [
  { id: "tiktok", displayName: "TikTok Ads", category: "advertising" },
  { id: "x", displayName: "X (Twitter)", category: "social" },
  { id: "mailchimp", displayName: "Mailchimp", category: "communication" },
  { id: "notion", displayName: "Notion", category: "productivity" },
];

/** Permissions page — "Google Analytics can: ✓ Reporting ✕ Campaign management" — every row comes from a connector's real `supportedFeatures`. */
export const FEATURE_LABELS: Record<ConnectorFeature, string> = {
  reporting: "Create reports from this data",
  "campaign-management": "Manage campaigns",
  "audience-insights": "Read audience insights",
  "content-publishing": "Publish content",
  "lead-sync": "Sync leads and contacts",
  messaging: "Send and receive messages",
  "file-access": "Read shared files",
  "email-access": "Read email for reporting/outreach",
  "calendar-access": "Read calendar events",
  "commerce-catalog": "Read storefront catalog and orders",
};

export const ALL_FEATURES: ConnectorFeature[] = [
  "reporting", "campaign-management", "audience-insights", "content-publishing", "lead-sync",
  "messaging", "file-access", "email-access", "calendar-access", "commerce-catalog",
];

export interface HealthPresentation {
  emoji: "🟢" | "🟡" | "🔴";
  label: "Healthy" | "Attention Needed" | "Reconnect Required";
}

/** Collapses the framework's 9-value `ConnectorHealthStatus` onto a 3-state traffic light. */
export function presentHealth(status: ConnectorHealthStatus): HealthPresentation {
  if (status === "healthy") return { emoji: "🟢", label: "Healthy" };
  if (status === "warning" || status === "rate_limited" || status === "unknown") return { emoji: "🟡", label: "Attention Needed" };
  return { emoji: "🔴", label: "Reconnect Required" };
}

/** Translates a technical health status into the human sentence the brief requires — never shows the raw status code. */
export function explainHealth(status: ConnectorHealthStatus, appName: string): string {
  switch (status) {
    case "expired_token":
      return `${appName}'s access has expired — reconnect to keep syncing.`;
    case "permission_missing":
      return `${appName} is missing a permission it needs — reconnect to grant it.`;
    case "disconnected":
      return `${appName} isn't connected yet.`;
    case "configuration_error":
    case "sync_failed":
      return `${appName} needs to be reconnected.`;
    case "rate_limited":
      return `${appName} is syncing more slowly than usual — no action needed yet.`;
    case "warning":
    case "unknown":
      return `We're checking ${appName}'s status.`;
    default:
      return `${appName} is syncing normally.`;
  }
}

export interface StarterIntegrationSet {
  id: string;
  name: string;
  description: string;
  connectorIds: string[];
}

/** One-click "Starter Integrations" recommendations — installs each app (real `ConnectorInstance`, not yet connected) so it's one click away from Connect on the Connected Apps page. */
export const STARTER_INTEGRATION_SETS: StarterIntegrationSet[] = [
  { id: "university", name: "University", description: "Google Analytics, Google Ads, Meta, LinkedIn.", connectorIds: ["google-analytics", "google-ads", "meta", "linkedin"] },
  { id: "agency", name: "Agency", description: "Google Analytics, Meta, LinkedIn, HubSpot.", connectorIds: ["google-analytics", "meta", "linkedin", "hubspot"] },
  { id: "ecommerce", name: "Ecommerce", description: "Shopify, Google Analytics, Meta, Slack.", connectorIds: ["shopify", "google-analytics", "meta", "slack"] },
];
