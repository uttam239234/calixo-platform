/**
 * Calixo Platform - Access Repository Implementations
 *
 * In-memory implementations of access management repositories.
 * These can be replaced with Prisma-based implementations when the database is connected.
 */

import { generateId, slugify } from '@/shared/utils/string';
import { appLogger } from '@/logging';
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
import type {
  TeamRepository,
  TeamMembershipRepository,
  DepartmentRepository,
  RoleRepository,
  PermissionRepository,
  RolePermissionAssignmentRepository,
  UserRoleAssignmentRepository,
  PolicyRepository,
  PolicyAssignmentRepository,
  AuditEventRepository,
} from './interfaces';

// ============================================================================
// In-Memory Team Repository
// ============================================================================

export class InMemoryTeamRepository implements TeamRepository {
  private teams: Map<string, Team> = new Map();

  async getById(id: string): Promise<Team | null> {
    return this.teams.get(id) || null;
  }

  async getByOrganization(organizationId: string): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(t => t.organizationId === organizationId && !t.isDeleted);
  }

  async getByWorkspace(workspaceId: string): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(t => t.workspaceId === workspaceId && !t.isDeleted);
  }

  async getByDepartment(departmentId: string): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(t => t.departmentId === departmentId && !t.isDeleted);
  }

  async getByOwner(ownerId: string): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(t => t.ownerId === ownerId && !t.isDeleted);
  }

  async getPaginated(params: {
    organizationId?: string;
    workspaceId?: string;
    page?: number;
    limit?: number;
    search?: string;
    isArchived?: boolean;
  }): Promise<PaginatedTeams> {
    let filtered = Array.from(this.teams.values()).filter(t => !t.isDeleted);

    if (params.organizationId) {
      filtered = filtered.filter(t => t.organizationId === params.organizationId);
    }
    if (params.workspaceId) {
      filtered = filtered.filter(t => t.workspaceId === params.workspaceId);
    }
    if (params.isArchived !== undefined) {
      filtered = filtered.filter(t => t.isArchived === params.isArchived);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(search));
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async create(data: CreateTeamRequest): Promise<Team> {
    const now = new Date().toISOString();
    const team: Team = {
      id: generateId(16),
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      departmentId: data.departmentId,
      parentTeamId: data.parentTeamId,
      name: data.name,
      description: data.description,
      avatar: data.avatar,
      ownerId: data.ownerId,
      isArchived: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.teams.set(team.id, team);
    appLogger.info('TeamRepository', `Team created: ${team.name} (${team.id})`);
    return { ...team };
  }

  async update(id: string, data: UpdateTeamRequest): Promise<Team> {
    const team = this.teams.get(id);
    if (!team || team.isDeleted) throw new Error('Team not found');

    if (data.name !== undefined) team.name = data.name;
    if (data.description !== undefined) team.description = data.description;
    if (data.avatar !== undefined) team.avatar = data.avatar;
    if (data.departmentId !== undefined) team.departmentId = data.departmentId;
    if (data.parentTeamId !== undefined) team.parentTeamId = data.parentTeamId;
    team.updatedAt = new Date().toISOString();

    this.teams.set(id, team);
    return { ...team };
  }

  async archive(id: string): Promise<Team> {
    const team = this.teams.get(id);
    if (!team || team.isDeleted) throw new Error('Team not found');
    team.isArchived = true;
    team.archivedAt = new Date().toISOString();
    team.updatedAt = team.archivedAt;
    this.teams.set(id, team);
    return { ...team };
  }

  async unarchive(id: string): Promise<Team> {
    const team = this.teams.get(id);
    if (!team || team.isDeleted) throw new Error('Team not found');
    team.isArchived = false;
    team.archivedAt = undefined;
    team.updatedAt = new Date().toISOString();
    this.teams.set(id, team);
    return { ...team };
  }

  async delete(id: string): Promise<boolean> {
    const team = this.teams.get(id);
    if (!team || team.isDeleted) return false;
    team.isDeleted = true;
    team.deletedAt = new Date().toISOString();
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const team = this.teams.get(id);
    return !!team && !team.isDeleted;
  }

  async count(organizationId: string): Promise<number> {
    return Array.from(this.teams.values())
      .filter(t => t.organizationId === organizationId && !t.isDeleted)
      .length;
  }
}

// ============================================================================
// In-Memory Team Membership Repository
// ============================================================================

export class InMemoryTeamMembershipRepository implements TeamMembershipRepository {
  private memberships: Map<string, TeamMembership> = new Map();

  async getById(id: string): Promise<TeamMembership | null> {
    return this.memberships.get(id) || null;
  }

  async getByTeam(teamId: string): Promise<TeamMembership[]> {
    return Array.from(this.memberships.values())
      .filter(m => m.teamId === teamId && m.status !== 'archived');
  }

  async getByUser(userId: string): Promise<TeamMembership[]> {
    return Array.from(this.memberships.values())
      .filter(m => m.userId === userId && m.status !== 'archived');
  }

  async getByUserAndTeam(userId: string, teamId: string): Promise<TeamMembership | null> {
    return Array.from(this.memberships.values())
      .find(m => m.userId === userId && m.teamId === teamId && m.status !== 'archived') || null;
  }

  async getPaginated(params: {
    teamId: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedMembers> {
    let filtered = Array.from(this.memberships.values())
      .filter(m => m.teamId === params.teamId);

    if (params.status) {
      filtered = filtered.filter(m => m.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async addMember(teamId: string, userId: string, role: string = 'member', isManager: boolean = false): Promise<TeamMembership> {
    const now = new Date().toISOString();
    const membership: TeamMembership = {
      id: generateId(16),
      teamId,
      userId,
      role: role as TeamMembership['role'],
      isManager,
      joinedAt: now,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.memberships.set(membership.id, membership);
    return { ...membership };
  }

  async updateRole(id: string, role: string): Promise<TeamMembership> {
    const membership = this.memberships.get(id);
    if (!membership) throw new Error('Membership not found');
    membership.role = role as TeamMembership['role'];
    membership.updatedAt = new Date().toISOString();
    this.memberships.set(id, membership);
    return { ...membership };
  }

  async setManager(id: string, isManager: boolean): Promise<TeamMembership> {
    const membership = this.memberships.get(id);
    if (!membership) throw new Error('Membership not found');
    membership.isManager = isManager;
    membership.updatedAt = new Date().toISOString();
    this.memberships.set(id, membership);
    return { ...membership };
  }

  async removeMember(id: string): Promise<boolean> {
    const membership = this.memberships.get(id);
    if (!membership) return false;
    membership.status = 'archived';
    membership.updatedAt = new Date().toISOString();
    return true;
  }

  async updateStatus(id: string, status: string): Promise<TeamMembership> {
    const membership = this.memberships.get(id);
    if (!membership) throw new Error('Membership not found');
    membership.status = status as TeamMembership['status'];
    membership.updatedAt = new Date().toISOString();
    this.memberships.set(id, membership);
    return { ...membership };
  }

  async countByTeam(teamId: string): Promise<number> {
    return Array.from(this.memberships.values())
      .filter(m => m.teamId === teamId && m.status === 'active')
      .length;
  }

  async isMember(userId: string, teamId: string): Promise<boolean> {
    return Array.from(this.memberships.values())
      .some(m => m.userId === userId && m.teamId === teamId && m.status === 'active');
  }
}

// ============================================================================
// In-Memory Department Repository
// ============================================================================

export class InMemoryDepartmentRepository implements DepartmentRepository {
  private departments: Map<string, Department> = new Map();

  async getById(id: string): Promise<Department | null> {
    return this.departments.get(id) || null;
  }

  async getByOrganization(organizationId: string): Promise<Department[]> {
    return Array.from(this.departments.values())
      .filter(d => d.organizationId === organizationId && !d.isDeleted);
  }

  async getBySlug(organizationId: string, slug: string): Promise<Department | null> {
    return Array.from(this.departments.values())
      .find(d => d.organizationId === organizationId && d.slug === slug && !d.isDeleted) || null;
  }

  async getSystemDepartments(organizationId: string): Promise<Department[]> {
    return Array.from(this.departments.values())
      .filter(d => d.organizationId === organizationId && d.isSystem && !d.isDeleted);
  }

  async getCustomDepartments(organizationId: string): Promise<Department[]> {
    return Array.from(this.departments.values())
      .filter(d => d.organizationId === organizationId && d.isCustom && !d.isDeleted);
  }

  async create(data: CreateDepartmentRequest): Promise<Department> {
    const now = new Date().toISOString();
    const department: Department = {
      id: generateId(16),
      organizationId: data.organizationId,
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      isSystem: false,
      isCustom: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.departments.set(department.id, department);
    return { ...department };
  }

  async update(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const dept = this.departments.get(id);
    if (!dept || dept.isDeleted) throw new Error('Department not found');
    if (data.name !== undefined) {
      dept.name = data.name;
      dept.slug = slugify(data.name);
    }
    if (data.description !== undefined) dept.description = data.description;
    dept.updatedAt = new Date().toISOString();
    this.departments.set(id, dept);
    return { ...dept };
  }

  async delete(id: string): Promise<boolean> {
    const dept = this.departments.get(id);
    if (!dept || dept.isDeleted) return false;
    if (dept.isSystem) throw new Error('Cannot delete system departments');
    dept.isDeleted = true;
    dept.deletedAt = new Date().toISOString();
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const dept = this.departments.get(id);
    return !!dept && !dept.isDeleted;
  }

  async count(organizationId: string): Promise<number> {
    return Array.from(this.departments.values())
      .filter(d => d.organizationId === organizationId && !d.isDeleted)
      .length;
  }
}

// ============================================================================
// In-Memory Role Repository
// ============================================================================

export class InMemoryRoleRepository implements RoleRepository {
  private roles: Map<string, Role> = new Map();

  async getById(id: string): Promise<Role | null> {
    return this.roles.get(id) || null;
  }

  async getBySlug(slug: string): Promise<Role | null> {
    return Array.from(this.roles.values())
      .find(r => r.slug === slug && !r.isDeleted) || null;
  }

  async getByName(name: string): Promise<Role | null> {
    return Array.from(this.roles.values())
      .find(r => r.name === name && !r.isDeleted) || null;
  }

  async getAll(): Promise<Role[]> {
    return Array.from(this.roles.values())
      .filter(r => !r.isDeleted)
      .sort((a, b) => b.priority - a.priority);
  }

  async getSystemRoles(): Promise<Role[]> {
    return Array.from(this.roles.values())
      .filter(r => r.isSystem && !r.isDeleted)
      .sort((a, b) => b.priority - a.priority);
  }

  async getCustomRoles(): Promise<Role[]> {
    return Array.from(this.roles.values())
      .filter(r => r.isCustom && !r.isDeleted)
      .sort((a, b) => b.priority - a.priority);
  }

  async getPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    isSystem?: boolean;
  }): Promise<PaginatedRoles> {
    let filtered = Array.from(this.roles.values()).filter(r => !r.isDeleted);

    if (params.isSystem !== undefined) {
      filtered = filtered.filter(r => r.isSystem === params.isSystem);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(search));
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async create(data: CreateRoleRequest): Promise<Role> {
    const now = new Date().toISOString();
    const role: Role = {
      id: generateId(16),
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      isSystem: false,
      isCustom: true,
      priority: 50,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.roles.set(role.id, role);
    return { ...role };
  }

  async createSystemRole(data: CreateRoleRequest & { priority: number }): Promise<Role> {
    const now = new Date().toISOString();
    const role: Role = {
      id: generateId(16),
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      isSystem: true,
      isCustom: false,
      priority: data.priority,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.roles.set(role.id, role);
    return { ...role };
  }

  async update(id: string, data: UpdateRoleRequest): Promise<Role> {
    const role = this.roles.get(id);
    if (!role || role.isDeleted) throw new Error('Role not found');
    if (role.isSystem) throw new Error('Cannot modify system roles');

    if (data.name !== undefined) {
      role.name = data.name;
      role.slug = slugify(data.name);
    }
    if (data.description !== undefined) role.description = data.description;
    role.updatedAt = new Date().toISOString();
    this.roles.set(id, role);
    return { ...role };
  }

  async delete(id: string): Promise<boolean> {
    const role = this.roles.get(id);
    if (!role || role.isDeleted) return false;
    if (role.isSystem) throw new Error('Cannot delete system roles');
    role.isDeleted = true;
    role.deletedAt = new Date().toISOString();
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const role = this.roles.get(id);
    return !!role && !role.isDeleted;
  }

  seedRoles(roles: Role[]): void {
    for (const role of roles) {
      this.roles.set(role.id, role);
    }
  }
}

// ============================================================================
// In-Memory Permission Repository
// ============================================================================

export class InMemoryPermissionRepository implements PermissionRepository {
  private permissions: Map<string, Permission> = new Map();

  async getById(id: string): Promise<Permission | null> {
    return this.permissions.get(id) || null;
  }

  async getByName(name: string): Promise<Permission | null> {
    return Array.from(this.permissions.values())
      .find(p => p.name === name && !p.isDeleted) || null;
  }

  async getAll(): Promise<Permission[]> {
    return Array.from(this.permissions.values())
      .filter(p => !p.isDeleted);
  }

  async getByModule(module: string): Promise<Permission[]> {
    return Array.from(this.permissions.values())
      .filter(p => p.module === module && !p.isDeleted);
  }

  async getByResource(module: string, resource: string): Promise<Permission[]> {
    return Array.from(this.permissions.values())
      .filter(p => p.module === module && p.resource === resource && !p.isDeleted);
  }

  async getPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
  }): Promise<PaginatedPermissions> {
    let filtered = Array.from(this.permissions.values()).filter(p => !p.isDeleted);

    if (params.module) {
      filtered = filtered.filter(p => p.module === params.module);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async create(permission: Permission): Promise<Permission> {
    this.permissions.set(permission.id, permission);
    return { ...permission };
  }

  async createMany(permissions: Permission[]): Promise<number> {
    let count = 0;
    for (const perm of permissions) {
      if (!this.permissions.has(perm.id)) {
        this.permissions.set(perm.id, perm);
        count++;
      }
    }
    return count;
  }

  async delete(id: string): Promise<boolean> {
    const perm = this.permissions.get(id);
    if (!perm || perm.isDeleted) return false;
    perm.isDeleted = true;
    perm.deletedAt = new Date().toISOString();
    return true;
  }

  async exists(name: string): Promise<boolean> {
    return Array.from(this.permissions.values())
      .some(p => p.name === name && !p.isDeleted);
  }

  seedPermissions(permissions: Permission[]): void {
    for (const perm of permissions) {
      this.permissions.set(perm.id, perm);
    }
  }
}

// ============================================================================
// In-Memory Role-Permission Assignment Repository
// ============================================================================

export class InMemoryRolePermissionAssignmentRepository implements RolePermissionAssignmentRepository {
  private assignments: Map<string, RolePermissionAssignment> = new Map();

  async getByRole(roleId: string): Promise<RolePermissionAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.roleId === roleId);
  }

  async getByPermission(permissionId: string): Promise<RolePermissionAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.permissionId === permissionId);
  }

  async assign(roleId: string, permissionId: string, isDenied: boolean = false): Promise<RolePermissionAssignment> {
    const existing = Array.from(this.assignments.values())
      .find(a => a.roleId === roleId && a.permissionId === permissionId);
    if (existing) {
      existing.isDenied = isDenied;
      return { ...existing };
    }

    const assignment: RolePermissionAssignment = {
      id: generateId(16),
      roleId,
      permissionId,
      isDenied,
      createdAt: new Date().toISOString(),
    };
    this.assignments.set(assignment.id, assignment);
    return { ...assignment };
  }

  async remove(roleId: string, permissionId: string): Promise<boolean> {
    const assignment = Array.from(this.assignments.values())
      .find(a => a.roleId === roleId && a.permissionId === permissionId);
    if (!assignment) return false;
    this.assignments.delete(assignment.id);
    return true;
  }

  async removeAllByRole(roleId: string): Promise<number> {
    const toRemove = Array.from(this.assignments.values())
      .filter(a => a.roleId === roleId);
    for (const a of toRemove) {
      this.assignments.delete(a.id);
    }
    return toRemove.length;
  }

  async hasPermission(roleId: string, _permissionName: string): Promise<boolean> {
    return Array.from(this.assignments.values())
      .some(a => a.roleId === roleId && !a.isDenied);
  }

  async getPermissionNamesByRole(roleId: string): Promise<string[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.roleId === roleId && !a.isDenied)
      .map(a => a.permissionId);
  }
}

// ============================================================================
// In-Memory User Role Assignment Repository
// ============================================================================

export class InMemoryUserRoleAssignmentRepository implements UserRoleAssignmentRepository {
  private assignments: Map<string, UserRoleAssignment> = new Map();
  private rolePermissions: Map<string, string[]> = new Map(); // roleId -> permission names

  setRolePermissions(roleId: string, permissions: string[]): void {
    this.rolePermissions.set(roleId, permissions);
  }

  async getById(id: string): Promise<UserRoleAssignment | null> {
    return this.assignments.get(id) || null;
  }

  async getByUser(userId: string): Promise<UserRoleAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.userId === userId && a.isActive);
  }

  async getByRole(roleId: string): Promise<UserRoleAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.roleId === roleId && a.isActive);
  }

  async getByOrganization(organizationId: string): Promise<UserRoleAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.organizationId === organizationId && a.isActive);
  }

  async getByUserAndOrganization(userId: string, organizationId: string): Promise<UserRoleAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.userId === userId && a.organizationId === organizationId && a.isActive);
  }

  async assign(data: {
    userId: string;
    roleId: string;
    organizationId?: string;
    workspaceId?: string;
    teamId?: string;
    grantedBy?: string;
    expiresAt?: string;
  }): Promise<UserRoleAssignment> {
    const now = new Date().toISOString();
    const assignment: UserRoleAssignment = {
      id: generateId(16),
      userId: data.userId,
      roleId: data.roleId,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      teamId: data.teamId,
      grantedBy: data.grantedBy,
      grantedAt: now,
      expiresAt: data.expiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.assignments.set(assignment.id, assignment);
    return { ...assignment };
  }

  async remove(id: string): Promise<boolean> {
    const assignment = this.assignments.get(id);
    if (!assignment) return false;
    assignment.isActive = false;
    assignment.updatedAt = new Date().toISOString();
    return true;
  }

  async removeByUserAndRole(userId: string, roleId: string): Promise<boolean> {
    const assignment = Array.from(this.assignments.values())
      .find(a => a.userId === userId && a.roleId === roleId && a.isActive);
    if (!assignment) return false;
    assignment.isActive = false;
    assignment.updatedAt = new Date().toISOString();
    return true;
  }

  async deactivate(id: string): Promise<UserRoleAssignment> {
    const assignment = this.assignments.get(id);
    if (!assignment) throw new Error('Assignment not found');
    assignment.isActive = false;
    assignment.updatedAt = new Date().toISOString();
    return { ...assignment };
  }

  async activate(id: string): Promise<UserRoleAssignment> {
    const assignment = this.assignments.get(id);
    if (!assignment) throw new Error('Assignment not found');
    assignment.isActive = true;
    assignment.updatedAt = new Date().toISOString();
    return { ...assignment };
  }

  /**
   * Tenant-scoped: an assignment only applies when either it carries no
   * `organizationId` (a genuine global/platform-wide grant) or its
   * `organizationId` matches the one being queried. Found during the Track
   * 1 Enterprise Platform Certification: this previously ignored
   * `organizationId` entirely, so a user's wildcard/owner role in
   * Organization A was granted in every other organization they had any
   * active assignment in — a real cross-tenant privilege escalation, not
   * just a caller-discipline gap, since `AuthorizationEngine` already
   * threads `organizationId` all the way down to this call correctly.
   */
  async getPermissionNamesByUser(userId: string, organizationId?: string): Promise<string[]> {
    const userAssignments = Array.from(this.assignments.values())
      .filter(a => a.userId === userId && a.isActive)
      .filter(a => !organizationId || !a.organizationId || a.organizationId === organizationId);

    const permissionSet = new Set<string>();
    for (const assignment of userAssignments) {
      const perms = this.rolePermissions.get(assignment.roleId) || [];
      for (const perm of perms) {
        if (perm === '*') {
          // Wildcard - return a special marker
          return ['*'];
        }
        permissionSet.add(perm);
      }
    }
    return Array.from(permissionSet);
  }

  async getRoleNamesByUser(userId: string, organizationId?: string): Promise<string[]> {
    const userAssignments = Array.from(this.assignments.values())
      .filter(a => a.userId === userId && a.isActive)
      .filter(a => !organizationId || !a.organizationId || a.organizationId === organizationId);

    return userAssignments.map(a => a.roleId);
  }
}

