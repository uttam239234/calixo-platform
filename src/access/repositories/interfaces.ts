/**
 * Calixo Platform - Access Repository Interfaces
 *
 * Repository pattern interfaces for access management data access.
 */

import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamMembership,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission,
  RolePermissionAssignment,
  UserRoleAssignment,
  Policy,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyAssignment,
  AuditEvent,
  PaginatedTeams,
  PaginatedMembers,
  PaginatedRoles,
  PaginatedPermissions,
  PaginatedPolicies,
  PaginatedAuditEvents,
} from '@/access/types';

// ============================================================================
// Team Repository
// ============================================================================

export interface TeamRepository {
  getById(id: string): Promise<Team | null>;
  getByOrganization(organizationId: string): Promise<Team[]>;
  getByWorkspace(workspaceId: string): Promise<Team[]>;
  getByDepartment(departmentId: string): Promise<Team[]>;
  getByOwner(ownerId: string): Promise<Team[]>;
  getPaginated(params: {
    organizationId?: string;
    workspaceId?: string;
    page?: number;
    limit?: number;
    search?: string;
    isArchived?: boolean;
  }): Promise<PaginatedTeams>;
  create(data: CreateTeamRequest): Promise<Team>;
  update(id: string, data: UpdateTeamRequest): Promise<Team>;
  archive(id: string): Promise<Team>;
  unarchive(id: string): Promise<Team>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(organizationId: string): Promise<number>;
}

// ============================================================================
// Team Membership Repository
// ============================================================================

export interface TeamMembershipRepository {
  getById(id: string): Promise<TeamMembership | null>;
  getByTeam(teamId: string): Promise<TeamMembership[]>;
  getByUser(userId: string): Promise<TeamMembership[]>;
  getByUserAndTeam(userId: string, teamId: string): Promise<TeamMembership | null>;
  getPaginated(params: {
    teamId: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedMembers>;
  addMember(teamId: string, userId: string, role?: string, isManager?: boolean): Promise<TeamMembership>;
  updateRole(id: string, role: string): Promise<TeamMembership>;
  setManager(id: string, isManager: boolean): Promise<TeamMembership>;
  removeMember(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<TeamMembership>;
  countByTeam(teamId: string): Promise<number>;
  isMember(userId: string, teamId: string): Promise<boolean>;
}

// ============================================================================
// Department Repository
// ============================================================================

export interface DepartmentRepository {
  getById(id: string): Promise<Department | null>;
  getByOrganization(organizationId: string): Promise<Department[]>;
  getBySlug(organizationId: string, slug: string): Promise<Department | null>;
  getSystemDepartments(organizationId: string): Promise<Department[]>;
  getCustomDepartments(organizationId: string): Promise<Department[]>;
  create(data: CreateDepartmentRequest): Promise<Department>;
  update(id: string, data: UpdateDepartmentRequest): Promise<Department>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(organizationId: string): Promise<number>;
}

// ============================================================================
// Role Repository
// ============================================================================

export interface RoleRepository {
  getById(id: string): Promise<Role | null>;
  getBySlug(slug: string): Promise<Role | null>;
  getByName(name: string): Promise<Role | null>;
  getAll(): Promise<Role[]>;
  getSystemRoles(): Promise<Role[]>;
  getCustomRoles(): Promise<Role[]>;
  getPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    isSystem?: boolean;
  }): Promise<PaginatedRoles>;
  create(data: CreateRoleRequest): Promise<Role>;
  /** Additive — Enterprise Integration & Connector Platform (Track 1 Phase 5) bug fix: `create()` always hardcoded `isSystem: false`, so `initializeSystemRoles()`'s seeded roles (Owner, Admin, ...) were silently mis-flagged as custom — `getSystemRoles()` always returned empty and the `isSystem` modify/delete guard never protected them. This is the only path that sets `isSystem: true`. */
  createSystemRole(data: CreateRoleRequest & { priority: number }): Promise<Role>;
  update(id: string, data: UpdateRoleRequest): Promise<Role>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

// ============================================================================
// Permission Repository
// ============================================================================

export interface PermissionRepository {
  getById(id: string): Promise<Permission | null>;
  getByName(name: string): Promise<Permission | null>;
  getAll(): Promise<Permission[]>;
  getByModule(module: string): Promise<Permission[]>;
  getByResource(module: string, resource: string): Promise<Permission[]>;
  getPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
  }): Promise<PaginatedPermissions>;
  create(permission: Permission): Promise<Permission>;
  createMany(permissions: Permission[]): Promise<number>;
  delete(id: string): Promise<boolean>;
  exists(name: string): Promise<boolean>;
}

