/** Calixo Platform - SSO/SCIM Extension Points (architecture only — no provider integrations, per the mandate). */

export type SsoProtocol = "saml" | "oidc" | "ldap";

export type SsoProviderKind = "generic-saml" | "generic-oidc" | "active-directory" | "azure-ad" | "google-workspace" | "okta";

export interface SsoConnectionConfig {
  id: string;
  organizationId: string;
  kind: SsoProviderKind;
  protocol: SsoProtocol;
  displayName: string;
  isEnabled: boolean;
  /** Provider-specific config placeholders (issuer URL, entity ID, ...) — no real secrets/values wired this phase. */
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ScimConfig {
  id: string;
  organizationId: string;
  isEnabled: boolean;
  baseUrl?: string;
}

/** The contract a real connector (built in a future phase) implements. Nothing in this phase implements it. */
export interface SsoProviderConnector {
  kind: SsoProviderKind;
  getAuthorizationUrl(config: SsoConnectionConfig, state: string): string;
  handleCallback(config: SsoConnectionConfig, params: Record<string, string>): Promise<{ email: string; name: string }>;
}
