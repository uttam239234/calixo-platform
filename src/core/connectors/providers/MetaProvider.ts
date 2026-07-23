/**
 * Calixo Platform - Universal Connector Framework: Meta Provider Adapter
 * `validate()`/`health()`/`test()` use Meta's real `/me` Graph API call —
 * the organization's own token, never the platform App Secret.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import { getOAuthProviderDefinition } from "@/core/platform/secrets/oauth";
import type { ConnectorDefinition } from "../types";

async function introspectMeta(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      const error = data.error as { message?: string } | undefined;
      return { ok: false, message: error?.message ?? `HTTP ${response.status}` };
    }
    return { ok: true, connectedAccount: data.name as string | undefined, providerUserId: data.id as string | undefined, message: "Verified via Meta's Graph API /me endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching Meta." };
  }
}

const oauthDef = getOAuthProviderDefinition("meta");

export const metaConnectorDefinition: ConnectorDefinition = {
  id: "meta",
  provider: "meta",
  displayName: "Meta",
  category: "advertising",
  icon: "meta",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["reporting", "campaign-management", "audience-insights", "content-publishing"],
  supportedCapabilities: ["read", "write", "webhook", "scheduling", "ai-insights"],
  requiredOAuthProducts: oauthDef?.connectors ?? [],
  requiredScopes: oauthDef?.defaultScopes ?? [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged", "WebhookReceived"],
  supportsWebhook: true,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: true,
};

export const metaConnector = createOAuthConnector({
  provider: "meta",
  connectorId: "meta",
  introspect: introspectMeta,
  capabilities: metaConnectorDefinition.supportedCapabilities,
  permissions: metaConnectorDefinition.requiredScopes,
  aiContext: {
    summary: "Meta Ads, Facebook Pages, and Instagram Business data, once product-data sync is implemented.",
    availableMetrics: ["spend", "leads", "reach", "ctr"],
    availableDimensions: ["ad_creative", "campaign", "date", "placement"],
    sampleQuestions: ["Which creative generated the most leads?", "Why did CPL increase this week?"],
  },
});

connectorRegistry.register(metaConnectorDefinition, metaConnector);
