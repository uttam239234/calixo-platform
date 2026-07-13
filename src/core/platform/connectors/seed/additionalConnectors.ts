/**
 * Calixo Platform - Integrations "Connected Apps Center" (Round 13):
 * Additional Marketplace Manifests
 *
 * The brief names 14 apps across 9 categories. 6 already exist in this
 * codebase (Google Analytics as a real manifest; Google Ads/Meta
 * Ads/Instagram/LinkedIn/YouTube as bare `ProviderDefinition`s Dashboard's
 * `seedDashboardConnections.ts` registers directly — deliberately left
 * untouched here, since Ads Manager's `AdsConnectorAdapter` and Social
 * Media's `SocialConnectorAdapter` key off those exact 5 ids' exact
 * `capabilities` arrays to detect a "live" connector; re-registering them
 * under a manifest with different capabilities would silently break that
 * detection). This file registers the remaining 8 as real, lightweight
 * manifests through the same `defineConnector()`/`connectorManifestRegistry`
 * extension point every other connector in this platform uses — no platform
 * code changes, same "no real vendor, so a deterministic mock fetcher"
 * pattern already used throughout this codebase for real-vendor boundaries.
 */
import { connectorManifestRegistry } from "../ConnectorManifestRegistry";
import type { ConnectorManifest } from "../types";

function sharedFields(): Pick<ConnectorManifest, "version" | "isBeta" | "minPlan" | "configFields" | "supportedSyncFrequencies" | "supportedWebhookEvents"> {
  return {
    version: "1.0.0",
    isBeta: false,
    minPlan: "starter",
    configFields: [],
    supportedSyncFrequencies: ["hourly", "daily", "manual"],
    supportedWebhookEvents: [],
  };
}

const TIKTOK_MANIFEST: ConnectorManifest = {
  id: "tiktok",
  name: "TikTok",
  description: "Short-form video content and ad performance.",
  ...sharedFields(),
  category: "social_media",
  legacyCategory: "social",
  icon: "tiktok",
  color: "#000000",
  website: "https://www.tiktok.com",
  docsUrl: "https://developers.tiktok.com",
  authType: "oauth2_pkce",
  oauth: {
    authorizationUrl: "https://www.tiktok.com/v2/auth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token",
    refreshUrl: "https://open.tiktokapis.com/v2/oauth/token",
    scopes: [{ name: "video.list", description: "Read your video content", required: true }],
    pkce: true,
  },
  capabilities: ["read_social", "write_social", "read_analytics"],
  endpoints: [{ id: "content-report", method: "GET", path: "/v2/video/list", dataType: "content", paginated: true }],
  mappings: [
    {
      endpointId: "content-report",
      universalEntity: "content",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "title", sourcePath: "name" },
        { universalField: "type", sourcePath: "status" },
        { universalField: "publishedAt", sourcePath: "date" },
      ],
      transformations: [{ kind: "formatting", field: "publishedAt", formatter: "iso_date" }],
    },
  ],
  healthCheckEndpointId: "content-report",
};

const X_MANIFEST: ConnectorManifest = {
  id: "x",
  name: "X",
  description: "Posts, mentions, and engagement.",
  ...sharedFields(),
  category: "social_media",
  legacyCategory: "social",
  icon: "x",
  color: "#000000",
  website: "https://x.com",
  docsUrl: "https://developer.x.com",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://x.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    refreshUrl: "https://api.x.com/2/oauth2/token",
    scopes: [{ name: "tweet.read", description: "Read your posts", required: true }],
    pkce: true,
  },
  capabilities: ["read_social", "write_social"],
  endpoints: [{ id: "posts-report", method: "GET", path: "/2/users/me/tweets", dataType: "content", paginated: true }],
  mappings: [
    {
      endpointId: "posts-report",
      universalEntity: "content",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "title", sourcePath: "name" },
        { universalField: "type", sourcePath: "status" },
        { universalField: "publishedAt", sourcePath: "date" },
      ],
      transformations: [{ kind: "formatting", field: "publishedAt", formatter: "iso_date" }],
    },
  ],
  healthCheckEndpointId: "posts-report",
};

