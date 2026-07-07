/**
 * Calixo Platform - Enterprise Integration & Connector Platform Types
 *
 * Builds ON TOP of the pre-existing, real `src/integrations` module
 * (`ProviderDefinition`/`Connection`/`ProviderConnector`/...) found during
 * the Integration Architecture Audit — this file does not redefine those,
 * it adds what's missing: the Connector SDK's manifest format, the
 * Marketplace's presentation layer, the Universal Data Model normalization
 * targets, transformation rules, the Wizard state machine, and health
 * scoring.
 */
import type { ProviderCapability, ProviderCategory } from "@/integrations/types";

// ============================================================================
// Marketplace
// ============================================================================

/** The 17 categories the mandate's Marketplace requires — a superset of `src/integrations`' existing 7-value `ProviderCategory` (kept intact and reused; this is the Marketplace's presentation-level taxonomy). */
export type ConnectorCategory =
  | "analytics" | "advertising" | "crm" | "erp" | "hr" | "finance"
  | "communication" | "email" | "social_media" | "cloud_storage" | "ai"
  | "commerce" | "cms" | "databases" | "developer_tools" | "custom_api" | "webhook";

export interface ConnectorMarketplaceListing {
  providerId: string;
  name: string;
  category: ConnectorCategory;
  logo: string;
  description: string;
  features: string[];
  requirements: string[];
  permissions: string[];
  supportedPlans: string[];
  isBeta: boolean;
  installCount: number;
}

export type InstallState = "not_installed" | "installing" | "installed" | "needs_reauth" | "error";

export interface MarketplaceListingWithState extends ConnectorMarketplaceListing {
  installState: InstallState;
  connectionId?: string;
  health?: ConnectorHealthScore;
}

// ============================================================================
// Connector SDK - Manifest
// ============================================================================

export type ManifestAuthType = "oauth2" | "oauth2_pkce" | "api_key" | "jwt" | "basic" | "service_account" | "client_credentials" | "none";

export interface ManifestOAuthConfig {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  scopes: { name: string; description: string; required: boolean }[];
  pkce: boolean;
}

export interface ManifestEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  dataType: string;
  paginated: boolean;
}

/** Declares how one raw field on an endpoint's response maps onto one Universal Data Model field — this is what the Normalization Engine executes; authoring a mapping requires no platform code changes. */
export interface FieldMapping {
  universalField: string;
  sourcePath: string;
  defaultValue?: unknown;
}

export interface NormalizationMapping {
  endpointId: string;
  universalEntity: UniversalEntityType;
  fields: FieldMapping[];
  /** Scoped to THIS mapping's entity type, not the whole manifest — a manifest-wide transformation list would silently apply e.g. a traffic-only filter to revenue records synced under the same `dataType` (found via live testing; see `seedExampleConnectors.ts`). */
  transformations?: TransformationRule[];
}

export interface ConnectorManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  category: ConnectorCategory;
  legacyCategory: ProviderCategory;
  icon: string;
  color: string;
  website: string;
  docsUrl: string;
  isBeta: boolean;
  minPlan: string;
  authType: ManifestAuthType;
  oauth?: ManifestOAuthConfig;
  capabilities: ProviderCapability[];
  configFields: { key: string; label: string; type: "text" | "password" | "select" | "boolean" | "number"; required: boolean; helpText?: string }[];
  endpoints: ManifestEndpoint[];
  mappings: NormalizationMapping[];
  supportedSyncFrequencies: ("realtime" | "frequent" | "hourly" | "daily" | "weekly" | "manual")[];
  supportedWebhookEvents: string[];
  healthCheckEndpointId?: string;
}

// ============================================================================
// Universal Data Model (Normalization Platform)
// ============================================================================

export type UniversalEntityType =
  | "traffic" | "revenue" | "campaign" | "lead" | "conversion"
  | "customer" | "content" | "asset" | "brand" | "audience";

export interface UniversalRecordBase {
  id: string;
  externalId: string;
  sourceProviderId: string;
  sourceConnectionId: string;
  organizationId: string;
  normalizedAt: string;
  raw?: Record<string, unknown>;
}

