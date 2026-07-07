/**
 * Calixo Platform - Enterprise Data & Persistence Platform Types
 *
 * The canonical entity contract and shared data-platform types every new
 * entity/repository/engine in this package builds on. This is additive,
 * standalone infrastructure — it does not replace any existing module's
 * entity shape (Prompt, Role, Organization, ...); modules keep their own
 * types. `BaseEntity` is what NEW cross-cutting persistence code (and any
 * module that opts in going forward) is measured against.
 */

// ============================================================================
// Canonical Domain Model
// ============================================================================

export type EntityStatus =
  | "draft"
  | "active"
  | "published"
  | "archived"
  | "deleted"
  | "restored"
  | "expired"
  | "locked"
  | "pending_approval";

/** Every field the Data Architecture Audit found repeated (in comment form only) across `prisma/schema.prisma`'s 40+ models — promoted here into one real, enforced TypeScript contract. */
export interface BaseEntity {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  brandId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version: number;
  status: EntityStatus;
  metadata?: Record<string, unknown>;
  tags?: string[];
  labels?: Record<string, string>;
  isDeleted: boolean;
  deletedAt?: string;
}

/** Tenant addressing subset of `BaseEntity`, mirroring `PlatformEventTenant` — what repository queries scope by. */
export interface TenantScope {
  organizationId?: string;
  workspaceId?: string;
  brandId?: string;
}

export interface AuditStamp {
  createdBy?: string;
  updatedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// Query Objects — Filtering, Sorting, Pagination, Specifications
// ============================================================================

export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "exists";

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface SortSpec {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryObject {
  filters?: FilterCondition[];
  sort?: SortSpec[];
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
  scope?: TenantScope;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** A composable predicate over `T` — the "Specifications" pattern the mandate asks for, so callers can combine reusable business rules (`isActive.and(belongsToOrg(id))`) instead of ad hoc filter arrays. */
export interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// ============================================================================
// Versioning Platform
// ============================================================================

export interface VersionSnapshot<T = unknown> {
  entityType: string;
  entityId: string;
  version: number;
  data: T;
  recordedAt: string;
  recordedBy?: string;
  label?: string;
}

// ============================================================================
// Transaction Platform (Unit of Work)
// ============================================================================

export type TransactionOperationKind = "create" | "update" | "delete" | "restore";

export interface TransactionOperation {
  entityType: string;
  kind: TransactionOperationKind;
  execute(): Promise<void> | void;
  rollback(): Promise<void> | void;
}

export type TransactionStatus = "open" | "committed" | "rolled_back";

// ============================================================================
// Cache Platform
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}

// ============================================================================
// Search Platform
// ============================================================================

export interface SearchDocument {
  id: string;
  entityType: string;
  title: string;
  body?: string;
  organizationId?: string;
  workspaceId?: string;
  tags?: string[];
  updatedAt?: string;
}

export interface SearchQuery {
  text: string;
  entityType?: string;
  organizationId?: string;
  workspaceId?: string;
  tags?: string[];
  limit?: number;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
}

/** Declared, not implemented this phase — see `SearchEngine`'s documented limitation. */
export type SearchMode = "full_text" | "hybrid" | "vector" | "semantic";

// ============================================================================
// Storage Platform
// ============================================================================

export type StorageProviderKind = "local" | "s3" | "azure_blob" | "gcs" | "minio" | "do_spaces";

export interface StorageObjectMeta {
  key: string;
  provider: StorageProviderKind;
  contentType: string;
  sizeBytes: number;
  organizationId?: string;
  workspaceId?: string;
  category?: "image" | "video" | "document" | "report" | "asset" | "ai_generated" | "creative" | "other";
  createdAt: string;
}

// ============================================================================
// Migration Platform
// ============================================================================

export interface MigrationDefinition {
  id: string;
  name: string;
  description?: string;
  up: () => Promise<void> | void;
  down?: () => Promise<void> | void;
}

export interface MigrationRecord {
  id: string;
  name: string;
  appliedAt: string;
  rolledBackAt?: string;
}

// ============================================================================
// Schema Platform
// ============================================================================

export interface EntityFieldDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "json" | "array";
  required: boolean;
}

export interface EntitySchemaDefinition {
  entityType: string;
  fields: EntityFieldDefinition[];
  extendsBaseEntity: boolean;
}

// ============================================================================
// Repository Registry
// ============================================================================

export type RepositoryOrigin = "generic" | "existing_module";

export interface RepositoryRegistration {
  entityType: string;
  module: string;
  kind: string;
  origin: RepositoryOrigin;
  count(): number;
}