const SHOPIFY_MANIFEST: ConnectorManifest = {
  id: "shopify",
  name: "Shopify",
  description: "Store orders, products, and customers.",
  ...sharedFields(),
  category: "commerce",
  legacyCategory: "custom",
  icon: "shopify",
  color: "#95BF47",
  website: "https://www.shopify.com",
  docsUrl: "https://shopify.dev",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://accounts.shopify.com/oauth/authorize",
    tokenUrl: "https://accounts.shopify.com/oauth/token",
    refreshUrl: "https://accounts.shopify.com/oauth/token",
    scopes: [{ name: "read_orders", description: "Read store orders", required: true }],
    pkce: false,
  },
  capabilities: ["read_contacts", "write_contacts", "read_reports", "manage_webhooks"],
  endpoints: [{ id: "orders-report", method: "GET", path: "/admin/api/orders.json", dataType: "revenue", paginated: true }],
  mappings: [
    {
      endpointId: "orders-report",
      universalEntity: "revenue",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "amount", sourcePath: "value" },
        { universalField: "currency", sourcePath: "currency", defaultValue: "USD" },
        { universalField: "date", sourcePath: "date" },
        { universalField: "source", sourcePath: "name" },
      ],
      transformations: [
        { kind: "default_value", field: "currency", value: "USD" },
        { kind: "formatting", field: "date", formatter: "iso_date" },
      ],
    },
  ],
  healthCheckEndpointId: "orders-report",
};

const HUBSPOT_MANIFEST: ConnectorManifest = {
  id: "hubspot",
  name: "HubSpot",
  description: "Contacts, deals, and marketing campaigns.",
  ...sharedFields(),
  category: "crm",
  legacyCategory: "crm",
  icon: "hubspot",
  color: "#FF7A59",
  website: "https://www.hubspot.com",
  docsUrl: "https://developers.hubspot.com",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    refreshUrl: "https://api.hubapi.com/oauth/v1/token",
    scopes: [{ name: "crm.objects.contacts.read", description: "Read your contacts", required: true }],
    pkce: false,
  },
  capabilities: ["read_contacts", "write_contacts", "read_campaigns", "read_reports"],
  endpoints: [{ id: "contacts-report", method: "GET", path: "/crm/v3/objects/contacts", dataType: "lead", paginated: true }],
  mappings: [
    {
      endpointId: "contacts-report",
      universalEntity: "lead",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "name", sourcePath: "name" },
        { universalField: "status", sourcePath: "status" },
        { universalField: "source", sourcePath: "name" },
        { universalField: "createdAt", sourcePath: "date" },
      ],
      transformations: [{ kind: "formatting", field: "createdAt", formatter: "iso_date" }],
    },
  ],
  healthCheckEndpointId: "contacts-report",
};

const SALESFORCE_MANIFEST: ConnectorManifest = {
  id: "salesforce",
  name: "Salesforce",
  description: "Leads, opportunities, and customer records.",
  ...sharedFields(),
  category: "crm",
  legacyCategory: "crm",
  icon: "salesforce",
  color: "#00A1E0",
  website: "https://www.salesforce.com",
  docsUrl: "https://developer.salesforce.com",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://login.salesforce.com/services/oauth2/authorize",
    tokenUrl: "https://login.salesforce.com/services/oauth2/token",
    refreshUrl: "https://login.salesforce.com/services/oauth2/token",
    scopes: [{ name: "api", description: "Access your Salesforce data", required: true }],
    pkce: false,
  },
  capabilities: ["read_contacts", "write_contacts", "read_reports"],
  endpoints: [{ id: "leads-report", method: "GET", path: "/services/data/v60.0/sobjects/Lead", dataType: "lead", paginated: true }],
  mappings: [
    {
      endpointId: "leads-report",
      universalEntity: "lead",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "name", sourcePath: "name" },
        { universalField: "status", sourcePath: "status" },
        { universalField: "source", sourcePath: "name" },
        { universalField: "createdAt", sourcePath: "date" },
      ],
      transformations: [{ kind: "formatting", field: "createdAt", formatter: "iso_date" }],
    },
  ],
  healthCheckEndpointId: "leads-report",
};

