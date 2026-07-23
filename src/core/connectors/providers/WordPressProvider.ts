/**
 * Calixo Platform - Universal Connector Framework: WordPress Provider Adapter
 * `validate()`/`health()`/`test()` use WordPress.com's real `/me` REST
 * endpoint — the organization's own token, never the platform secret.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import type { ConnectorDefinition } from "../types";

async function introspectWordPress(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch("https://public-api.wordpress.com/rest/v1.1/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: (data.message as string) ?? `HTTP ${response.status}` };
    return { ok: true, connectedAccount: data.username as string | undefined, providerUserId: data.ID ? String(data.ID) : undefined, message: "Verified via WordPress.com's /me endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching WordPress.com." };
  }
}

export const wordpressConnectorDefinition: ConnectorDefinition = {
  id: "wordpress",
  provider: "wordpress",
  displayName: "WordPress",
  category: "cms",
  icon: "wordpress",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["content-publishing"],
  supportedCapabilities: ["read", "write", "scheduling"],
  requiredOAuthProducts: ["WordPress.com Site"],
  requiredScopes: [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged"],
  supportsWebhook: false,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: false,
};

export const wordpressConnector = createOAuthConnector({
  provider: "wordpress",
  connectorId: "wordpress",
  introspect: introspectWordPress,
  capabilities: wordpressConnectorDefinition.supportedCapabilities,
  permissions: wordpressConnectorDefinition.requiredScopes,
  aiContext: { summary: "WordPress site content and publishing data, once implemented.", availableMetrics: [], availableDimensions: [], sampleQuestions: [] },
});

connectorRegistry.register(wordpressConnectorDefinition, wordpressConnector);
