/**
 * Calixo Platform - Audit Logging Service
 *
 * Records all access management events for compliance and security.
 * Events include permission changes, role assignments, team changes,
 * policy changes, and authorization failures.
 */

import type { AuditEvent, AuditEventType, PaginatedAuditEvents } from '@/access/types';
import type { AuditEventRepository } from '@/access/repositories/interfaces';
import { InMemoryAuditEventRepository } from '@/access/repositories/implementations';

export class AuditService {
  private auditRepo: AuditEventRepository;

  constructor(auditRepo?: AuditEventRepository) {
    this.auditRepo = auditRepo || new InMemoryAuditEventRepository();
  }

  /**
   * Record a permission granted event.
   */
  async recordPermissionGranted(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    targetUserId: string;
    permission: string;
    grantedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'permission_granted',
      resource: 'permission',
      resourceId: params.permission,
      description: `Permission '${params.permission}' granted to user ${params.targetUserId}`,
      changes: { targetUserId: params.targetUserId, permission: params.permission, grantedBy: params.grantedBy },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a permission revoked event.
   */
  async recordPermissionRevoked(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    targetUserId: string;
    permission: string;
    revokedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'permission_revoked',
      resource: 'permission',
      resourceId: params.permission,
      description: `Permission '${params.permission}' revoked from user ${params.targetUserId}`,
      changes: { targetUserId: params.targetUserId, permission: params.permission, revokedBy: params.revokedBy },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a role assigned event.
   */
  async recordRoleAssigned(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    targetUserId: string;
    roleName: string;
    assignedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'role_assigned',
      resource: 'role',
      resourceId: params.roleName,
      description: `Role '${params.roleName}' assigned to user ${params.targetUserId}`,
      changes: { targetUserId: params.targetUserId, role: params.roleName, assignedBy: params.assignedBy },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a role removed event.
   */
  async recordRoleRemoved(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    targetUserId: string;
    roleName: string;
    removedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'role_removed',
      resource: 'role',
      resourceId: params.roleName,
      description: `Role '${params.roleName}' removed from user ${params.targetUserId}`,
      changes: { targetUserId: params.targetUserId, role: params.roleName, removedBy: params.removedBy },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a team created event.
   */
  async recordTeamCreated(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    teamId: string;
    teamName: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'team_created',
      resource: 'team',
      resourceId: params.teamId,
      description: `Team '${params.teamName}' created`,
      changes: { teamId: params.teamId, teamName: params.teamName },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a team deleted event.
   */
  async recordTeamDeleted(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    teamId: string;
    teamName: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'team_deleted',
      resource: 'team',
      resourceId: params.teamId,
      description: `Team '${params.teamName}' deleted`,
      changes: { teamId: params.teamId, teamName: params.teamName },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a policy changed event.
   */
  async recordPolicyChanged(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    policyId: string;
    policyName: string;
    changes: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'policy_changed',
      resource: 'policy',
      resourceId: params.policyId,
      description: `Policy '${params.policyName}' changed`,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record an authorization failure event.
   */
  async recordAuthorizationFailure(params: {
    organizationId?: string;
    workspaceId?: string;
    userId: string;
    permission: string;
    resource?: string;
    resourceId?: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: 'authorization_failure',
      resource: params.resource || 'authorization',
      resourceId: params.resourceId,
      description: `Authorization failure for '${params.permission}': ${params.reason}`,
      changes: { permission: params.permission, reason: params.reason },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Record a custom audit event.
   */
  async recordEvent(params: {
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
  }): Promise<AuditEvent> {
    return this.auditRepo.create({
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      eventType: params.eventType,
      resource: params.resource,
      resourceId: params.resourceId,
      description: params.description,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  async getAuditEvent(id: string): Promise<AuditEvent | null> {
    return this.auditRepo.getById(id);
  }

  async getOrganizationAuditLogs(organizationId: string): Promise<AuditEvent[]> {
    return this.auditRepo.getByOrganization(organizationId);
  }

  async getUserAuditLogs(userId: string): Promise<AuditEvent[]> {
    return this.auditRepo.getByUser(userId);
  }

  async getPaginatedAuditLogs(params: {
    organizationId?: string;
    page?: number;
    limit?: number;
    eventType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedAuditEvents> {
    return this.auditRepo.getPaginated(params);
  }

  async deleteOlderThan(days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.auditRepo.deleteOlderThan(date.toISOString());
  }
}

export const auditService = new AuditService();