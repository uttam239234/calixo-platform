/**
 * Calixo Platform - Universal Connector Framework: Types
 *
 * This is NEW, standalone infrastructure — it does not touch, extend, or
 * replace `src/integrations/` (the runtime the live Settings -> Integrations
 * UI depends on today via `useIntegrations.ts`) or `src/core/platform/connectors/`
 * (the existing manifest-driven "Connector Platform" facade that sits on top
 * of it). Both of those keep working exactly as they do today. This module
 * is the framework a FUTURE phase will wire Settings -> Integrations to;
 * per the brief, that wiring is explicitly out of scope for this phase.
 *
 * `ConnectorProviderId` is deliberately the exact same 9-value union as
 * `OAuthProviderId` (`@/core/platform/secrets/oauth`) — every org-level
 * connector is for a platform-level OAuth application that must already
 * exist. Re-exported (not redefined) to guarantee they can never drift.
 */
import type { OAuthProviderId } from "@/core/platform/secrets/oauth";

export type ConnectorProviderId = OAuthProviderId;

export type ConnectorCategory = "advertising" | "analytics" | "search" | "social" | "crm" | "productivity" | "communication" | "ecommerce" | "cms";

export type ConnectorFeature =
  | "reporting"
  | "campaign-management"
  | "audience-insights"
  | "content-publishing"
  | "lead-sync"
  | "messaging"
  | "file-access"
  | "email-access"
  | "calendar-access"
  | "commerce-catalog";

export type ConnectorCapabilityId = "read" | "write" | "webhook" | "realtime" | "scheduling" | "ai-insights";

export type ConnectorDefinitionStatus = "available" | "beta" | "deprecated" | "disabled";

/** The 9 real states every connector instance continuously reports, per the brief. */
export type ConnectorHealthStatus = "healthy" | "warning" | "expired_token" | "rate_limited" | "permission_missing" | "sync_failed" | "disconnected" | "configuration_error" | "unknown";

export type ConnectorSyncMode = "manual" | "scheduled" | "incremental" | "full" | "webhook" | "retry";
export type ConnectorSyncStatus = "running" | "succeeded" | "failed" | "partial";

export type ConnectorInstanceStatus = "active" | "paused" | "disconnected" | "error";

export type ConnectorCredentialStatus = "active" | "expired" | "revoked" | "invalid";

export type ConnectorWebhookStatus = "active" | "disabled" | "failing";

// ============================================================================
// Database models (file-backed today — see persistence/ConnectorDataStore.ts
// for why the storage shape is real DB rows, not an in-memory-only object)
// ============================================================================

/** The static, code-defined catalog entry — one per provider, global (small, fixed size; loaded once like every other Platform-level registry in this codebase). */
export interface ConnectorDefinition {
  id: string;
  provider: ConnectorProviderId;
  displayName: string;
  category: ConnectorCategory;
  icon: string;
  version: string;
  status: ConnectorDefinitionStatus;
  supportedFeatures: ConnectorFeature[];
  supportedCapabilities: ConnectorCapabilityId[];
  /** Google Scope Manager service ids for Google, or a generic named OAuth "product"/scope-group for other providers — never a raw scope URL. */
  requiredOAuthProducts: string[];
  requiredScopes: string[];
  supportedEvents: ConnectorEventType[];
  supportsWebhook: boolean;
  supportsRealtime: boolean;
  supportsScheduling: boolean;
  supportsAI: boolean;
}

