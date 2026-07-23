/**
 * Calixo Platform - Universal Connector Framework: HubSpot Provider Adapter
 * `validate()`/`health()`/`test()` use HubSpot's real, dedicated
 * access-token introspection endpoint — the token itself is the path
 * parameter (HubSpot's own documented shape), no Bearer header needed.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import type { ConnectorDefinition } from "../types";

async function introspectHubSpot(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch(`https://api.hubapi.com/oauth/v1/access-tokens/${encodeURIComponent(accessToken)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: (data.message as string) ?? `HTTP ${response.status}` };
    return { ok: true, connectedAccount: data.hub_domain as string | undefined, providerUserId: data.user_id ? String(data.user_id) : undefined, message: "Verified via HubSpot's access-token introspection endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching HubSpot." };
  }
}

export const hubspotConnectorDefinition: ConnectorDefinition = {
  id: "hubspot",
  provider: "hubspot",
  displayName: "HubSpot",
  category: "crm",
  icon: "hubspot",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["lead-sync", "reporting"],
  supportedCapabilities: ["read", "write", "webhook", "scheduling", "ai-insights"],
  requiredOAuthProducts: ["HubSpot CRM"],
  requiredScopes: [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged", "WebhookReceived"],
  supportsWebhook: true,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: true,
};

export const hubspotConnector = createOAuthConnector({
  provider: "hubspot",
  connectorId: "hubspot",
  introspect: introspectHubSpot,
  capabilities: hubspotConnectorDefinition.supportedCapabilities,
  permissions: hubspotConnectorDefinition.requiredScopes,
  aiContext: {
    summary: "HubSpot CRM contacts, deals, and pipeline data, once product-data sync is implemented.",
    availableMetrics: ["deal_value", "leads", "conversion_rate"],
    availableDimensions: ["pipeline_stage", "date"],
    sampleQuestions: ["Why did our deal conversion rate drop?"],
  },
});

connectorRegistry.register(hubspotConnectorDefinition, hubspotConnector);
