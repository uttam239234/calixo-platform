/**
 * Calixo Platform - Enterprise Access Management Types
 *
 * Core types for the Enterprise Access Management Platform.
 * These types support single org, multi-org, workspaces, departments,
 * teams, roles, permissions, policies, and subscription-based access.
 */

// ============================================================================
// Enums
// ============================================================================

export type AccessEntityType = 'organization' | 'workspace' | 'department' | 'team';

export type PolicyType =
  | 'organization'
  | 'workspace'
  | 'team'
  | 'feature'
  | 'subscription'
  | 'time_based'
  // Additive — Enterprise Access Control Platform (Track 1 Phase 3). Purely a
  // categorization label: `AuthorizationEngine.evaluatePolicies()` never
  // switches on `policy.type`, only `scope`/`conditions`/`effect`/`priority`,
  // so adding new categories here changes no existing evaluation behavior.
  | 'brand'
  | 'resource'
  | 'connector'
  | 'ai'
  | 'api'
  | 'location'
  | 'device'
  | 'delegation'
  | 'approval';

export type PolicyEffect = 'allow' | 'deny';

export type PolicyConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between' | 'exists';

export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'archived';

export type AuditEventType =
  | 'permission_granted'
  | 'permission_revoked'
  | 'role_assigned'
  | 'role_removed'
  | 'team_created'
  | 'team_updated'
  | 'team_deleted'
  | 'team_archived'
  | 'department_created'
  | 'department_updated'
  | 'department_deleted'
  | 'policy_created'
  | 'policy_updated'
  | 'policy_deleted'
  | 'policy_changed'
  | 'authorization_granted'
  | 'authorization_denied'
  | 'authorization_failure'
  | 'membership_added'
  | 'membership_removed'
  | 'membership_changed'
  // Additive — Enterprise Data & Persistence Platform (Track 1 Phase 4). Same
  // safety reasoning as `PolicyType` above: `AuditService`/`InMemoryAuditEventRepository`
  // only ever store/filter `eventType` by equality, never switch on it.
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'entity_restored'
  | 'entity_version_created'
  | 'transaction_committed'
  | 'transaction_rolled_back'
  // Additive — production identity migration (Round 18). Real Clerk session
  // lifecycle events, forwarded via a verified Clerk webhook
  // (`src/app/api/webhooks/clerk/route.ts`) rather than simulated.
  | 'session_created'
  | 'session_ended'
  | 'organization_switched'
  // Additive — Internal Platform Secrets Console. Every write against a
  // platform-level secret (never the plaintext itself — see
  // `core/platform/secrets/PlatformSecretsEngine.ts`).
  | 'secret_added'
  | 'secret_updated'
  | 'secret_rotated'
  | 'secret_validated'
  | 'secret_connection_tested'
  // Additive — Platform Owner bootstrap access control. Real login/role/
  // access-attempt events for the platform role model (see
  // identity/platformRole.ts).
  | 'platform_admin_login'
  | 'platform_role_assigned'
  | 'platform_access_granted'
  | 'platform_access_denied'
  // Additive — Entitlement Enforcement (backend, not UI-hiding). Every real
  // decision `EntitlementService` makes, whether granted or denied — see
  // `core/platform/access/EntitlementService.ts`.
  | 'module_denied'
  | 'ai_credit_denied'
  | 'ai_credit_consumed'
  | 'credits_purchased'
  | 'limit_exceeded'
  | 'upgrade_triggered'
  | 'plan_changed'
  // Additive — Adaptive Workspace OS (widget/layout enforcement). Real
  // layout mutations against `DashboardLayoutRegistry`, one event per
  // detected change — see `core/platform/dashboardBuilder/serverActions.ts`.
  | 'widget_moved'
  | 'widget_resized'
  | 'widget_hidden'
  | 'widget_shown'
  | 'widget_pinned'
  | 'widget_duplicated'
  | 'widget_removed'
  | 'layout_reset'
  | 'layout_created'
  | 'template_applied';

// ============================================================================
// Team
// ============================================================================

