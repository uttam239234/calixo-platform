/**
 * Calixo Platform - Universal Connector Framework: Connector Registry
 *
 * Every connector registers itself here: a static `ConnectorDefinition`
 * (id/provider/displayName/category/icon/version/status/capabilities/
 * required OAuth products & scopes/supported events/webhook/realtime/
 * scheduling/AI flags) plus the real `Connector` implementation (the
 * lifecycle methods). A global, in-memory, fixed-size catalog — this is
 * the SAME shape every other Platform-level registry in this codebase uses
 * (`OAuthApplicationRegistry`, `PlatformSecretsRegistry`) and is safe at
 * that size (9 providers today, 100+ eventually — still tiny next to
 * per-organization data, which is why THAT data lives in
 * `persistence/ConnectorDataStore.ts` instead of here).
 */
import type { Connector, ConnectorCapability, ConnectorDefinition, ConnectorProviderId } from "./types";

class UniversalConnectorRegistry {
  private definitions = new Map<string, ConnectorDefinition>();
  private connectors = new Map<string, Connector>();

  register(definition: ConnectorDefinition, connector: Connector): void {
    this.definitions.set(definition.id, definition);
    this.connectors.set(definition.id, connector);
  }

  unregister(id: string): void {
    this.definitions.delete(id);
    this.connectors.delete(id);
  }

  getDefinition(id: string): ConnectorDefinition | undefined {
    return this.definitions.get(id);
  }

  getConnector(id: string): Connector | undefined {
    return this.connectors.get(id);
  }

  getDefinitionByProvider(provider: ConnectorProviderId): ConnectorDefinition | undefined {
    return Array.from(this.definitions.values()).find(d => d.provider === provider);
  }

  getConnectorByProvider(provider: ConnectorProviderId): Connector | undefined {
    const def = this.getDefinitionByProvider(provider);
    return def ? this.connectors.get(def.id) : undefined;
  }

  list(): ConnectorDefinition[] {
    return Array.from(this.definitions.values());
  }

  listByCategory(category: ConnectorDefinition["category"]): ConnectorDefinition[] {
    return this.list().filter(d => d.category === category);
  }

  has(id: string): boolean {
    return this.definitions.has(id);
  }

  /** Flattened `ConnectorCapability` rows for every registered connector — the shape Diagnostics and a future Connector Marketplace both want, derived (not separately stored) from each definition's `supportedCapabilities`. */
  getCapabilityMatrix(): ConnectorCapability[] {
    const rows: ConnectorCapability[] = [];
    const allCapabilities: ConnectorCapability["capability"][] = ["read", "write", "webhook", "realtime", "scheduling", "ai-insights"];
    for (const def of this.list()) {
      for (const capability of allCapabilities) {
        rows.push({ connectorId: def.id, capability, supported: def.supportedCapabilities.includes(capability) });
      }
    }
    return rows;
  }
}

export const connectorRegistry = new UniversalConnectorRegistry();
export { UniversalConnectorRegistry };
