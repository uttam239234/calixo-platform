import type { ScimConfig, SsoConnectionConfig, SsoProviderConnector, SsoProviderKind } from "./types";

/** Real registration/lookup mechanics; zero real SAML/OIDC/LDAP handshake logic — the same "solid skeleton, no live provider" honesty as the Connector Platform. */
export class SsoProviderRegistry {
  private connections = new Map<string, SsoConnectionConfig>();
  private scimConfigs = new Map<string, ScimConfig>();
  private connectors = new Map<SsoProviderKind, SsoProviderConnector>();

  registerConnection(config: SsoConnectionConfig): void {
    this.connections.set(config.id, config);
  }

  getConnectionsForOrganization(organizationId: string): SsoConnectionConfig[] {
    return Array.from(this.connections.values()).filter(c => c.organizationId === organizationId);
  }

  registerScimConfig(config: ScimConfig): void {
    this.scimConfigs.set(config.organizationId, config);
  }

  getScimConfig(organizationId: string): ScimConfig | undefined {
    return this.scimConfigs.get(organizationId);
  }

  /** A real connector implementation registers itself here in a future phase — nothing does today. */
  registerConnector(connector: SsoProviderConnector): void {
    this.connectors.set(connector.kind, connector);
  }

  isConnectorReady(kind: SsoProviderKind): boolean {
    return this.connectors.has(kind);
  }

  getConnector(kind: SsoProviderKind): SsoProviderConnector | undefined {
    return this.connectors.get(kind);
  }

  count(): number {
    return this.connections.size;
  }
}

export const ssoProviderRegistry = new SsoProviderRegistry();