export interface Team {
  id: string;
  organizationId: string;
  workspaceId: string;
  departmentId?: string;
  parentTeamId?: string;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  isArchived: boolean;
  archivedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  organizationId: string;
  workspaceId: string;
  departmentId?: string;
  parentTeamId?: string;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatar?: string;
  departmentId?: string;
  parentTeamId?: string;
}

// ============================================================================
// Team Membership
// ============================================================================

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  isManager: boolean;
  joinedAt: string;
  status: MembershipStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type TeamMemberRole = 'owner' | 'manager' | 'member';

// ============================================================================
// Department
// ============================================================================

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  isCustom: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  organizationId: string;
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
}

// ============================================================================
// Role
// ============================================================================

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  isCustom: boolean;
  priority: number;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ============================================================================
// Permission
// ============================================================================

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  resource: string;
  action: string;
  isSystem: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionDefinition {
  name: string;
  description: string;
  module: string;
  resource: string;
  action: string;
}

// ============================================================================
// Role-Permission Assignment
// ============================================================================

export interface RolePermissionAssignment {
  id: string;
  roleId: string;
  permissionId: string;
  isDenied: boolean;
  conditions?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================================
// User Role Assignment
// ============================================================================

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Policy
// ============================================================================

export interface Policy {
  id: string;
  name: string;
  description?: string;
  type: PolicyType;
  effect: PolicyEffect;
  priority: number;
  conditions?: PolicyCondition[];
  scope: PolicyScope;
  isEnabled: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyCondition {
  field: string;
  operator: PolicyConditionOperator;
  value: unknown;
}

export interface PolicyScope {
  organizationIds?: string[];
  workspaceIds?: string[];
  teamIds?: string[];
  roleIds?: string[];
  userIds?: string[];
  featureKeys?: string[];
  subscriptionTiers?: string[];
}

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  type: PolicyType;
  effect: PolicyEffect;
  priority?: number;
  conditions?: PolicyCondition[];
  scope: PolicyScope;
  isEnabled?: boolean;
}

export interface UpdatePolicyRequest {
  name?: string;
  description?: string;
  effect?: PolicyEffect;
  priority?: number;
  conditions?: PolicyCondition[];
  scope?: PolicyScope;
  isEnabled?: boolean;
}

// ============================================================================
// Policy Assignment
// ============================================================================

export interface PolicyAssignment {
  id: string;
  policyId: string;
  entityType: AccessEntityType;
  entityId: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Authorization
// ============================================================================

export interface AuthorizationRequest {
  userId: string;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  context?: Record<string, unknown>;
}

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  source: AuthorizationSource;
  evaluatedPolicies?: string[];
  evaluatedRoles?: string[];
  metadata?: Record<string, unknown>;
}

export type AuthorizationSource = 'role' | 'permission' | 'policy' | 'feature_flag' | 'subscription' | 'ownership' | 'denied';

// ============================================================================
// Feature Access
// ============================================================================

export interface FeatureAccess {
  featureKey: string;
  requiredPermission?: string;
  requiredFeatureFlag?: string;
  requiredSubscriptionTier?: string;
  visibilityRules?: VisibilityRule[];
}

export interface VisibilityRule {
  field: string;
  operator: PolicyConditionOperator;
  value: unknown;
}

// ============================================================================
// Audit Event
// ============================================================================

export interface AuditEvent {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  userId: string;
  eventType: AuditEventType;
  resource: string;
  resourceId?: string;
  description: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// Access Context
// ============================================================================

export interface AccessContext {
  userId: string;
  organizationId?: string;
  organizationSlug?: string;
  workspaceId?: string;
  workspaceSlug?: string;
  teamId?: string;
  departmentId?: string;
  roleIds: string[];
  permissions: string[];
  subscriptionTier?: string;
  isOwner: boolean;
  isSuperAdmin: boolean;
}

// ============================================================================
// Membership
// ============================================================================

export interface Membership {
  id: string;
  userId: string;
  entityType: AccessEntityType;
  entityId: string;
  role: string;
  status: MembershipStatus;
  joinedAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface PaginatedTeams {
  data: Team[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMembers {
  data: TeamMembership[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedRoles {
  data: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPermissions {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPolicies {
  data: Policy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAuditEvents {
  data: AuditEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}