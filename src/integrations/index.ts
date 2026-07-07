/**
 * Calixo Platform - Connector Platform facade barrel.
 *
 * Deliberately narrow: only the new `ConnectorsPlatformAPI` facade is
 * exported here. `src/integrations` had no top-level barrel before this
 * phase (confirmed by the Enterprise Architecture Audit); its internal
 * oauth/sync/webhooks/health subsystems are left as direct imports for
 * now rather than risking an untested wildcard re-export across a large,
 * previously-unbarreled surface.
 */
export { ConnectorsPlatformAPI, connectorsPlatformAPI } from "./platform/ConnectorsPlatformAPI";
