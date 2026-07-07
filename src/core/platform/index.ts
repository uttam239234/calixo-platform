/**
 * Calixo Platform - Enterprise SaaS Platform Foundation
 *
 * The single barrel for every reusable, module-agnostic platform-layer
 * concern: Subscription (tiers/limits), Organizations, Workspaces, Feature
 * Flags, Platform Events, Tenant Context, Shared Contracts, and the
 * Platform Registry/Metadata/Health/Config meta-services. Also re-exports
 * the pre-existing shared extraction layer (`dashboardBuilder`, `goals`,
 * `forecast`) built during the Dashboard/Analytics phases — this barrel
 * did not exist before; every subpackage was imported directly. It now
 * exists as the one entry point future modules should use.
 *
 * `initializePlatformFoundation()` is the single bootstrap call for the
 * whole foundation, in dependency order: Subscription tiers must exist
 * before an Organization can be assigned one; the Registry meta-layer
 * must run last since it references every other registry.
 */

export * from "./subscription";
export * from "./organizations";
export * from "./workspaces";
export * from "./featureFlags";
export * from "./events";
export * from "./tenant";
export * from "./contracts";
export * from "./registry";
export * from "./identity";
export * from "./access";
export * from "./data";
export * from "./connectors";
export * from "./api";
export * from "./execution";
export * from "./observability";
export * from "./commercial";

export * from "./dashboardBuilder";
export * from "./goals";
export { linearForecast } from "./forecast/linearForecast";
export type { ForecastPoint } from "./forecast/linearForecast";

import { initializeSubscriptionFoundation } from "./subscription";
import { initializeOrganizationsFoundation } from "./organizations";
import { initializeWorkspacesFoundation } from "./workspaces";
import { initializeFeatureFlagsFoundation } from "./featureFlags";
import { initializePlatformRegistryFoundation } from "./registry";
import { initializeIdentityFoundation } from "./identity";
import { initializeAccessControlFoundation } from "./access";
import { initializeDataFoundation } from "./data";
import { initializeConnectorFoundation } from "./connectors";
import { initializeApiFoundation } from "./api";
import { initializeExecutionFoundation } from "./execution";
import { initializeObservabilityFoundation } from "./observability";
import { initializeCommercialFoundation } from "./commercial";

let initialized = false;

/** Registers subscription tiers, feature flags, identity, access control (permissions/system roles/default policies), the Data & Persistence Platform (base entity schema, bootstrap migration, existing-repository indexing), the Integration & Connector Platform (Universal Data Model schemas, example manifest-driven connector), the API/Gateway/Developer Platform (core contracts: health, OpenAPI spec, organizations, connector marketplace, developer API keys), the Execution/Automation/Background Processing Platform (real workflow/notification/report-tick/ai-embedding workers, then — for the first time in this codebase's history — connects `queueEngine` to `workerRegistry` and starts the queue/event-bus/scheduler poll loops), the Observability/Monitoring/Diagnostics/Operations Platform (wires Error Intelligence's event subscriptions, default alert rules, and a real recurring observability tick), the Commercial/Billing/Licensing/Subscription Platform (registers usage types/quotas/pricing, wires event-driven Connector/Execution usage metering and a real recurring AI/API usage + grace-period/credit-expiry tick), and the registry meta-layer — the small foundational set every module can depend on being ready. Organizations/Workspaces themselves have no built-in catalog (created via `OrganizationEngine.create()` or the opt-in mock seed). Safe to call more than once. */
export async function initializePlatformFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;
  initializeSubscriptionFoundation();
  initializeOrganizationsFoundation();
  initializeWorkspacesFoundation();
  initializeFeatureFlagsFoundation();
  initializeIdentityFoundation();
  await initializeAccessControlFoundation();
  await initializeDataFoundation();
  await initializeConnectorFoundation();
  await initializeApiFoundation();
  await initializeExecutionFoundation();
  await initializeObservabilityFoundation();
  await initializeCommercialFoundation();
  initializePlatformRegistryFoundation();
}
