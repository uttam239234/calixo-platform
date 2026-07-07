/**
 * Calixo Platform - Developer Platform API
 *
 * The Developer Portal's backend: API keys (real, via `ApiKeyService`),
 * OAuth apps (real registration via the Access Platform's
 * `apiClientRegistry`, Track 1 Phase 3), and webhooks — reusing the
 * Integration Platform's `webhookPlatformAPI` (Track 1 Phase 5) exactly as
 * the mandate requires ("Reuse existing Integration Platform"), addressed
 * by organization rather than by connector connection since a developer's
 * webhook subscribes to platform/API events, not one specific connector.
 */
import { apiKeyService } from "./ApiKeyService";
import { apiClientRegistry } from "../access/apiAuth/ApiClientRegistry";
import type { ApiKeyDefinition, OAuthClientDefinition } from "../access/apiAuth/types";
import { webhookPlatformAPI } from "../connectors/WebhookPlatformAPI";
import type { WebhookConfig, WebhookEvent } from "@/integrations/types";
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "../events/PlatformEventBus";
import type { IssuedApiKey } from "./types";

export class DeveloperPlatformAPI {
  // --- API Keys (Layer 1: "Generate API Key, Copy, Done") ---
  createApiKey(organizationId: string, name: string, scopes: string[] = ["*"]): Promise<IssuedApiKey> {
    return apiKeyService.issue(organizationId, name, scopes);
  }

  listApiKeys(organizationId: string): ApiKeyDefinition[] {
    return apiKeyService.listForOrganization(organizationId);
  }

  revokeApiKey(apiKeyId: string, organizationId: string): Promise<boolean> {
    return apiKeyService.revoke(apiKeyId, organizationId);
  }

  // --- OAuth Apps (Layer 2) ---
  async registerOAuthApp(organizationId: string, name: string, redirectUris: string[], scopes: string[]): Promise<OAuthClientDefinition> {
    const client: OAuthClientDefinition = {
      id: generateId(16),
      organizationId,
      name,
      redirectUris,
      scopes,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    apiClientRegistry.registerOAuthClient(client);
    await platformEventBus.publish({ type: "OAuthAppRegistered", organizationId, payload: { clientId: client.id, name } });
    return client;
  }

  getOAuthApp(id: string): OAuthClientDefinition | undefined {
    return apiClientRegistry.getOAuthClient(id);
  }

  // --- Webhooks (reuses the Integration Platform's Webhook Platform, Track 1 Phase 5) ---
  registerWebhook(organizationId: string, config: Omit<WebhookConfig, "id" | "createdAt" | "updatedAt" | "connectionId">): Promise<WebhookConfig> {
    return webhookPlatformAPI.register(organizationId, { ...config, connectionId: organizationId });
  }

  listWebhooks(organizationId: string): Promise<WebhookConfig[]> {
    return webhookPlatformAPI.getWebhooks(organizationId);
  }

  receiveWebhook(webhookId: string, event: WebhookEvent, payload: unknown, signature: string, secret: string) {
    return webhookPlatformAPI.receive(webhookId, event, payload, signature, secret);
  }
}

export const developerPlatformAPI = new DeveloperPlatformAPI();
