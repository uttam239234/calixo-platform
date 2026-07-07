/**
 * Calixo Platform - Enterprise API, Gateway & Developer Platform
 *
 * Barrel for the sixth major `core/platform` subpackage (after
 * organizations/workspaces/subscription/featureFlags/events/tenant/
 * contracts/registry from Phase 1, identity from Phase 2, access from
 * Phase 3, data from Phase 4, and connectors from Phase 5): the Contract
 * Registry, Gateway pipeline, real API key issuance, rate limiting,
 * OpenAPI/SDK generation, API analytics/monitoring, and the 9 Platform
 * APIs — the first real HTTP-facing layer this codebase has ever had.
 *
 * `initializeApiFoundation()` registers the core example contracts
 * (health, OpenAPI spec, organizations, connector marketplace, developer
 * API keys) — idempotent.
 */

export * from "./types";
export * from "./SchemaValidator";
export * from "./ContractRegistry";
export * from "./RateLimiter";
export * from "./ApiKeyService";
export * from "./ApiGatewayEngine";
export * from "./ApiAnalyticsEngine";
export * from "./ApiMonitoring";
export * from "./OpenApiGenerator";
export * from "./SdkGenerator";
export * from "./graphqlReadiness";
export * from "./websocketReadiness";

export * from "./ApiGatewayPlatformAPI";
export * from "./ApiRegistryPlatformAPI";
export * from "./ApiContractPlatformAPI";
export * from "./DeveloperPlatformAPI";
export * from "./DocumentationPlatformAPI";
export * from "./ApiAnalyticsPlatformAPI";
export * from "./VersioningPlatformAPI";
export * from "./OpenApiPlatformAPI";
export * from "./SDKPlatformAPI";

import { registerCoreContracts } from "./contracts/registerCoreContracts";

let initialized = false;

export async function initializeApiFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;
  registerCoreContracts();
}
