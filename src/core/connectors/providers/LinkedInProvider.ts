/**
 * Calixo Platform - Universal Connector Framework: LinkedIn Provider Adapter
 * `validate()`/`health()`/`test()` use LinkedIn's real OIDC `/userinfo`
 * endpoint — the organization's own token, never the platform secret.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import { getOAuthProviderDefinition } from "@/core/platform/secrets/oauth";
import type { ConnectorDefinition } from "../types";

async function introspectLinkedIn(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: (data.message as string) ?? `HTTP ${response.status}` };
    return { ok: true, connectedAccount: data.name as string | undefined, providerUserId: data.sub as string | undefined, message: "Verified via LinkedIn's userinfo endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching LinkedIn." };
  }
}

const oauthDef = getOAuthProviderDefinition("linkedin");

export const linkedinConnectorDefinition: ConnectorDefinition = {
  id: "linkedin",
  provider: "linkedin",
  displayName: "LinkedIn",
  category: "social",
  icon: "linkedin",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["reporting", "campaign-management", "content-publishing", "lead-sync"],
  supportedCapabilities: ["read", "write", "scheduling", "ai-insights"],
  requiredOAuthProducts: oauthDef?.connectors ?? [],
  requiredScopes: oauthDef?.defaultScopes ?? [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged"],
  supportsWebhook: false,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: true,
};

export const linkedinConnector = createOAuthConnector({
  provider: "linkedin",
  connectorId: "linkedin",
  introspect: introspectLinkedIn,
  capabilities: linkedinConnectorDefinition.supportedCapabilities,
  permissions: linkedinConnectorDefinition.requiredScopes,
  aiContext: {
    summary: "LinkedIn organization posts and ad campaign data, once product-data sync is implemented.",
    availableMetrics: ["impressions", "engagement", "leads"],
    availableDimensions: ["post", "campaign", "date"],
    sampleQuestions: ["Which post drove the most engagement?", "Why did lead volume drop this month?"],
  },
});

connectorRegistry.register(linkedinConnectorDefinition, linkedinConnector);
