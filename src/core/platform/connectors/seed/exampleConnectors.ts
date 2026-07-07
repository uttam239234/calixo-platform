/**
 * Calixo Platform - Example Manifest-Driven Connectors
 *
 * Proves the Developer SDK end-to-end: a real connector authored ENTIRELY
 * as a manifest (no bespoke `ProviderConnector` class, no platform code
 * changes) that genuinely OAuths, syncs, normalizes, transforms, and
 * persists through the full pipeline. Opt-in, idempotent — not
 * auto-registered into the Dashboard's existing `seedDashboardConnections`
 * (that seed's 5 demo providers are Dashboard-specific and left untouched).
 */
import { connectorManifestRegistry } from "../ConnectorManifestRegistry";
import type { ConnectorManifest } from "../types";

const GOOGLE_ANALYTICS_MANIFEST: ConnectorManifest = {
  id: "google-analytics-manifest",
  name: "Google Analytics",
  description: "Website traffic and conversion analytics.",
  version: "1.0.0",
  category: "analytics",
  legacyCategory: "analytics",
  icon: "google-analytics",
  color: "#F9AB00",
  website: "https://analytics.google.com",
  docsUrl: "https://developers.google.com/analytics",
  isBeta: false,
  minPlan: "starter",
  authType: "oauth2_pkce",
  oauth: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    refreshUrl: "https://oauth2.googleapis.com/token",
    scopes: [{ name: "https://www.googleapis.com/auth/analytics.readonly", description: "Read analytics data", required: true }],
    pkce: true,
  },
  capabilities: ["read_analytics"],
  configFields: [
    { key: "propertyId", label: "GA4 Property ID", type: "text", required: true, helpText: "Found in Google Analytics Admin settings." },
  ],
  endpoints: [
    { id: "traffic-report", method: "GET", path: "/v1/properties/{propertyId}:runReport", dataType: "analytics", paginated: false },
    { id: "revenue-report", method: "GET", path: "/v1/properties/{propertyId}:runReport", dataType: "analytics", paginated: false },
  ],
  mappings: [
    {
      endpointId: "traffic-report",
      universalEntity: "traffic",
      fields: [
        { universalField: "externalId", sourcePath: "id" },
        { universalField: "sessions", sourcePath: "count" },
        { universalField: "pageViews", sourcePath: "count" },
        { universalField: "users", sourcePath: "count" },
        { universalField: "channel", sourcePath: "name" },
        { universalField: "date", sourcePath: "date" },
      ],
      // Scoped to traffic records only — an earlier version of this manifest
      // put this filter in a manifest-wide `transformations` list, which
      // silently zeroed out every revenue record too (`sessions` resolves to
      // `undefined` on a revenue record, and `undefined >= 0` is `false`).
      // Found via live end-to-end testing; fixed by scoping transformations
      // per-mapping (see `NormalizationMapping.transformations` in types.ts).
      transformations: [
        { kind: "formatting", field: "date", formatter: "iso_date" },
        { kind: "filter", field: "sessions", expression: "sessions >= 0" },
      ],
    },
    {
      endpointId: "revenue-report",
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
        { kind: "calculated_field", field: "amountRounded", expression: "amount" },
        { kind: "formatting", field: "amountRounded", formatter: "round2" },
      ],
    },
  ],
  supportedSyncFrequencies: ["hourly", "daily", "manual"],
  supportedWebhookEvents: [],
  healthCheckEndpointId: "traffic-report",
};

let seeded = false;

/** Safe to call more than once. Registers one real, manifest-driven example connector. */
export function seedExampleConnectors(): void {
  if (seeded) return;
  seeded = true;

  if (!connectorManifestRegistry.has(GOOGLE_ANALYTICS_MANIFEST.id)) {
    connectorManifestRegistry.register(GOOGLE_ANALYTICS_MANIFEST);
  }
}

export { GOOGLE_ANALYTICS_MANIFEST };