// ============================================================================
// In-Memory Policy Repository
// ============================================================================

export class InMemoryPolicyRepository implements PolicyRepository {
  private policies: Map<string, Policy> = new Map();

  async getById(id: string): Promise<Policy | null> {
    return this.policies.get(id) || null;
  }

  async getAll(): Promise<Policy[]> {
    return Array.from(this.policies.values())
      .filter(p => !p.isDeleted);
  }

  async getByType(type: string): Promise<Policy[]> {
    return Array.from(this.policies.values())
      .filter(p => p.type === type && !p.isDeleted);
  }

  async getEnabled(): Promise<Policy[]> {
    return Array.from(this.policies.values())
      .filter(p => p.isEnabled && !p.isDeleted);
  }

  async getPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    isEnabled?: boolean;
  }): Promise<PaginatedPolicies> {
    let filtered = Array.from(this.policies.values()).filter(p => !p.isDeleted);

    if (params.type) filtered = filtered.filter(p => p.type === params.type);
    if (params.isEnabled !== undefined) filtered = filtered.filter(p => p.isEnabled === params.isEnabled);
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async create(data: CreatePolicyRequest): Promise<Policy> {
    const now = new Date().toISOString();
    const policy: Policy = {
      id: generateId(16),
      name: data.name,
      description: data.description,
      type: data.type,
      effect: data.effect,
      priority: data.priority || 0,
      conditions: data.conditions,
      scope: data.scope,
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.policies.set(policy.id, policy);
    return { ...policy };
  }

  async update(id: string, data: UpdatePolicyRequest): Promise<Policy> {
    const policy = this.policies.get(id);
    if (!policy || policy.isDeleted) throw new Error('Policy not found');

    if (data.name !== undefined) policy.name = data.name;
    if (data.description !== undefined) policy.description = data.description;
    if (data.effect !== undefined) policy.effect = data.effect;
    if (data.priority !== undefined) policy.priority = data.priority;
    if (data.conditions !== undefined) policy.conditions = data.conditions;
    if (data.scope !== undefined) policy.scope = data.scope;
    if (data.isEnabled !== undefined) policy.isEnabled = data.isEnabled;
    policy.updatedAt = new Date().toISOString();

    this.policies.set(id, policy);
    return { ...policy };
  }

  async enable(id: string): Promise<Policy> {
    const policy = this.policies.get(id);
    if (!policy || policy.isDeleted) throw new Error('Policy not found');
    policy.isEnabled = true;
    policy.updatedAt = new Date().toISOString();
    return { ...policy };
  }

  async disable(id: string): Promise<Policy> {
    const policy = this.policies.get(id);
    if (!policy || policy.isDeleted) throw new Error('Policy not found');
    policy.isEnabled = false;
    policy.updatedAt = new Date().toISOString();
    return { ...policy };
  }

  async delete(id: string): Promise<boolean> {
    const policy = this.policies.get(id);
    if (!policy || policy.isDeleted) return false;
    policy.isDeleted = true;
    policy.deletedAt = new Date().toISOString();
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const policy = this.policies.get(id);
    return !!policy && !policy.isDeleted;
  }
}

// ============================================================================
// In-Memory Policy Assignment Repository
// ============================================================================

export class InMemoryPolicyAssignmentRepository implements PolicyAssignmentRepository {
  private assignments: Map<string, PolicyAssignment> = new Map();

  async getById(id: string): Promise<PolicyAssignment | null> {
    return this.assignments.get(id) || null;
  }

  async getByPolicy(policyId: string): Promise<PolicyAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.policyId === policyId && a.isActive);
  }

  async getByEntity(entityType: string, entityId: string): Promise<PolicyAssignment[]> {
    return Array.from(this.assignments.values())
      .filter(a => a.entityType === entityType && a.entityId === entityId && a.isActive);
  }

  async assign(policyId: string, entityType: string, entityId: string): Promise<PolicyAssignment> {
    const now = new Date().toISOString();
    const assignment: PolicyAssignment = {
      id: generateId(16),
      policyId,
      entityType: entityType as PolicyAssignment['entityType'],
      entityId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.assignments.set(assignment.id, assignment);
    return { ...assignment };
  }

  async remove(id: string): Promise<boolean> {
    const assignment = this.assignments.get(id);
    if (!assignment) return false;
    assignment.isActive = false;
    assignment.updatedAt = new Date().toISOString();
    return true;
  }

  async removeByPolicyAndEntity(policyId: string, entityType: string, entityId: string): Promise<boolean> {
    const assignment = Array.from(this.assignments.values())
      .find(a => a.policyId === policyId && a.entityType === entityType && a.entityId === entityId && a.isActive);
    if (!assignment) return false;
    assignment.isActive = false;
    assignment.updatedAt = new Date().toISOString();
    return true;
  }

  async isAssigned(policyId: string, entityType: string, entityId: string): Promise<boolean> {
    return Array.from(this.assignments.values())
      .some(a => a.policyId === policyId && a.entityType === entityType && a.entityId === entityId && a.isActive);
  }
}

