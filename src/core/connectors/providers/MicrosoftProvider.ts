/**
 * Calixo Platform - Universal Connector Framework: Microsoft Provider Adapter
 * `validate()`/`health()`/`test()` use Microsoft Graph's real `/me`
 * endpoint — the organization's own token, never the platform secret.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import { getOAuthProviderDefinition } from "@/core/platform/secrets/oauth";
import type { ConnectorDefinition } from "../types";

async function introspectMicrosoft(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = data.error as { message?: string } | undefined;
      return { ok: false, message: error?.message ?? `HTTP ${response.status}` };
    }
    return { ok: true, connectedAccount: (data.mail as string) ?? (data.userPrincipalName as string), providerUserId: data.id as string | undefined, message: "Verified via Microsoft Graph's /me endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching Microsoft Graph." };
  }
}

const oauthDef = getOAuthProviderDefinition("microsoft");

export const microsoftConnectorDefinition: ConnectorDefinition = {
  id: "microsoft",
  provider: "microsoft",
  displayName: "Microsoft",
  category: "productivity",
  icon: "microsoft",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["email-access", "calendar-access", "file-access"],
  supportedCapabilities: ["read", "write", "scheduling"],
  requiredOAuthProducts: oauthDef?.connectors ?? [],
  requiredScopes: oauthDef?.defaultScopes ?? [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged"],
  supportsWebhook: false,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: false,
};

export const microsoftConnector = createOAuthConnector({
  provider: "microsoft",
  connectorId: "microsoft",
  introspect: introspectMicrosoft,
  capabilities: microsoftConnectorDefinition.supportedCapabilities,
  permissions: microsoftConnectorDefinition.requiredScopes,
  aiContext: {
    summary: "Outlook mail and calendar data, once product-data sync is implemented.",
    availableMetrics: [],
    availableDimensions: [],
    sampleQuestions: [],
  },
  extra: { tenantId: "common" },
});

connectorRegistry.register(microsoftConnectorDefinition, microsoftConnector);
