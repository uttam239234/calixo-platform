/**
 * Calixo Platform - Integrations "Connected Apps Center": Marketplace Listings
 *
 * Every entry comes from the real Universal Connector Framework's
 * `connectorFrameworkAPI.listDefinitions()` (org-agnostic — "what CAN be
 * installed") cross-referenced against `listInstances()` ("what IS
 * installed for this org"), plus a small static "Coming Soon" list for
 * providers with no real adapter yet (`PLANNED_CONNECTORS`) — never a
 * fake/demo connector standing in for one.
 */
import { listConnectorDefinitionsAction, listConnectorInstancesAction } from "@/core/connectors/actions";
import type { ConnectorCategory, ConnectorFeature } from "@/core/connectors/types";
import { CONNECTOR_DESCRIPTIONS, PLANNED_CONNECTORS } from "./constants";

export type AppInstallState = "not_installed" | "installed" | "needs_attention" | "coming_soon";

export interface AppListing {
  connectorId: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  features: ConnectorFeature[];
  isComingSoon: boolean;
  installState: AppInstallState;
  connectorInstanceId?: string;
}

export async function getMarketplaceListings(): Promise<AppListing[]> {
  const [definitions, instances] = await Promise.all([listConnectorDefinitionsAction(), listConnectorInstancesAction()]);
  const instanceByConnectorId = new Map(instances.map(i => [i.connectorId, i]));

  const real: AppListing[] = definitions.map(def => {
    const instance = instanceByConnectorId.get(def.id);
    let installState: AppInstallState = "not_installed";
    if (instance) {
      if (instance.status === "active") installState = "installed";
      else if (instance.status === "error") installState = "needs_attention";
    }
    return {
      connectorId: def.id,
      name: def.displayName,
      description: CONNECTOR_DESCRIPTIONS[def.id] ?? def.displayName,
      category: def.category,
      features: def.supportedFeatures,
      isComingSoon: false,
      installState,
      connectorInstanceId: instance?.id,
    };
  });

  const comingSoon: AppListing[] = PLANNED_CONNECTORS.map(p => ({
    connectorId: p.id,
    name: p.displayName,
    description: CONNECTOR_DESCRIPTIONS[p.id] ?? p.displayName,
    category: p.category,
    features: [],
    isComingSoon: true,
    installState: "coming_soon",
  }));

  return [...real, ...comingSoon].sort((a, b) => a.name.localeCompare(b.name));
}
