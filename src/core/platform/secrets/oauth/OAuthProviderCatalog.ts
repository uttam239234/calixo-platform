/**
 * Calixo Platform - OAuth Applications: Provider Catalog
 *
 * The static, code-defined shape of each of the 9 real OAuth applications
 * Calixo registers with each vendor. Field lists, labels, and default
 * scopes match the brief's own per-provider spec exactly. Real scope
 * strings (not placeholders) are used for Google's pre-populated defaults
 * since the whole point of this phase is to be immediately usable by a
 * future real Connector.
 */
import type { OAuthProviderDefinition } from "./types";
import { GOOGLE_DEFAULT_SERVICE_IDS, GOOGLE_SERVICE_CATALOG } from "./google/GoogleScopeRegistry";
import { GoogleScopeService } from "./google/GoogleScopeService";

function minLength(n: number, label: string) {
  return (value: string): { valid: boolean; message: string } => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: "Empty value." };
    return trimmed.length >= n ? { valid: true, message: `Looks like a valid ${label}.` } : { valid: false, message: `${label} should be at least ${n} characters.` };
  };
}

function pattern(regex: RegExp, label: string, expectation: string) {
  return (value: string): { valid: boolean; message: string } => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: "Empty value." };
    return regex.test(trimmed) ? { valid: true, message: `Looks like a valid ${label}.` } : { valid: false, message: `${label} should ${expectation}.` };
  };
}

