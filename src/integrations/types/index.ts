/**
 * Calixo Platform - Enterprise Integration Types
 * 
 * Provider-agnostic types for the integration framework.
 * All future providers (Google Ads, Meta, LinkedIn, etc.) implement these interfaces.
 */

export type ProviderId = string;
export type ConnectionId = string;

// ============================================================================
// Provider Definition
// ============================================================================

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  description: string;
  version: string;
  category: ProviderCategory;
  capabilities: ProviderCapability[];
  authType: AuthType;
  configSchema: ProviderConfigSchema;
  metadata: ProviderMetadata;
}

export type ProviderCategory = 'ads' | 'analytics' | 'crm' | 'social' | 'communication' | 'storage' | 'custom';

export type ProviderCapability = 
  | 'read_campaigns' | 'write_campaigns'
  | 'read_analytics' | 'write_analytics'
  | 'read_ads' | 'write_ads'
  | 'read_social' | 'write_social'
  | 'read_contacts' | 'write_contacts'
  | 'read_reports'
  | 'manage_webhooks';

export type AuthType = 'oauth2' | 'api_key' | 'basic' | 'jwt' | 'none';

export interface ProviderConfigSchema {
  fields: ConfigField[];
  required: string[];
  secrets: string[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'boolean' | 'number';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

export interface ProviderMetadata {
  website: string;
  docsUrl: string;
  icon: string;
  color: string;
  isBeta: boolean;
  minPlan: string;
  authDocsUrl?: string;
}

// ============================================================================
// Connection
// ============================================================================

export interface Connection {
  id: ConnectionId;
  organizationId: string;
  providerId: ProviderId;
  name: string;
  status: ConnectionStatus;
  auth: AuthCredentials;
  config: Record<string, unknown>;
  capabilities: ProviderCapability[];
  health: ConnectionHealth;
  metrics: ConnectionMetrics;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'expired' | 'paused';

export interface ConnectionHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheckedAt: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
  responseTimeMs?: number;
  failureCount: number;
  successRate: number;
}

export interface ConnectionMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
  dataSynced: number;
  lastSyncDurationMs?: number;
}

// ============================================================================
// Authentication
// ============================================================================

export interface AuthCredentials {
  type: AuthType;
  status: 'valid' | 'expired' | 'revoked' | 'pending';
  oauth2?: OAuth2Credentials;
  apiKey?: ApiKeyCredentials;
  basic?: BasicCredentials;
}

export interface OAuth2Credentials {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: string;
  scope?: string;
  providerUserId?: string;
  metadata?: Record<string, unknown>;
}

export interface ApiKeyCredentials {
  key: string;
  headerName: string;
}

export interface BasicCredentials {
  username: string;
  password: string;
}

// ============================================================================
// OAuth Flow
// ============================================================================

export interface OAuthFlowConfig {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  revokeUrl?: string;
  scopes: OAuthScope[];
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  pkceRequired: boolean;
}

export interface OAuthScope {
  name: string;
  description: string;
  required: boolean;
}

export interface OAuthState {
  state: string;
  codeVerifier?: string;
  organizationId: string;
  providerId: ProviderId;
  redirectUri: string;
  scopes: string[];
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
  providerUserId?: string;
}

// ============================================================================
// Sync
// ============================================================================

export interface SyncConfig {
  enabled: boolean;
  frequency: SyncFrequency;
  intervalMinutes?: number;
  schedule?: string;
  dataTypes: SyncDataType[];
  fullSyncEnabled: boolean;
  incrementalSyncEnabled: boolean;
  retryConfig: SyncRetryConfig;
}

export type SyncFrequency = 'realtime' | 'frequent' | 'hourly' | 'daily' | 'weekly' | 'manual';

export type SyncDataType = 'campaigns' | 'analytics' | 'ads' | 'social_posts' | 'contacts' | 'reports';

export interface SyncRetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface SyncJob {
  id: string;
  connectionId: ConnectionId;
  type: SyncDataType;
  status: SyncJobStatus;
  mode: 'full' | 'incremental';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export type SyncJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

// ============================================================================
// Webhooks
// ============================================================================

export interface WebhookConfig {
  id: string;
  connectionId: ConnectionId;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  headers?: Record<string, string>;
  retryConfig: SyncRetryConfig;
  createdAt: string;
  updatedAt: string;
  /** Human-facing automation name — added by API & Webhooks (Track 3 Phase 1); optional for backward compatibility with webhooks registered before it existed. */
  name?: string;
  /** Friendly "Send To" label (e.g. "Slack", "Salesforce") shown instead of the raw URL — added by API & Webhooks (Track 3 Phase 1). */
  destinationLabel?: string;
  /** Display-only organizational tag; the real engine has no workspace-scoped enforcement for webhooks — added by API & Webhooks (Track 3 Phase 1). */
  workspaceId?: string;
}

export type WebhookEvent =
  | 'campaign.updated' | 'campaign.created' | 'campaign.deleted'
  | 'lead.created' | 'lead.updated'
  | 'contact.created' | 'contact.updated'
  | 'form.submitted'
  // Platform events — added by API & Webhooks (Track 3 Phase 1) so developer-facing automations can subscribe to platform activity, not just connector/marketing events.
  | 'report.completed'
  | 'credits.low';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: unknown;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attemptCount: number;
  lastAttemptAt?: string;
  responseStatusCode?: number;
  responseBody?: string;
  error?: string;
  createdAt: string;
}

// ============================================================================
// Connector Registry
// ============================================================================

export interface ConnectorRegistration {
  provider: ProviderDefinition;
  createConnector: () => ProviderConnector;
}

export interface ConnectorRegistry {
  register(registration: ConnectorRegistration): void;
  unregister(providerId: ProviderId): void;
  get(providerId: ProviderId): ProviderConnector | undefined;
  getDefinition(providerId: ProviderId): ProviderDefinition | undefined;
  getAll(): ProviderDefinition[];
  getByCategory(category: ProviderCategory): ProviderDefinition[];
  has(providerId: ProviderId): boolean;
}

// ============================================================================
// Provider Connector Interface
// ============================================================================

export interface ProviderConnector {
  readonly provider: ProviderDefinition;
  
