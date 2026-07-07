/**
 * Calixo Platform - Connector Marketplace API
 *
 * Browse-like-installing-an-app (§2) + the same 10-step wizard every
 * connector uses (§4) — wraps `MarketplaceCatalog` and
 * `ConnectorWizardEngine`.
 */
import { marketplaceCatalog } from "./MarketplaceCatalog";
import { connectorWizardEngine } from "./ConnectorWizardEngine";
import type { ConnectorCategory, ConnectorMarketplaceListing, MarketplaceListingWithState, WizardState } from "./types";

export class ConnectorMarketplaceAPI {
  browse(category?: ConnectorCategory): ConnectorMarketplaceListing[] {
    return marketplaceCatalog.browse(category);
  }

  browseForOrganization(organizationId: string, category?: ConnectorCategory): Promise<MarketplaceListingWithState[]> {
    return marketplaceCatalog.browseForOrganization(organizationId, category);
  }

  categories(): ConnectorCategory[] {
    return marketplaceCatalog.categories();
  }

  listing(providerId: string): ConnectorMarketplaceListing | undefined {
    return marketplaceCatalog.listing(providerId);
  }

  startInstallWizard(providerId: string, organizationId: string): WizardState {
    return connectorWizardEngine.start(providerId, organizationId);
  }

  nextWizardStep(wizardId: string, input?: Partial<WizardState["selections"]>): Promise<WizardState> {
    return connectorWizardEngine.next(wizardId, input);
  }

  previousWizardStep(wizardId: string): WizardState {
    return connectorWizardEngine.back(wizardId);
  }

  getWizardState(wizardId: string): WizardState {
    return connectorWizardEngine.getState(wizardId);
  }
}

export const connectorMarketplaceAPI = new ConnectorMarketplaceAPI();