export const OAUTH_PROVIDER_CATALOG: OAuthProviderDefinition[] = [
  {
    id: "google",
    cardTitle: "Google Cloud OAuth",
    shortLabel: "Google",
    description: "One Google Cloud OAuth client powers every Google-family connector — Ads, Analytics, Search Console, Business Profile, YouTube, Drive, and Gmail — via scopes, not separate apps.",
    connectors: ["Google Ads", "Google Analytics", "Google Search Console", "Google Business Profile", "YouTube", "Gmail"],
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    hasProjectId: true,
    hasTenantId: false,
    hasScopes: true,
    // Scope Manager: a Platform Owner picks Google *services* (see GoogleScopeRegistry), never a raw
    // scope URL. `scopeOptions`/`defaultScopes` stay populated here (derived, not hand-duplicated) so
    // every generic consumer of `OAuthProviderDefinition` — completion %, `getProvider()` — still sees
    // real, correct values; the UI itself renders the dedicated Google Services picker instead of the
    // generic scope-chip list for this one provider.
    scopeOptions: GOOGLE_SERVICE_CATALOG.flatMap(s => s.scopes.map(scope => ({ scope, label: s.label }))),
    defaultScopes: GoogleScopeService.generateScopes(GOOGLE_DEFAULT_SERVICE_IDS),
    extraFields: [],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/, "Client ID", "look like <digits>-<id>.apps.googleusercontent.com"),
    validateClientSecret: pattern(/^GOCSPX-[A-Za-z0-9_-]+$/, "Client Secret", "start with GOCSPX-"),
  },
  {
    id: "meta",
    cardTitle: "Meta Developers",
    shortLabel: "Meta",
    description: "Powers Meta Ads, Facebook Pages, and Instagram Business — one Meta app, scoped per connector.",
    connectors: ["Meta Ads", "Facebook Pages", "Instagram Business"],
    clientIdLabel: "App ID",
    clientSecretLabel: "App Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: true,
    scopeOptions: [
      { scope: "ads_management", label: "Ads Management" },
      { scope: "pages_show_list", label: "Pages: List" },
      { scope: "pages_read_engagement", label: "Pages: Read Engagement" },
      { scope: "instagram_basic", label: "Instagram: Basic" },
      { scope: "instagram_manage_insights", label: "Instagram: Insights" },
      { scope: "business_management", label: "Business Management" },
    ],
    defaultScopes: ["ads_management", "pages_show_list", "pages_read_engagement"],
    extraFields: [],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^\d{10,20}$/, "App ID", "be a 10-20 digit numeric App ID"),
    validateClientSecret: pattern(/^[a-f0-9]{32}$/, "App Secret", "be a 32-character hex string"),
  },
  {
    id: "linkedin",
    cardTitle: "LinkedIn OAuth",
    shortLabel: "LinkedIn",
    description: "Powers the LinkedIn connector — organization pages, lead gen forms, and ad campaigns.",
    connectors: ["LinkedIn"],
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: true,
    scopeOptions: [
      { scope: "r_organization_social", label: "Read Organization Posts" },
      { scope: "w_organization_social", label: "Write Organization Posts" },
      { scope: "r_ads", label: "Read Ads" },
      { scope: "rw_ads", label: "Manage Ads" },
    ],
    defaultScopes: ["r_organization_social", "w_organization_social"],
    extraFields: [],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: minLength(10, "Client ID"),
    validateClientSecret: minLength(16, "Client Secret"),
  },
  {
    id: "microsoft",
    cardTitle: "Microsoft OAuth",
    shortLabel: "Microsoft",
    description: "Powers Outlook and other Microsoft 365 connectors via a Microsoft Entra (Azure AD) app registration.",
    connectors: ["Outlook"],
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    hasProjectId: false,
    hasTenantId: true,
    hasScopes: true,
    scopeOptions: [
      { scope: "https://graph.microsoft.com/Mail.Read", label: "Read Mail" },
      { scope: "https://graph.microsoft.com/Mail.Send", label: "Send Mail" },
      { scope: "https://graph.microsoft.com/User.Read", label: "Read Profile" },
      { scope: "offline_access", label: "Offline Access (refresh tokens)" },
    ],
    defaultScopes: ["https://graph.microsoft.com/Mail.Read", "https://graph.microsoft.com/User.Read", "offline_access"],
    extraFields: [],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^[0-9a-fA-F-]{36}$/, "Client ID", "be a GUID, e.g. 11111111-2222-3333-4444-555555555555"),
    validateClientSecret: minLength(8, "Client Secret"),
  },
  {
    id: "slack",
    cardTitle: "Slack App",
    shortLabel: "Slack",
    description: "Powers the Slack connector — channel notifications and workspace integrations.",
    connectors: ["Slack"],
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: false,
    scopeOptions: [],
    defaultScopes: [],
    extraFields: [
      { key: "signingSecret", label: "Signing Secret", kind: "secret", placeholder: "Signing secret from the Slack app dashboard", required: true, validate: pattern(/^[a-f0-9]{32}$/, "Signing Secret", "be a 32-character hex string") },
      { key: "botToken", label: "Bot Token", kind: "secret", placeholder: "xoxb-...", required: false, validate: pattern(/^xoxb-[A-Za-z0-9-]+$/, "Bot Token", "start with xoxb-") },
    ],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^\d+\.\d+$/, "Client ID", "look like <digits>.<digits>"),
    validateClientSecret: pattern(/^[a-f0-9]{32}$/, "Client Secret", "be a 32-character hex string"),
  },
  {
    id: "hubspot",
    cardTitle: "HubSpot App",
    shortLabel: "HubSpot",
    description: "Powers the HubSpot CRM connector.",
    connectors: ["HubSpot"],
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: false,
    scopeOptions: [],
    defaultScopes: [],
    extraFields: [{ key: "developerAccount", label: "Developer Account", kind: "plain", placeholder: "HubSpot developer account ID", required: true, validate: pattern(/^\d+$/, "Developer Account", "be numeric") }],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^[0-9a-fA-F-]{36}$/, "Client ID", "be a UUID"),
    validateClientSecret: pattern(/^[0-9a-fA-F-]{36}$/, "Client Secret", "be a UUID"),
  },
  {
    id: "salesforce",
    cardTitle: "Salesforce Connected App",
    shortLabel: "Salesforce",
    description: "Powers the Salesforce CRM connector.",
    connectors: ["Salesforce"],
    clientIdLabel: "Consumer Key",
    clientSecretLabel: "Consumer Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: false,
    scopeOptions: [],
    defaultScopes: [],
    extraFields: [{ key: "loginUrl", label: "Login URL", kind: "plain", placeholder: "https://login.salesforce.com", required: true, validate: pattern(/^https:\/\/.+\.salesforce\.com$/, "Login URL", "be an https:// Salesforce login domain") }],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: minLength(32, "Consumer Key"),
    validateClientSecret: minLength(16, "Consumer Secret"),
  },
  {
    id: "shopify",
    cardTitle: "Shopify App",
    shortLabel: "Shopify",
    description: "Powers the Shopify storefront connector. Real per-shop OAuth testing needs a shop domain, provided at connect time in a future phase — not part of this platform-level app record.",
    connectors: ["Shopify"],
    clientIdLabel: "API Key",
    clientSecretLabel: "API Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: false,
    scopeOptions: [],
    defaultScopes: [],
    extraFields: [],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^[a-f0-9]{32}$/, "API Key", "be a 32-character hex string"),
    validateClientSecret: pattern(/^[a-f0-9]{32}$/, "API Secret", "be a 32-character hex string"),
  },
  {
    id: "wordpress",
    cardTitle: "WordPress.com OAuth",
    shortLabel: "WordPress",
    description: "Powers the WordPress connector via the WordPress.com OAuth2 API.",
    connectors: ["WordPress"],
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    hasProjectId: false,
    hasTenantId: false,
    hasScopes: false,
    scopeOptions: [],
    defaultScopes: [],
    extraFields: [],
    redirectPathHint: "/api/connectors/oauth/callback",
    validateClientId: pattern(/^\d+$/, "Client ID", "be numeric"),
    validateClientSecret: minLength(16, "Client Secret"),
  },
];

export function getOAuthProviderDefinition(id: string): OAuthProviderDefinition | undefined {
  return OAUTH_PROVIDER_CATALOG.find(p => p.id === id);
}

export function listOAuthProviderDefinitions(): OAuthProviderDefinition[] {
  return OAUTH_PROVIDER_CATALOG;
}
