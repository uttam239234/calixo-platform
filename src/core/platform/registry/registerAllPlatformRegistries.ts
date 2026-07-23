/**
 * Calixo Platform - Registry Standardization Bootstrap
 *
 * The one file allowed to import every module's registry just to register
 * it into `PlatformRegistry` for introspection — every other file in
 * `core/platform` stays a dependency-free leaf. Call
 * `registerAllPlatformRegistries()` once at app/platform init.
 */
import { organizationRegistry } from "../organizations/OrganizationRegistry";
import { workspaceRegistry } from "../workspaces/WorkspaceRegistry";
import { subscriptionRegistry } from "../subscription/SubscriptionRegistry";
import { featureFlagRegistry } from "../featureFlags/FeatureFlagRegistry";
import { trustedDeviceRegistry } from "../identity/TrustedDeviceRegistry";
import { ssoProviderRegistry } from "../identity/sso/SsoProviderRegistry";
import { mfaFactorRegistry } from "../identity/mfa/MfaFactorRegistry";
import { permissionRegistry } from "../access/PermissionRegistry";
import { ownershipEngine } from "../access/OwnershipEngine";
import { permissionTemplateRegistry } from "../access/PermissionTemplateRegistry";
import { apiClientRegistry } from "../access/apiAuth/ApiClientRegistry";
import { repositoryRegistry } from "../data/RepositoryRegistry";
import { versioningEngine } from "../data/VersioningEngine";
import { softDeleteEngine } from "../data/SoftDeleteEngine";
import { transactionManager } from "../data/TransactionManager";
import { cacheEngine } from "../data/CacheEngine";
import { searchRegistry } from "../data/SearchEngine";
import { storageProviderRegistry } from "../data/storage/StorageProviderRegistry";
import { migrationEngine } from "../data/MigrationEngine";
import { schemaRegistry } from "../data/SchemaRegistry";
import { dataGovernanceRegistry } from "../data/governance";
import { secretVault } from "@/integrations/secrets/SecretVault";
import { contractRegistry } from "../api/ContractRegistry";
import { rateLimiter } from "../api/RateLimiter";
import { apiAnalyticsEngine } from "../api/ApiAnalyticsEngine";
import { graphqlReadinessRegistry } from "../api/graphqlReadiness";
import { realtimeChannelRegistry } from "../api/websocketReadiness";
import { executionRegistry } from "../execution/ExecutionRegistry";
import { retryPolicyRegistry } from "../execution/RetryPolicyRegistry";
import { automationEngine } from "../execution/AutomationEngine";
import { executionEngine } from "../execution/ExecutionEngine";
import { executionHistoryEngine } from "../execution/ExecutionHistoryEngine";
import { metricsEngine } from "../observability/MetricsEngine";
import { tracingEngine } from "../observability/TracingEngine";
import { alertEngine } from "../observability/AlertEngine";
import { errorIntelligenceEngine } from "../observability/ErrorIntelligenceEngine";
import { usageMeteringEngine } from "../commercial/UsageMeteringEngine";
import { quotaEngine } from "../commercial/QuotaEngine";
import { creditEngine } from "../commercial/CreditEngine";
import { licensingEngine } from "../commercial/LicensingEngine";
import { invoiceEngine } from "../commercial/InvoiceEngine";
import { contractEngine } from "../commercial/ContractEngine";
import { promotionEngine } from "../commercial/PromotionEngine";
import { platformRegistry } from "./PlatformRegistry";

import { userRegistry, teamRegistry } from "@/core/users";
import { settingsRegistry, settingsGroupRegistry } from "@/core/settings";
import { reportRegistry, dashboardRegistry as reportsDashboardRegistry, templateRegistry } from "@/core/reports";
import { segmentRegistry } from "@/core/analytics";
import { ModuleRegistry } from "@/core/modules";

let registered = false;

