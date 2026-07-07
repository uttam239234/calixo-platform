/**
 * Calixo Platform - Connector Marketplace Catalog
 *
 * Turns registered manifests into the "browse connectors like installing
 * apps" presentation the mandate asks for: category, logo, description,
 * features, requirements, permissions, supported plans, and per-organization
 * install state layered over the real `integrationService`/`connectorRegistry`
 * data — not a separately-authored, driftable list.
 */
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/core/platform/subscription";
import { connectorManifestRegistry } from "./ConnectorManifestRegistry";
import { integrationService } from "@/integrations/services/IntegrationService";
import { connectorHealthEngine } from "./ConnectorHealthEngine";
import type { ConnectorCategory, ConnectorMarketplaceListing, InstallState, MarketplaceListingWithState } from "./types";

function supportedPlansFrom(minPlan: string): string[] {
  const idx = SUBSCRIPTION_TIERS.indexOf(minPlan as SubscriptionTier);
  return idx === -1 ? [minPlan] : SUBSCRIPTION_TIERS.slice(idx);
}

export class MarketplaceCatalog {
  listing(providerId: string): ConnectorMarketplaceListing | undefined {
    const manifest = connectorManifestRegistry.get(providerId);
    if (!manifest) return undefined;
    return {
      providerId: manifest.id,
      name: manifest.name,
      category: manifest.category,
      logo: manifest.icon,
      description: manifest.description,
      features: manifest.capabilities,
      requirements: manifest.configFields.filter(f => f.required).map(f => f.label),
      permissions: manifest.capabilities,
      supportedPlans: supportedPlansFrom(manifest.minPlan),
      isBeta: manifest.isBeta,
      installCount: 0,
    };
  }

  browse(category?: ConnectorCategory): ConnectorMarketplaceListing[] {
    return connectorManifestRegistry.getAll()
      .filter(m => !category || m.category === category)
      .map(m => this.listing(m.id)!)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  categories(): ConnectorCategory[] {
    return Array.from(new Set(connectorManifestRegistry.getAll().map(m => m.category))).sort();
  }

  async browseForOrganization(organizationId: string, category?: ConnectorCategory): Promise<MarketplaceListingWithState[]> {
    const connections = await integrationService.getConnections(organizationId);
    const listings = this.browse(category);

    return Promise.all(listings.map(async listing => {
      const connection = connections.find(c => c.providerId === listing.providerId);
      let installState: InstallState = "not_installed";
      if (connection) {
        if (connection.status === "connected") installState = "installed";
        else if (connection.status === "pending" || connection.status === "connecting") installState = "installing";
        else if (connection.status === "expired") installState = "needs_reauth";
        else if (connection.status === "error") installState = "error";
      }

      const health = connection ? await connectorHealthEngine.computeScore(connection, connection.id) : undefined;
      return { ...listing, installState, connectionId: connection?.id, health };
    }));
  }

  count(): number {
    return connectorManifestRegistry.count();
  }
}

export const marketplaceCatalog = new MarketplaceCatalog();
