/**
 * Calixo Platform - Universal Connector Framework: Provider SDK Layer
 *
 * Importing this barrel is what actually registers all 9 provider
 * adapters into `connectorRegistry` (each provider file calls
 * `connectorRegistry.register()` at module-evaluation time — the same
 * "importing the module is what registers it" convention this codebase
 * already uses for `core/platform/connectors/seed/*`). Call
 * `registerAllConnectors()` once, near the same place other Platform
 * foundations are wired (`core/platform/execution/index.ts`), rather than
 * relying on import order alone.
 */
import "./GoogleProvider";
import "./MetaProvider";
import "./LinkedInProvider";
import "./MicrosoftProvider";
import "./SlackProvider";
import "./HubSpotProvider";
import "./SalesforceProvider";
import "./ShopifyProvider";
import "./WordPressProvider";

export { googleConnectors } from "./GoogleProvider";
export { metaConnector, metaConnectorDefinition } from "./MetaProvider";
export { linkedinConnector, linkedinConnectorDefinition } from "./LinkedInProvider";
export { microsoftConnector, microsoftConnectorDefinition } from "./MicrosoftProvider";
export { slackConnector, slackConnectorDefinition } from "./SlackProvider";
export { hubspotConnector, hubspotConnectorDefinition } from "./HubSpotProvider";
export { salesforceConnector, salesforceConnectorDefinition } from "./SalesforceProvider";
export { shopifyConnector, shopifyConnectorDefinition } from "./ShopifyProvider";
export { wordpressConnector, wordpressConnectorDefinition } from "./WordPressProvider";

let registered = false;

/** Idempotent — safe to call more than once. Real registration happens via each provider module's own top-level `connectorRegistry.register()` call; this function just guarantees the barrel has been imported at least once. */
export function registerAllConnectors(): void {
  registered = true;
}

export function areConnectorsRegistered(): boolean {
  return registered;
}