export function registerAllPlatformRegistries(): void {
  if (registered) return;
  registered = true;

  platformRegistry.register({ name: "organizations", kind: "OrganizationRegistry", count: () => organizationRegistry.count() });
  platformRegistry.register({ name: "workspaces", kind: "WorkspaceRegistry", count: () => workspaceRegistry.count() });
  platformRegistry.register({ name: "subscriptionTiers", kind: "SubscriptionRegistry", count: () => subscriptionRegistry.count() });
  platformRegistry.register({ name: "featureFlags", kind: "FeatureFlagRegistry", count: () => featureFlagRegistry.count() });
  platformRegistry.register({ name: "trustedDevices", kind: "TrustedDeviceRegistry", count: () => trustedDeviceRegistry.count() });
  platformRegistry.register({ name: "ssoConnections", kind: "SsoProviderRegistry", count: () => ssoProviderRegistry.count() });
  platformRegistry.register({ name: "mfaFactors", kind: "MfaFactorRegistry", count: () => mfaFactorRegistry.count() });
  platformRegistry.register({ name: "canonicalPermissions", kind: "PermissionRegistry", count: () => permissionRegistry.count() });
  platformRegistry.register({ name: "ownershipGrants", kind: "OwnershipEngine", count: () => ownershipEngine.count() });
  platformRegistry.register({ name: "permissionTemplates", kind: "PermissionTemplateRegistry", count: () => permissionTemplateRegistry.count() });
  platformRegistry.register({ name: "apiClients", kind: "ApiClientRegistry", count: () => apiClientRegistry.count() });

  platformRegistry.register({ name: "users", kind: "UserRegistry", count: () => userRegistry.count() });
  platformRegistry.register({ name: "teams", kind: "TeamRegistry", count: () => teamRegistry.count() });
  platformRegistry.register({ name: "settings", kind: "SettingsRegistry", count: () => settingsRegistry.count() });
  platformRegistry.register({ name: "settingsGroups", kind: "SettingsGroupRegistry", count: () => settingsGroupRegistry.count() });
  platformRegistry.register({ name: "reports", kind: "ReportRegistry", count: () => reportRegistry.count() });
  platformRegistry.register({ name: "reportDashboards", kind: "DashboardRegistry", count: () => reportsDashboardRegistry.count() });
  platformRegistry.register({ name: "reportTemplates", kind: "TemplateRegistry", count: () => templateRegistry.count() });
  // `analyticsDashboardRegistry`/`dashboardLayoutRegistry` (Round 23) are
  // deliberately NOT registered here: both are now `"server-only"`-tagged
  // and disk-backed, and this file is reachable from client bundles via
  // `core/platform/index.ts` → several client Providers — importing them
  // here would pull a `fs` dependency into the browser build. Their counts
  // aren't available in the platform registry directory as a result.
  platformRegistry.register({ name: "analyticsSegments", kind: "SegmentRegistry", count: () => segmentRegistry.count() });
  platformRegistry.register({ name: "modules", kind: "ModuleRegistry", count: () => ModuleRegistry.getModuleCount() });
  // The Universal Connector Framework's `connectorRegistry` (`@/core/connectors`) is
  // deliberately NOT registered here for the same reason as the note above: it's
  // `"server-only"`-tagged and this file is reachable from client bundles. Its count is
  // surfaced instead by the server-only Platform Admin connector diagnostics page.

  // Enterprise Data & Persistence Platform (Track 1 Phase 4)
  platformRegistry.register({ name: "repositories", kind: "RepositoryRegistry", count: () => repositoryRegistry.count() });
  platformRegistry.register({ name: "entityVersions", kind: "VersioningEngine", count: () => versioningEngine.count() });
  platformRegistry.register({ name: "legalHolds", kind: "SoftDeleteEngine", count: () => softDeleteEngine.count() });
  platformRegistry.register({ name: "transactions", kind: "TransactionManager", count: () => transactionManager.count() });
  platformRegistry.register({ name: "namedCaches", kind: "CacheEngine", count: () => cacheEngine.count() });
  platformRegistry.register({ name: "searchIndices", kind: "SearchRegistry", count: () => searchRegistry.count() });
  platformRegistry.register({ name: "storageProviders", kind: "StorageProviderRegistry", count: () => storageProviderRegistry.count() });
  platformRegistry.register({ name: "migrations", kind: "MigrationEngine", count: () => migrationEngine.count() });
  platformRegistry.register({ name: "entitySchemas", kind: "SchemaRegistry", count: () => schemaRegistry.count() });
  platformRegistry.register({ name: "retentionPolicies", kind: "DataGovernanceRegistry", count: () => dataGovernanceRegistry.count() });

  // Enterprise Integration & Connector Platform (Track 1 Phase 5)
  // The Universal Connector Framework (`@/core/connectors`) is `server-only` and deliberately not
  // registered here — this whole file runs isomorphically (client + server) via
  // `initializePlatformRegistryFoundation()` -> `initializePlatformFoundation()`, so a server-only
  // module can't be imported at this layer. Its registry/health/log counts are surfaced instead by
  // the Platform Admin connector diagnostics page (`/platform-admin/connectors`), which is already
  // server-only.
  platformRegistry.register({ name: "vaultSecrets", kind: "SecretVault", count: () => secretVault.count() });

  // Enterprise API, Gateway & Developer Platform (Track 1 Phase 6)
  platformRegistry.register({ name: "apiContracts", kind: "ContractRegistry", count: () => contractRegistry.count() });
  platformRegistry.register({ name: "rateLimitWindows", kind: "RateLimiter", count: () => rateLimiter.count() });
  platformRegistry.register({ name: "apiRequestLog", kind: "ApiAnalyticsEngine", count: () => apiAnalyticsEngine.count() });
  platformRegistry.register({ name: "graphqlTypes", kind: "GraphQLReadinessRegistry", count: () => graphqlReadinessRegistry.count() });
  platformRegistry.register({ name: "realtimeChannels", kind: "RealtimeChannelRegistry", count: () => realtimeChannelRegistry.count() });

  // Enterprise Execution, Automation & Background Processing Platform (Track 1 Phase 7)
  platformRegistry.register({ name: "executionTypes", kind: "ExecutionRegistry", count: () => executionRegistry.count() });
  platformRegistry.register({ name: "retryPolicies", kind: "RetryPolicyRegistry", count: () => retryPolicyRegistry.count() });
  platformRegistry.register({ name: "automations", kind: "AutomationEngine", count: () => automationEngine.count() });
  platformRegistry.register({ name: "executions", kind: "ExecutionEngine", count: () => executionEngine.count() });
  platformRegistry.register({ name: "executionHistory", kind: "ExecutionHistoryEngine", count: () => executionHistoryEngine.count() });

  // Enterprise Observability, Monitoring, Diagnostics & Operations Platform (Track 1 Phase 8)
  platformRegistry.register({ name: "metricSeries", kind: "MetricsEngine", count: () => metricsEngine.count() });
  platformRegistry.register({ name: "traces", kind: "TracingEngine", count: () => tracingEngine.count() });
  platformRegistry.register({ name: "alertRules", kind: "AlertEngine", count: () => alertEngine.count() });
  platformRegistry.register({ name: "observedErrors", kind: "ErrorIntelligenceEngine", count: () => errorIntelligenceEngine.count() });

  // Enterprise Commercial, Billing, Licensing & Subscription Platform (Track 1 Phase 9)
  platformRegistry.register({ name: "usageRecords", kind: "UsageMeteringEngine", count: () => usageMeteringEngine.count() });
  platformRegistry.register({ name: "quotaRules", kind: "QuotaEngine", count: () => quotaEngine.count() });
  platformRegistry.register({ name: "creditTransactions", kind: "CreditEngine", count: () => creditEngine.count() });
  platformRegistry.register({ name: "licenses", kind: "LicensingEngine", count: () => licensingEngine.count() });
  platformRegistry.register({ name: "invoices", kind: "InvoiceEngine", count: () => invoiceEngine.count() });
  platformRegistry.register({ name: "contracts", kind: "ContractEngine", count: () => contractEngine.count() });
  platformRegistry.register({ name: "promotions", kind: "PromotionEngine", count: () => promotionEngine.count() });
}
