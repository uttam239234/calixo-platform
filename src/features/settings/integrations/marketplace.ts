/**
 * Calixo Platform - Integrations "Connected Apps Center": Marketplace Listings
 *
 * `MarketplaceCatalog` only lists registered manifests (9: Google Analytics
 * + the 8 apps `additionalConnectors.ts` registers) — the 5 Dashboard-demo
 * providers (Google Ads, Meta, Instagram, LinkedIn, YouTube) were
 * deliberately left as bare `ProviderDefinition`s (see
 * `additionalConnectors.ts`'s header) and so are invisible to it. This
 * merges both real sources into one list so the brief's 14-app Marketplace
 * grid is complete, without registering anything that would collide with
 * Ads Manager/Social Media's live-connector detection.
 */
import { connectorRegistry } from "@/integrations/registry/ConnectorRegistry";
import { connectorMarketplaceAPI, connectorHealthEngine, connectorPlatformAPI } from "@/core/platform/connectors";
import type { ConnectorCategory, ConnectorHealthScore, InstallState } from "@/core/platform/connectors";
import type { ProviderCapability } from "@/integrations/types";
import { LEGACY_PROVIDER_CATEGORY } from "./constants";

export interface AppListing {
  providerId: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  capabilities: ProviderCapability[];
  isBeta: boolean;
  installState: InstallState;
  connectionId?: string;
  health?: ConnectorHealthScore;
}

export async function getMarketplaceListings(organizationId: string): Promise<AppListing[]> {
  const manifestListings = await connectorMarketplaceAPI.browseForOrganization(organizationId);
  const manifestIds = new Set(manifestListings.map(l => l.providerId));

  const connections = await connectorPlatformAPI.getConnections(organizationId);
  const connectionByProvider = new Map(connections.map(c => [c.providerId, c]));

  const legacyListings: AppListing[] = [];
  for (const [providerId, category] of Object.entries(LEGACY_PROVIDER_CATEGORY)) {
    if (manifestIds.has(providerId)) continue;
    const definition = connectorRegistry.getDefinition(providerId);
    if (!definition) continue;

    const connection = connectionByProvider.get(providerId);
    let installState: InstallState = "not_installed";
    if (connection) {
      if (connection.status === "connected") installState = "installed";
      else if (connection.status === "pending" || connection.status === "connecting") installState = "installing";
      else if (connection.status === "expired") installState = "needs_reauth";
      else if (connection.status === "error") installState = "error";
    }
    const health = connection ? await connectorHealthEngine.computeScore(connection, connection.id) : undefined;

    legacyListings.push({
      providerId,
      name: definition.name,
      description: definition.description,
      category,
      capabilities: definition.capabilities,
      isBeta: definition.metadata.isBeta,
      installState,
      connectionId: connection?.id,
      health,
    });
  }

  const manifestListingsMapped: AppListing[] = manifestListings.map(l => ({
    providerId: l.providerId,
    name: l.name,
    description: l.description,
    category: l.category,
    capabilities: l.features as ProviderCapability[],
    isBeta: l.isBeta,
    installState: l.installState,
    connectionId: l.connectionId,
    health: l.health,
  }));

  return [...manifestListingsMapped, ...legacyListings].sort((a, b) => a.name.localeCompare(b.name));
}
