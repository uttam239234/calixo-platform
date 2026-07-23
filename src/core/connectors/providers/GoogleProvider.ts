/**
 * Calixo Platform - Universal Connector Framework: Google Provider Adapter
 *
 * Google is the one provider whose OAuth app covers many distinct,
 * independently-recognizable products (Ads, Analytics, Search Console,
 * Gmail, ...). Per an explicit, disclosed exception to "do not modify the
 * framework" (approved when migrating Settings -> Integrations onto this
 * framework), Google registers ONE `ConnectorDefinition`+`Connector` PER
 * service in `GoogleScopeRegistry`'s `GOOGLE_SERVICE_CATALOG` — not one
 * monolithic "Google" connector — so "Google Ads" and "Google Analytics"
 * can each be installed, connected, and health-checked independently, the
 * way a real integration marketplace presents them.
 *
 * All 11 share the same OAuth mechanics (one Google Cloud OAuth app, one
 * `introspectGoogle()` "who am I" check via Google's real `tokeninfo`
 * endpoint using the ORGANIZATION's own token). `buildAuthorizationUrl()`
 * always requests the platform's full configured scope bundle (whatever
 * the Platform Owner selected in Google Scope Manager) — each product's
 * own `requiredScopes` is a subset used for `validate()`/display, not a
 * narrower per-product OAuth request; Google grants what the platform app
 * is configured for regardless of which specific product connector
 * triggered the flow.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import { GOOGLE_SERVICE_CATALOG, type GoogleServiceId } from "@/core/platform/secrets/oauth/google/GoogleScopeRegistry";
import { GoogleScopeService } from "@/core/platform/secrets/oauth/google/GoogleScopeService";
import type { Connector, ConnectorCapabilityId, ConnectorCategory, ConnectorDefinition, ConnectorFeature } from "../types";

async function introspectGoogle(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      return { ok: false, message: (data.error_description as string) ?? (data.error as string) ?? `HTTP ${response.status}` };
    }
    return { ok: true, connectedAccount: data.email as string | undefined, providerUserId: data.sub as string | undefined, message: "Verified via Google's tokeninfo endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching Google." };
  }
}

interface GoogleProductProfile {
  category: ConnectorCategory;
  features: ConnectorFeature[];
  capabilities: ConnectorCapabilityId[];
  sampleQuestions: string[];
  metrics: string[];
  dimensions: string[];
}

const GOOGLE_PRODUCT_PROFILES: Record<GoogleServiceId, GoogleProductProfile> = {
  "google-ads": {
    category: "advertising",
    features: ["reporting", "campaign-management", "audience-insights"],
    capabilities: ["read", "write", "scheduling", "ai-insights"],
    sampleQuestions: ["Why did ROAS decrease this week?", "Which campaigns are overspending?"],
    metrics: ["spend", "clicks", "impressions", "conversions", "roas"],
    dimensions: ["campaign", "ad_group", "date"],
  },
  "google-analytics": {
    category: "analytics",
    features: ["reporting", "audience-insights"],
    capabilities: ["read", "scheduling", "ai-insights"],
    sampleQuestions: ["Why did organic traffic fall last month?", "Which channels drive the most conversions?"],
    metrics: ["sessions", "users", "conversions", "bounce_rate"],
    dimensions: ["channel", "landing_page", "date"],
  },
  "search-console": {
    category: "search",
    features: ["reporting", "audience-insights"],
    capabilities: ["read", "scheduling", "ai-insights"],
    sampleQuestions: ["Why did search impressions drop?", "Which queries lost ranking this month?"],
    metrics: ["clicks", "impressions", "ctr", "position"],
    dimensions: ["query", "page", "date"],
  },
  "business-profile": {
    category: "search",
    features: ["reporting"],
    capabilities: ["read", "write", "scheduling", "ai-insights"],
    sampleQuestions: ["How did profile views change this month?", "What's our average review rating trend?"],
    metrics: ["profile_views", "calls", "direction_requests", "review_rating"],
    dimensions: ["location", "date"],
  },
  gmail: {
    category: "communication",
    features: ["email-access", "messaging"],
    capabilities: ["read", "write", "ai-insights"],
    sampleQuestions: ["Summarize this week's customer replies.", "Which outreach threads went cold?"],
    metrics: ["messages_received", "messages_sent"],
    dimensions: ["thread", "date"],
  },
  drive: {
    category: "productivity",
    features: ["file-access"],
    capabilities: ["read", "write"],
    sampleQuestions: ["Which shared assets changed this week?"],
    metrics: ["files_changed"],
    dimensions: ["folder", "date"],
  },
  youtube: {
    category: "social",
    features: ["reporting", "content-publishing", "audience-insights"],
    capabilities: ["read", "write", "scheduling", "ai-insights"],
    sampleQuestions: ["Why did watch time drop this week?", "Which videos drove the most subscribers?"],
    metrics: ["views", "watch_time", "subscribers"],
    dimensions: ["video", "date"],
  },
  calendar: {
    category: "productivity",
    features: ["calendar-access"],
    capabilities: ["read", "scheduling"],
    sampleQuestions: ["What's on the marketing team's calendar this week?"],
    metrics: ["events_scheduled"],
    dimensions: ["calendar", "date"],
  },
  sheets: {
    category: "productivity",
    features: ["file-access", "reporting"],
    capabilities: ["read", "write"],
    sampleQuestions: ["Summarize the latest numbers in the shared tracker."],
    metrics: ["rows_updated"],
    dimensions: ["sheet", "date"],
  },
  docs: {
    category: "productivity",
    features: ["file-access", "content-publishing"],
    capabilities: ["read", "write"],
    sampleQuestions: ["What changed in the shared brief this week?"],
    metrics: ["documents_changed"],
    dimensions: ["document", "date"],
  },
  "tag-manager": {
    category: "analytics",
    features: ["reporting"],
    capabilities: ["read", "ai-insights"],
    sampleQuestions: ["Which tags fired most this week?"],
    metrics: ["tags_fired"],
    dimensions: ["tag", "date"],
  },
};

const googleConnectors: Array<{ definition: ConnectorDefinition; connector: Connector }> = GOOGLE_SERVICE_CATALOG.map(service => {
  const profile = GOOGLE_PRODUCT_PROFILES[service.id];
  const definition: ConnectorDefinition = {
    id: service.id,
    provider: "google",
    displayName: service.label,
    category: profile.category,
    icon: "google",
    version: "1.0.0",
    status: "available",
    supportedFeatures: profile.features,
    supportedCapabilities: profile.capabilities,
    requiredOAuthProducts: [service.id],
    requiredScopes: GoogleScopeService.getScopes(service.id),
    supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged"],
    supportsWebhook: false,
    supportsRealtime: false,
    supportsScheduling: profile.capabilities.includes("scheduling"),
    supportsAI: profile.capabilities.includes("ai-insights"),
  };

  const connector = createOAuthConnector({
    provider: "google",
    connectorId: service.id,
    introspect: introspectGoogle,
    capabilities: definition.supportedCapabilities,
    permissions: definition.requiredScopes,
    aiContext: {
      summary: `${service.label} data, once product-data sync is implemented.`,
      availableMetrics: profile.metrics,
      availableDimensions: profile.dimensions,
      sampleQuestions: profile.sampleQuestions,
    },
  });

  return { definition, connector };
});

for (const { definition, connector } of googleConnectors) {
  connectorRegistry.register(definition, connector);
}

export { googleConnectors };
