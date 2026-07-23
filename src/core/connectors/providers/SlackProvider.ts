/**
 * Calixo Platform - Universal Connector Framework: Slack Provider Adapter
 * `validate()`/`health()`/`test()` use Slack's real `auth.test` API — the
 * organization's own bot/user token, never the platform Client Secret.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import type { ConnectorDefinition } from "../types";

async function introspectSlack(accessToken: string): Promise<IntrospectionResult> {
  try {
    const response = await fetch("https://slack.com/api/auth.test", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!data.ok) return { ok: false, message: (data.error as string) ?? "Slack rejected the token." };
    return { ok: true, connectedAccount: (data.team as string) ?? (data.user as string), providerUserId: data.user_id as string | undefined, message: "Verified via Slack's auth.test endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching Slack." };
  }
}

export const slackConnectorDefinition: ConnectorDefinition = {
  id: "slack",
  provider: "slack",
  displayName: "Slack",
  category: "communication",
  icon: "slack",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["messaging"],
  supportedCapabilities: ["read", "write", "webhook", "realtime"],
  requiredOAuthProducts: ["Slack Workspace"],
  requiredScopes: [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorHealthChanged", "WebhookReceived"],
  supportsWebhook: true,
  supportsRealtime: true,
  supportsScheduling: false,
  supportsAI: false,
};

export const slackConnector = createOAuthConnector({
  provider: "slack",
  connectorId: "slack",
  introspect: introspectSlack,
  capabilities: slackConnectorDefinition.supportedCapabilities,
  permissions: slackConnectorDefinition.requiredScopes,
  aiContext: { summary: "Slack workspace channel activity, once implemented.", availableMetrics: [], availableDimensions: [], sampleQuestions: [] },
});

connectorRegistry.register(slackConnectorDefinition, slackConnector);