// ============================================================================
// Role-Permission Assignment Repository
// ============================================================================

export interface RolePermissionAssignmentRepository {
  getByRole(roleId: string): Promise<RolePermissionAssignment[]>;
  getByPermission(permissionId: string): Promise<RolePermissionAssignment[]>;
  assign(roleId: string, permissionId: string, isDenied?: boolean): Promise<RolePermissionAssignment>;
  remove(roleId: string, permissionId: string): Promise<boolean>;
  removeAllByRole(roleId: string): Promise<number>;
  hasPermission(roleId: string, permissionName: string): Promise<boolean>;
  getPermissionNamesByRole(roleId: string): Promise<string[]>;
}

// ============================================================================
// User Role Assignment Repository
// ============================================================================

export interface UserRoleAssignmentRepository {
  getById(id: string): Promise<UserRoleAssignment | null>;
  getByUser(userId: string): Promise<UserRoleAssignment[]>;
  getByRole(roleId: string): Promise<UserRoleAssignment[]>;
  getByOrganization(organizationId: string): Promise<UserRoleAssignment[]>;
  getByUserAndOrganization(userId: string, organizationId: string): Promise<UserRoleAssignment[]>;
  assign(data: {
    userId: string;
    roleId: string;
    organizationId?: string;
    workspaceId?: string;
    teamId?: string;
    grantedBy?: string;
    expiresAt?: string;
  }): Promise<UserRoleAssignment>;
  remove(id: string): Promise<boolean>;
  removeByUserAndRole(userId: string, roleId: string): Promise<boolean>;
  deactivate(id: string): Promise<UserRoleAssignment>;
  activate(id: string): Promise<UserRoleAssignment>;
  getPermissionNamesByUser(userId: string, organizationId?: string): Promise<string[]>;
  getRoleNamesByUser(userId: string, organizationId?: string): Promise<string[]>;
  /** Keeps this repository's own roleId->permissionName index in sync with `RolePermissionAssignmentRepository` — `RoleService` calls this whenever a role's permissions change (create/update/system-role init) so `getPermissionNamesByUser()` can resolve them without a second repository reference. */
  setRolePermissions(roleId: string, permissions: string[]): void;
}

// ============================================================================
// Policy Repository
// ============================================================================

export interface PolicyRepository {
  getById(id: string): Promise<Policy | null>;
  getAll(): Promise<Policy[]>;
  getByType(type: string): Promise<Policy[]>;
  getEnabled(): Promise<Policy[]>;
  getPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    isEnabled?: boolean;
  }): Promise<PaginatedPolicies>;
  create(data: CreatePolicyRequest): Promise<Policy>;
  update(id: string, data: UpdatePolicyRequest): Promise<Policy>;
  enable(id: string): Promise<Policy>;
  disable(id: string): Promise<Policy>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

// ============================================================================
// Policy Assignment Repository
// ============================================================================

export interface PolicyAssignmentRepository {
  getById(id: string): Promise<PolicyAssignment | null>;
  getByPolicy(policyId: string): Promise<PolicyAssignment[]>;
  getByEntity(entityType: string, entityId: string): Promise<PolicyAssignment[]>;
  assign(policyId: string, entityType: string, entityId: string): Promise<PolicyAssignment>;
  remove(id: string): Promise<boolean>;
  removeByPolicyAndEntity(policyId: string, entityType: string, entityId: string): Promise<boolean>;
  isAssigned(policyId: string, entityType: string, entityId: string): Promise<boolean>;
}

// ============================================================================
// Audit Event Repository
// ============================================================================

export interface AuditEventRepository {
  getById(id: string): Promise<AuditEvent | null>;
  getByOrganization(organizationId: string): Promise<AuditEvent[]>;
  getByUser(userId: string): Promise<AuditEvent[]>;
  getByEventType(eventType: string): Promise<AuditEvent[]>;
  getPaginated(params: {
    organizationId?: string;
    page?: number;
    limit?: number;
    eventType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedAuditEvents>;
  create(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
  deleteOlderThan(date: string): Promise<number>;
}