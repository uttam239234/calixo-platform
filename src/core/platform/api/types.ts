/**
 * Calixo Platform - Enterprise API, Gateway & Developer Platform Types
 *
 * The API Architecture Audit found: zero routes (`src/app/api` doesn't
 * exist), zero middleware, zero OpenAPI, zero validation library, and
 * `PlatformHealthService`'s own comment already flagged this as "a later
 * phase per the Definition of Done." This is genuinely new infrastructure
 * — but it's the thinnest possible layer over five phases of real Platform
 * APIs, never a reimplementation of them.
 */
import type { ActionType, ResourceType } from "../access/types";

// ============================================================================
// Contract Platform
// ============================================================================

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiVersion = "v1" | "v2";
export type ApiVisibility = "internal" | "public" | "partner" | "webhook";
export type ApiLifecycleStatus = "draft" | "active" | "deprecated" | "sunset";

export type SchemaFieldType = "string" | "number" | "boolean" | "array" | "object";

export interface SchemaField {
  name: string;
  type: SchemaFieldType;
  required?: boolean;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  /** For `type: "array"` — the shape of each item. */
  items?: ApiSchema | SchemaFieldType;
  /** For `type: "object"` — nested fields. */
  properties?: SchemaField[];
}

export interface ApiSchema {
  name: string;
  fields: SchemaField[];
}

export interface RateLimitRule {
  scope: "global" | "organization" | "workspace" | "api_key" | "user" | "ip" | "endpoint";
  limit: number;
  windowMs: number;
}

export interface ApiPermissionRequirement {
  resourceType: ResourceType;
  action: ActionType;
}

export interface ApiContractDefinition {
  id: string;
  name: string;
  description: string;
  method: HttpMethod;
  path: string;
  version: ApiVersion;
  visibility: ApiVisibility;
  status: ApiLifecycleStatus;
  tags: string[];
  owner: string;
  permission?: ApiPermissionRequirement;
  scopes: string[];
  rateLimits: RateLimitRule[];
  requestSchema?: ApiSchema;
  responseSchema?: ApiSchema;
  deprecatedAt?: string;
  sunsetAt?: string;
  migrationNotes?: string;
  examples?: { request?: unknown; response?: unknown }[];
}

export type ContractHandler = (ctx: GatewayRequestContext) => Promise<unknown>;

export interface RegisteredContract {
  definition: ApiContractDefinition;
  handler: ContractHandler;
}

// ============================================================================
// Gateway Runtime
// ============================================================================

export interface GatewayRequestContext {
  method: HttpMethod;
  path: string;
  version: ApiVersion;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
  ip?: string;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  apiKeyId?: string;
}

export type GatewayAuthMethod = "bearer_jwt" | "api_key" | "none";

export interface GatewayResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

export interface GatewayErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
}

// ============================================================================
// Developer Platform - API Keys / OAuth Apps
// ============================================================================

export interface IssuedApiKey {
  id: string;
  organizationId: string;
  name: string;
  plaintextKey: string;
  keyPrefix: string;
  scopes: string[];
}

// ============================================================================
// SDK Platform
// ============================================================================

export type SdkLanguage = "typescript" | "javascript" | "python" | "php" | "java" | "csharp";

export interface SdkGenerationResult {
  language: SdkLanguage;
  isReal: boolean;
  source?: string;
  note?: string;
}

// ============================================================================
// API Analytics
// ============================================================================

export interface ApiRequestRecord {
  contractId: string;
  organizationId?: string;
  workspaceId?: string;
  version: ApiVersion;
  statusCode: number;
  latencyMs: number;
  recordedAt: string;
}

export interface EndpointAnalyticsSummary {
  contractId: string;
  requestCount: number;
  errorCount: number;
  successRate: number;
  averageLatencyMs: number;
}

// ============================================================================
// GraphQL Readiness (NOT implemented — "Do NOT implement GraphQL execution")
// ============================================================================

export interface GraphQLFieldDefinition {
  name: string;
  type: string;
  args?: Record<string, string>;
}

export interface GraphQLSchemaDefinition {
  typeName: string;
  fields: GraphQLFieldDefinition[];
}

/** Declared, never invoked — a future phase would provide a real resolver map and an execution engine (e.g. graphql-js). */
export type GraphQLResolver = (args: Record<string, unknown>, ctx: GatewayRequestContext) => Promise<unknown>;

export interface FederationReadiness {
  serviceName: string;
  ownedTypes: string[];
}

// ============================================================================
// WebSocket Readiness (NOT implemented)
// ============================================================================

export type RealtimeChannelKind = "notifications" | "dashboard" | "collaboration" | "ai_stream";

export interface RealtimeChannelDefinition {
  channel: string;
  kind: RealtimeChannelKind;
  description: string;
}