const MAILCHIMP_MANIFEST: ConnectorManifest = {
  id: "mailchimp",
  name: "Mailchimp",
  description: "Email campaigns, audiences, and performance.",
  ...sharedFields(),
  category: "email",
  legacyCategory: "communication",
  icon: "mailchimp",
  color: "#FFE01B",
  website: "https://mailchimp.com",
  docsUrl: "https://mailchimp.com/developer",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://login.mailchimp.com/oauth2/authorize",
    tokenUrl: "https://login.mailchimp.com/oauth2/token",
    refreshUrl: "https://login.mailchimp.com/oauth2/token",
    scopes: [{ name: "campaigns", description: "Read and send email campaigns", required: true }],
    pkce: false,
  },
  capabilities: ["read_contacts", "write_contacts", "read_campaigns", "write_campaigns", "read_reports"],
  endpoints: [{ id: "campaigns-report", method: "GET", path: "/3.0/campaigns", dataType: "campaign", paginated: true }],
  mappings: [
    {
      endpointId: "campaigns-report",
      universalEntity: "campaign",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "name", sourcePath: "name" },
        { universalField: "status", sourcePath: "status" },
        { universalField: "spend", sourcePath: "value" },
        { universalField: "impressions", sourcePath: "count" },
      ],
      transformations: [{ kind: "formatting", field: "spend", formatter: "round2" }],
    },
  ],
  healthCheckEndpointId: "campaigns-report",
};

const SLACK_MANIFEST: ConnectorManifest = {
  id: "slack",
  name: "Slack",
  description: "Team notifications and shared channels.",
  ...sharedFields(),
  category: "productivity",
  legacyCategory: "communication",
  icon: "slack",
  color: "#4A154B",
  website: "https://slack.com",
  docsUrl: "https://api.slack.com",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    refreshUrl: "https://slack.com/api/oauth.v2.access",
    scopes: [{ name: "channels:read", description: "See your channels", required: true }],
    pkce: false,
  },
  capabilities: ["manage_webhooks", "read_reports"],
  endpoints: [{ id: "messages-report", method: "GET", path: "/api/conversations.history", dataType: "content", paginated: true }],
  mappings: [
    {
      endpointId: "messages-report",
      universalEntity: "content",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "title", sourcePath: "name" },
        { universalField: "type", sourcePath: "status" },
        { universalField: "publishedAt", sourcePath: "date" },
      ],
      transformations: [{ kind: "formatting", field: "publishedAt", formatter: "iso_date" }],
    },
  ],
  healthCheckEndpointId: "messages-report",
};

const NOTION_MANIFEST: ConnectorManifest = {
  id: "notion",
  name: "Notion",
  description: "Docs, wikis, and shared workspaces.",
  ...sharedFields(),
  category: "productivity",
  legacyCategory: "custom",
  icon: "notion",
  color: "#000000",
  website: "https://www.notion.so",
  docsUrl: "https://developers.notion.com",
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    refreshUrl: "https://api.notion.com/v1/oauth/token",
    scopes: [{ name: "read_content", description: "Read your pages", required: true }],
    pkce: false,
  },
  capabilities: ["read_reports", "manage_webhooks"],
  endpoints: [{ id: "pages-report", method: "GET", path: "/v1/search", dataType: "content", paginated: true }],
  mappings: [
    {
      endpointId: "pages-report",
      universalEntity: "content",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "title", sourcePath: "name" },
        { universalField: "type", sourcePath: "status" },
        { universalField: "publishedAt", sourcePath: "date" },
      ],
      transformations: [{ kind: "formatting", field: "publishedAt", formatter: "iso_date" }],
    },
  ],
  healthCheckEndpointId: "pages-report",
};

const ADDITIONAL_MANIFESTS: ConnectorManifest[] = [
  TIKTOK_MANIFEST, X_MANIFEST, SHOPIFY_MANIFEST, HUBSPOT_MANIFEST,
  SALESFORCE_MANIFEST, MAILCHIMP_MANIFEST, SLACK_MANIFEST, NOTION_MANIFEST,
];

let seeded = false;

/** Safe to call more than once. Registers the 8 Marketplace apps not already covered by an existing manifest or Dashboard-seeded provider. */
export function seedAdditionalConnectors(): void {
  if (seeded) return;
  seeded = true;

  for (const manifest of ADDITIONAL_MANIFESTS) {
    if (!connectorManifestRegistry.has(manifest.id)) {
      connectorManifestRegistry.register(manifest);
    }
  }
}

export { ADDITIONAL_MANIFESTS };