export interface UniversalTraffic extends UniversalRecordBase {
  entity: "traffic";
  sessions: number;
  pageViews: number;
  users: number;
  bounceRate?: number;
  channel?: string;
  date: string;
}

export interface UniversalRevenue extends UniversalRecordBase {
  entity: "revenue";
  amount: number;
  currency: string;
  date: string;
  source?: string;
}

export interface UniversalCampaign extends UniversalRecordBase {
  entity: "campaign";
  name: string;
  status: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  startDate?: string;
  endDate?: string;
}

export interface UniversalLead extends UniversalRecordBase {
  entity: "lead";
  name: string;
  email?: string;
  status: string;
  source?: string;
  createdAt: string;
}

export interface UniversalConversion extends UniversalRecordBase {
  entity: "conversion";
  type: string;
  value?: number;
  currency?: string;
  occurredAt: string;
}

export interface UniversalCustomer extends UniversalRecordBase {
  entity: "customer";
  name: string;
  email?: string;
  lifetimeValue?: number;
}

export interface UniversalContent extends UniversalRecordBase {
  entity: "content";
  title: string;
  type: string;
  publishedAt?: string;
  url?: string;
}

export interface UniversalAsset extends UniversalRecordBase {
  entity: "asset";
  name: string;
  type: string;
  url?: string;
}

export interface UniversalBrand extends UniversalRecordBase {
  entity: "brand";
  name: string;
  handle?: string;
}

export interface UniversalAudience extends UniversalRecordBase {
  entity: "audience";
  name: string;
  size?: number;
}

export type UniversalRecord =
  | UniversalTraffic | UniversalRevenue | UniversalCampaign | UniversalLead | UniversalConversion
  | UniversalCustomer | UniversalContent | UniversalAsset | UniversalBrand | UniversalAudience;

// ============================================================================
// Transformation Platform
// ============================================================================

export type TransformationRuleKind = "field_mapping" | "calculated_field" | "data_cleaning" | "filter" | "formatting" | "enrichment" | "validation" | "default_value";

export interface TransformationRule {
  kind: TransformationRuleKind;
  field: string;
  /** `calculated_field`: JS expression evaluated with record fields in scope, e.g. `"clicks / impressions"`. `filter`: predicate expression; record is dropped if it evaluates falsy. `formatting`: one of the built-in formatters below. `data_cleaning`: trims/normalizes strings. `default_value`: `value` applied when the field is missing. */
  expression?: string;
  formatter?: "uppercase" | "lowercase" | "trim" | "round2" | "iso_date";
  value?: unknown;
}

// ============================================================================
// Connector Wizard (10-step state machine)
// ============================================================================

export type WizardStepId =
  | "welcome" | "authentication" | "choose_account" | "choose_workspace" | "choose_brand"
  | "choose_data" | "choose_sync" | "review" | "connect" | "success";

export const WIZARD_STEPS: WizardStepId[] = [
  "welcome", "authentication", "choose_account", "choose_workspace", "choose_brand",
  "choose_data", "choose_sync", "review", "connect", "success",
];

export interface WizardState {
  wizardId: string;
  providerId: string;
  organizationId: string;
  currentStepIndex: number;
  currentStep: WizardStepId;
  completedSteps: WizardStepId[];
  selections: {
    accountId?: string;
    workspaceId?: string;
    brandId?: string;
    dataTypes?: string[];
    syncFrequency?: string;
  };
  connectionId?: string;
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
}

// ============================================================================
// Connector Health Platform
// ============================================================================

export type ConnectorHealthStatus = "healthy" | "connected" | "syncing" | "paused" | "expired" | "warning" | "rate_limited" | "error" | "disconnected";

export interface ConnectorHealthScore {
  connectionId: string;
  status: ConnectorHealthStatus;
  score: number;
  uptimePercent: number;
  lastSyncAt?: string;
  nextSyncAt?: string;
}

// ============================================================================
// Governance / Ownership
// ============================================================================

export type ConnectorOwnershipRole = "owner" | "editor" | "viewer";

export interface ConnectorOwnership {
  connectionId: string;
  organizationId: string;
  workspaceId?: string;
  brandId?: string;
  ownerId: string;
  sharedWith: { userId: string; role: ConnectorOwnershipRole }[];
}