// ============================================================================
// In-Memory Audit Event Repository
// ============================================================================

export class InMemoryAuditEventRepository implements AuditEventRepository {
  private events: Map<string, AuditEvent> = new Map();

  async getById(id: string): Promise<AuditEvent | null> {
    return this.events.get(id) || null;
  }

  async getByOrganization(organizationId: string): Promise<AuditEvent[]> {
    return Array.from(this.events.values())
      .filter(e => e.organizationId === organizationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByUser(userId: string): Promise<AuditEvent[]> {
    return Array.from(this.events.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByEventType(eventType: string): Promise<AuditEvent[]> {
    return Array.from(this.events.values())
      .filter(e => e.eventType === eventType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getPaginated(params: {
    organizationId?: string;
    page?: number;
    limit?: number;
    eventType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedAuditEvents> {
    let filtered = Array.from(this.events.values());

    if (params.organizationId) filtered = filtered.filter(e => e.organizationId === params.organizationId);
    if (params.eventType) filtered = filtered.filter(e => e.eventType === params.eventType);
    if (params.userId) filtered = filtered.filter(e => e.userId === params.userId);
    if (params.startDate) filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(params.startDate!));
    if (params.endDate) filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(params.endDate!));

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async create(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      ...event,
      id: generateId(16),
      timestamp: new Date().toISOString(),
    };
    this.events.set(auditEvent.id, auditEvent);
    return { ...auditEvent };
  }

  async deleteOlderThan(date: string): Promise<number> {
    const toDelete = Array.from(this.events.values())
      .filter(e => new Date(e.timestamp) < new Date(date));
    for (const event of toDelete) {
      this.events.delete(event.id);
    }
    return toDelete.length;
  }
}