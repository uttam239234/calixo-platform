/**
 * Calixo Platform - Connector Registry
 * 
 * Central registry for all integration providers.
 * Providers register themselves and the registry manages their lifecycle.
 */

import { appLogger } from '@/logging';
import type { ProviderId, ProviderDefinition, ProviderConnector, ConnectorRegistration, ConnectorRegistry, ProviderCategory } from '@/integrations/types';

export class IntegrationConnectorRegistry implements ConnectorRegistry {
  private connectors: Map<ProviderId, ProviderConnector> = new Map();
  private definitions: Map<ProviderId, ProviderDefinition> = new Map();
  private factories: Map<ProviderId, () => ProviderConnector> = new Map();

  register(registration: ConnectorRegistration): void {
    const { provider, createConnector } = registration;
    
    if (this.definitions.has(provider.id)) {
      appLogger.warn('ConnectorRegistry', `Provider ${provider.id} already registered, skipping`);
      return;
    }

    this.definitions.set(provider.id, provider);
    this.factories.set(provider.id, createConnector);
    
    appLogger.info('ConnectorRegistry', `Provider registered: ${provider.name} (${provider.id})`);
  }

  unregister(providerId: ProviderId): void {
    this.connectors.delete(providerId);
    this.definitions.delete(providerId);
    this.factories.delete(providerId);
    appLogger.info('ConnectorRegistry', `Provider unregistered: ${providerId}`);
  }

  get(providerId: ProviderId): ProviderConnector | undefined {
    // Return cached connector or create one
    if (!this.connectors.has(providerId)) {
      const factory = this.factories.get(providerId);
      if (factory) {
        this.connectors.set(providerId, factory());
      }
    }
    return this.connectors.get(providerId);
  }

  getDefinition(providerId: ProviderId): ProviderDefinition | undefined {
    return this.definitions.get(providerId);
  }

  getAll(): ProviderDefinition[] {
    return Array.from(this.definitions.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getByCategory(category: ProviderCategory): ProviderDefinition[] {
    return this.getAll().filter(p => p.category === category);
  }

  has(providerId: ProviderId): boolean {
    return this.definitions.has(providerId);
  }

  getConnectorCount(): number {
    return this.definitions.size;
  }

  clear(): void {
    this.connectors.clear();
    this.definitions.clear();
    this.factories.clear();
    appLogger.info('ConnectorRegistry', 'Registry cleared');
  }
}

export const connectorRegistry = new IntegrationConnectorRegistry();