/** One organization's connection to one provider. Real, org-scoped, persisted per-organization (never one global table loaded fully into memory — see ConnectorDataStore). */
export interface ConnectorInstance {
  id: string;
  organizationId: string;
  workspaceId?: string;
  connectorId: string;
  provider: ConnectorProviderId;
  displayName: string;
  status: ConnectorInstanceStatus;
  connectedAccountLabel?: string;
  /** Per-connection OAuth endpoint parameters (Microsoft tenantId, Salesforce loginUrl, Shopify shopDomain) — never a secret, just routing/addressing data. */
  metadata?: Record<string, string>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Organization-level OAuth tokens ONLY — never a platform Client ID/Secret (those live exclusively in Platform Secrets, resolved via `OAuthApplicationService`). */
export interface ConnectorCredential {
  id: string;
  organizationId: string;
  connectorInstanceId: string;
  provider: ConnectorProviderId;
  sealedAccessTokenRef?: string;
  sealedRefreshTokenRef?: string;
  scopes: string[];
  connectedAccount?: string;
  providerUserId?: string;
  expiresAt?: string;
  status: ConnectorCredentialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorHealth {
  connectorInstanceId: string;
  organizationId: string;
  status: ConnectorHealthStatus;
  message: string;
  checkedAt: string;
  details?: Record<string, unknown>;
}

export interface ConnectorSync {
  id: string;
  connectorInstanceId: string;
  organizationId: string;
  mode: ConnectorSyncMode;
  status: ConnectorSyncStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  recordsProcessed: number;
  errors: string[];
  conflictsResolved: number;
  /** Honest disclosure: this phase builds sync orchestration only — no provider fetches real product data (Ads/Analytics/etc. are explicitly out of scope). */
  message: string;
}

export interface ConnectorLog {
  id: string;
  provider: ConnectorProviderId;
  organizationId?: string;
  workspaceId?: string;
  connectorInstanceId?: string;
  userId?: string;
  action: string;
  latencyMs?: number;
  status: "success" | "failure";
  requestId: string;
  correlationId?: string;
  error?: string;
  timestamp: string;
}

export interface ConnectorWebhook {
  id: string;
  organizationId: string;
  connectorInstanceId: string;
  provider: ConnectorProviderId;
  /** Calixo's own inbound receiver URL this registration is bound to. */
  receiverUrl: string;
  sealedSigningSecretRef: string;
  events: string[];
  status: ConnectorWebhookStatus;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "success" | "failure";
  /** Bounded to the single most recent failed delivery — enough for a real, honest "Replay" action without unbounded per-webhook payload storage. */
  lastFailedPayload?: unknown;
  deadLetterCount: number;
  createdAt: string;
}

export interface ConnectorPermission {
  connectorInstanceId: string;
  organizationId: string;
  scope: string;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
}

export interface ConnectorRateLimit {
  connectorInstanceId: string;
  provider: ConnectorProviderId;
  remainingRequests?: number;
  burstLimit?: number;
  resetAt?: string;
  retryAfterMs?: number;
  throttleQueueLength: number;
  updatedAt: string;
}

export interface ConnectorCapability {
  connectorId: string;
  capability: ConnectorCapabilityId;
  supported: boolean;
  notes?: string;
}

// ============================================================================
// The Connector interface — every provider adapter implements this
// ============================================================================

export interface ConnectorContext {
  organizationId: string;
  workspaceId?: string;
  connectorInstanceId: string;
  /** The user performing the action — required for RBAC (`resourceAuthorizationAPI.canOperateConnector`) and audit attribution. */
  actorId: string;
  /** Per-connection OAuth endpoint parameters a provider needs beyond the platform app (Microsoft's tenantId, Salesforce's loginUrl, Shopify's shopDomain) — read from `ConnectorInstance.metadata` by whoever builds this context, never a platform secret. */
  extra?: Record<string, string>;
}

export interface ConnectorConnectParams {
  code: string;
  state: string;
}

export interface ConnectorConnectResult {
  ok: boolean;
  connectedAccount?: string;
  providerUserId?: string;
  scopes?: string[];
  expiresAt?: string;
  error?: string;
}

export interface ConnectorValidateResult {
  ok: boolean;
  issues: string[];
}

export interface ConnectorTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

export interface ConnectorSyncResult {
  status: ConnectorSyncStatus;
  recordsProcessed: number;
  errors: string[];
  message: string;
}

export interface ConnectorWebhookEvent {
  type: string;
  payload: unknown;
}

export interface ConnectorWebhookResult {
  ok: boolean;
  message: string;
}

export interface ConnectorScheduleResult {
  ok: boolean;
  scheduleIds: string[];
}

/**
 * AI-ready standardized dataset contract — every connector CAN expose one so
 * AI Copilot can answer questions like "Why did ROAS decrease?" without any
 * connector-specific AI code. `implemented: false` in every adapter this
 * phase ships — per the brief, no provider's actual product-data fetching
 * (Google Ads, Analytics, Meta, Search Console, ...) is built yet. This is
 * the real, typed seam a future phase fills in, not a fabricated dataset.
 */
export interface ConnectorAIContext {
  provider: ConnectorProviderId;
  summary: string;
  availableMetrics: string[];
  availableDimensions: string[];
  sampleQuestions: string[];
  implemented: boolean;
}

export interface Connector {
  readonly provider: ConnectorProviderId;
  connect(ctx: ConnectorContext, params: ConnectorConnectParams): Promise<ConnectorConnectResult>;
  disconnect(ctx: ConnectorContext): Promise<{ ok: boolean }>;
  refresh(ctx: ConnectorContext): Promise<{ ok: boolean; expiresAt?: string; error?: string }>;
  validate(ctx: ConnectorContext): Promise<ConnectorValidateResult>;
  health(ctx: ConnectorContext): Promise<ConnectorHealth>;
  sync(ctx: ConnectorContext, mode: ConnectorSyncMode): Promise<ConnectorSyncResult>;
  webhook(ctx: ConnectorContext, event: ConnectorWebhookEvent): Promise<ConnectorWebhookResult>;
  schedule(ctx: ConnectorContext): Promise<ConnectorScheduleResult>;
  getCapabilities(): ConnectorCapabilityId[];
  getPermissions(): string[];
  test(ctx: ConnectorContext): Promise<ConnectorTestResult>;
  getAIContext(ctx: ConnectorContext): Promise<ConnectorAIContext>;
}

// ============================================================================
// Connector-specific event catalog — a NAMED SUBSET of `PlatformEventType`
// (`@/core/platform/events`), not a new event bus. Kept here only so
// `ConnectorDefinition.supportedEvents` has a real, narrow type to reference.
// ============================================================================
export type ConnectorEventType =
  | "ConnectorInstalled"
  | "ConnectorUninstalled"
  | "ConnectorConnected"
  | "ConnectorDisconnected"
  | "ConnectorTokenRefreshed"
  | "ConnectorSyncCompleted"
  | "ConnectorSyncFailed"
  | "ConnectorHealthChanged"
  | "ConnectorPermissionsChanged"
  | "WebhookReceived";