  // Connection lifecycle
  connect(credentials: AuthCredentials, config: Record<string, unknown>): Promise<Connection>;
  disconnect(connection: Connection): Promise<void>;
  testConnection(connection: Connection): Promise<ConnectionHealth>;
  
  // Authentication
  getOAuthConfig(): OAuthFlowConfig | null;
  exchangeCode(code: string, state: string): Promise<TokenResponse>;
  refreshAccessToken(credentials: OAuth2Credentials): Promise<OAuth2Credentials>;
  
  // Data operations
  sync(connection: Connection, dataType: SyncDataType, mode: 'full' | 'incremental'): Promise<SyncJob>;
  
  // Webhooks
  registerWebhook(connection: Connection, webhook: WebhookConfig): Promise<string>;
  unregisterWebhook(connection: Connection, webhookId: string): Promise<void>;
  verifyWebhookSignature(payload: unknown, signature: string, secret: string): boolean;
  
  // Health
  checkHealth(connection: Connection): Promise<ConnectionHealth>;
}

// ============================================================================
// Integration Service Interfaces
// ============================================================================

export interface IntegrationService {
  getConnections(organizationId: string): Promise<Connection[]>;
  getConnection(id: ConnectionId): Promise<Connection | null>;
  createConnection(organizationId: string, providerId: ProviderId, config: Record<string, unknown>): Promise<Connection>;
  updateConnection(id: ConnectionId, config: Record<string, unknown>): Promise<Connection>;
  deleteConnection(id: ConnectionId): Promise<void>;
  connect(id: ConnectionId): Promise<Connection>;
  disconnect(id: ConnectionId): Promise<void>;
  /** Additive — Enterprise Integration & Connector Platform (Track 1 Phase 5), Connection Management (section 6). */
  pause(id: ConnectionId): Promise<Connection>;
  resume(id: ConnectionId): Promise<Connection>;
  duplicateConnection(id: ConnectionId): Promise<Connection>;
  testConnection(id: ConnectionId): Promise<ConnectionHealth>;
  syncConnection(id: ConnectionId, dataType: SyncDataType): Promise<SyncJob>;
  getSyncHistory(id: ConnectionId): Promise<SyncJob[]>;
  getSyncJobs(connectionId: ConnectionId): Promise<SyncJob[]>;
  getAvailableProviders(): ProviderDefinition[];
  getProvider(providerId: ProviderId): ProviderDefinition | undefined;
  initiateOAuth(organizationId: string, providerId: ProviderId, redirectUri: string): Promise<{ url: string; state: string }>;
  completeOAuth(providerId: ProviderId, code: string, state: string): Promise<Connection>;
  getConnectionHealth(id: ConnectionId): Promise<ConnectionHealth>;
}

// ============================================================================
// OAuth Service Interface
// ============================================================================

export interface OAuthService {
  initiateFlow(organizationId: string, providerId: ProviderId, redirectUri: string): Promise<{ url: string; state: string; codeVerifier?: string }>;
  /** Returns the `organizationId` the flow was initiated for (carried on the stored `OAuthState`) alongside the token, so `IntegrationService.completeOAuth()` can actually create the connection — see the Integration Architecture Audit finding. */
  completeFlow(providerId: ProviderId, code: string, state: string): Promise<TokenResponse & { organizationId: string }>;
  refreshToken(connectionId: ConnectionId): Promise<OAuth2Credentials>;
  revokeToken(connectionId: ConnectionId): Promise<void>;
  getAuthorizationUrl(providerId: ProviderId, state: string, redirectUri: string, scopes: string[]): string;
}

// ============================================================================
// Sync Service Interface
// ============================================================================

export interface SyncService {
  startSync(connectionId: ConnectionId, dataType: SyncDataType): Promise<SyncJob>;
  /** Additive — Enterprise Integration & Connector Platform (Track 1 Phase 5). Records a job that was executed elsewhere (a manifest-driven connector's REAL `sync()` call via `SynchronizationPlatformAPI`) into this service's own job history, so `getConnectionJobs()`/`getSyncHistory()` stay the single source of truth instead of a second, competing job map. */
  recordExternalJob(job: SyncJob): void;
  cancelSync(jobId: string): Promise<void>;
  getJob(jobId: string): Promise<SyncJob | null>;
  getConnectionJobs(connectionId: ConnectionId): Promise<SyncJob[]>;
  getPendingJobs(): Promise<SyncJob[]>;
  scheduleSync(connectionId: ConnectionId, config: SyncConfig): Promise<void>;
  getSyncConfig(connectionId: ConnectionId): Promise<SyncConfig>;
  updateSyncConfig(connectionId: ConnectionId, config: Partial<SyncConfig>): Promise<void>;
}

// ============================================================================
// Health Monitor Interface
// ============================================================================

export interface HealthMonitor {
  checkConnection(connectionId: ConnectionId): Promise<ConnectionHealth>;
  getConnectionHealth(connectionId: ConnectionId): Promise<ConnectionHealth>;
  getAllConnectionsHealth(organizationId: string): Promise<Map<ConnectionId, ConnectionHealth>>;
  getUnhealthyConnections(organizationId: string): Promise<Connection[]>;
  startMonitoring(connectionId: ConnectionId): void;
  stopMonitoring(connectionId: ConnectionId): void;
  getHealthHistory(connectionId: ConnectionId, hours: number): Promise<ConnectionHealth[]>;
}

// ============================================================================
// Webhook Service Interface
// ============================================================================

export interface WebhookService {
  register(connectionId: ConnectionId, config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookConfig>;
  unregister(webhookId: string): Promise<void>;
  getWebhooks(connectionId: ConnectionId): Promise<WebhookConfig[]>;
  getWebhook(id: string): Promise<WebhookConfig | null>;
  updateWebhook(id: string, config: Partial<WebhookConfig>): Promise<WebhookConfig>;
  handleDelivery(webhookId: string, event: WebhookEvent, payload: unknown): Promise<WebhookDelivery>;
  getDeliveries(webhookId: string): Promise<WebhookDelivery[]>;
  redeliver(deliveryId: string): Promise<WebhookDelivery>;
}

// ============================================================================
// Integration Dashboard Types
// ============================================================================

export interface IntegrationDashboardData {
  totalConnections: number;
  activeConnections: number;
  errorConnections: number;
  totalSyncsToday: number;
  failedSyncsToday: number;
  dataSyncedToday: number;
  connectionsByProvider: { provider: string; count: number }[];
  recentSyncs: SyncJob[];
  unhealthyConnections: Connection[];
  healthOverTime: { timestamp: string; healthy: number; unhealthy: number }[];
}