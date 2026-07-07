/**
 * Calixo Platform - Connector Manifest Registry
 *
 * The Developer SDK's authoring-side catalog: register a manifest here and
 * it is automatically turned into a real `ConnectorRegistration` and
 * registered into the pre-existing `connectorRegistry` (`src/integrations`)
 * — the actual runtime registry `IntegrationService`/`OAuthService`/
 * `SyncService` already know how to use. No platform code changes are
 * required to add a new connector.
 */
import { appLogger } from "@/logging";
import { connectorRegistry } from "@/integrations/registry/ConnectorRegistry";
import { defineConnector, type DefineConnectorOptions } from "./ConnectorFactory";
import type { ConnectorManifest } from "./types";

export class ConnectorManifestRegistry {
  private manifests = new Map<string, ConnectorManifest>();

  register(manifest: ConnectorManifest, options: DefineConnectorOptions = {}): void {
    if (this.manifests.has(manifest.id)) {
      appLogger.warn("ConnectorManifestRegistry", `Manifest ${manifest.id} already registered, skipping`);
      return;
    }
    this.manifests.set(manifest.id, manifest);

    const registration = defineConnector(manifest, options);
    connectorRegistry.register({ provider: registration.provider, createConnector: registration.createConnector });

    appLogger.info("ConnectorManifestRegistry", `Manifest registered: ${manifest.name} (${manifest.id})`);
  }

  get(providerId: string): ConnectorManifest | undefined {
    return this.manifests.get(providerId);
  }

  getAll(): ConnectorManifest[] {
    return Array.from(this.manifests.values());
  }

  has(providerId: string): boolean {
    return this.manifests.has(providerId);
  }

  count(): number {
    return this.manifests.size;
  }
}

export const connectorManifestRegistry = new ConnectorManifestRegistry();
