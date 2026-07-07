import type { ApiKeyDefinition, OAuthClientDefinition, ServiceAccount } from "./types";

/** Real registration/scope-check mechanics; zero real key issuance, HTTP layer, or crypto — the same "solid skeleton, no live provider" pattern as the SSO/MFA extension points. */
export class ApiClientRegistry {
  private apiKeys = new Map<string, ApiKeyDefinition>();
  private serviceAccounts = new Map<string, ServiceAccount>();
  private oauthClients = new Map<string, OAuthClientDefinition>();

  registerApiKey(definition: ApiKeyDefinition): void {
    this.apiKeys.set(definition.id, definition);
  }

  getApiKey(id: string): ApiKeyDefinition | undefined {
    return this.apiKeys.get(id);
  }

  revokeApiKey(id: string): boolean {
    const key = this.apiKeys.get(id);
    if (!key) return false;
    key.isActive = false;
    return true;
  }

  listApiKeysForOrganization(organizationId: string): ApiKeyDefinition[] {
    return Array.from(this.apiKeys.values()).filter(k => k.organizationId === organizationId);
  }

  /** Whether an API key's granted scopes cover a requested matrix permission (e.g. `"report:export"`) — real scope-checking, no real request-signing/verification. */
  apiKeyHasScope(apiKeyId: string, permission: string): boolean {
    const key = this.apiKeys.get(apiKeyId);
    if (!key || !key.isActive) return false;
    return key.scopes.includes("*") || key.scopes.includes(permission);
  }

  registerServiceAccount(account: ServiceAccount): void {
    this.serviceAccounts.set(account.id, account);
  }

  getServiceAccount(id: string): ServiceAccount | undefined {
    return this.serviceAccounts.get(id);
  }

  registerOAuthClient(client: OAuthClientDefinition): void {
    this.oauthClients.set(client.id, client);
  }

  getOAuthClient(id: string): OAuthClientDefinition | undefined {
    return this.oauthClients.get(id);
  }

  count(): number {
    return this.apiKeys.size + this.serviceAccounts.size + this.oauthClients.size;
  }
}

export const apiClientRegistry = new ApiClientRegistry();
