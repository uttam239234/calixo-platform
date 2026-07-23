/**
 * Calixo Platform - Universal Connector Framework: Salesforce Provider Adapter
 * `validate()`/`health()`/`test()` use Salesforce's real OIDC `/userinfo`
 * endpoint — the organization's own token, never the platform Consumer
 * Secret. Uses the login domain's userinfo endpoint as a real, honest
 * default; a future phase can capture each org's actual `instance_url`
 * (returned in the real token-exchange response) for full precision.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import type { ConnectorDefinition } from "../types";
import type { ProviderEndpointExtras } from "../OAuthManager";

async function introspectSalesforce(accessToken: string, extra?: ProviderEndpointExtras): Promise<IntrospectionResult> {
  const loginUrl = (extra?.loginUrl?.trim() || "https://login.salesforce.com").replace(/\/$/, "");
  try {
    const response = await fetch(`${loginUrl}/services/oauth2/userinfo`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: (data.error_description as string) ?? (data.error as string) ?? `HTTP ${response.status}` };
    return { ok: true, connectedAccount: data.email as string | undefined, providerUserId: data.user_id as string | undefined, message: "Verified via Salesforce's OIDC userinfo endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching Salesforce." };
  }
}

export const salesforceConnectorDefinition: ConnectorDefinition = {
  id: "salesforce",
  provider: "salesforce",
  displayName: "Salesforce",
  category: "crm",
  icon: "salesforce",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["lead-sync", "reporting"],
  supportedCapabilities: ["read", "write", "scheduling", "ai-insights"],
  requiredOAuthProducts: ["Salesforce Connected App"],
  requiredScopes: [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged"],
  supportsWebhook: false,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: true,
};

export const salesforceConnector = createOAuthConnector({
  provider: "salesforce",
  connectorId: "salesforce",
  introspect: introspectSalesforce,
  capabilities: salesforceConnectorDefinition.supportedCapabilities,
  permissions: salesforceConnectorDefinition.requiredScopes,
  aiContext: {
    summary: "Salesforce CRM opportunities and pipeline data, once product-data sync is implemented.",
    availableMetrics: ["opportunity_value", "win_rate"],
    availableDimensions: ["stage", "date"],
    sampleQuestions: ["Why did our win rate change this quarter?"],
  },
  extra: { loginUrl: "https://login.salesforce.com" },
});

connectorRegistry.register(salesforceConnectorDefinition, salesforceConnector);
