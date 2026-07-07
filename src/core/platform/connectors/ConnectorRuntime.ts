/**
 * Calixo Platform - Connector Runtime (Connection Management + Governance)
 *
 * The lifecycle operations section 6/20 of the mandate asks for — install/
 * pause/resume/reconnect/disconnect/delete/duplicate/clone/move/share/
 * transfer-ownership — composed over the reused `integrationService`, with
 * every gated operation checked through the Access Control Platform's
 * `resourceAuthorizationAPI` (Phase 3) rather than inventing new permission
 * logic, and every mutation audited + published as a Platform Event.
 */
import { integrationService } from "@/integrations/services/IntegrationService";
import type { Connection, ConnectionId } from "@/integrations/types";
import { resourceAuthorizationAPI } from "@/core/platform/access";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import { auditService } from "@/access/audit/AuditService";
import type { TenantContext } from "@/core/platform/tenant";
import type { ConnectorOwnership, ConnectorOwnershipRole } from "./types";

export class ConnectorRuntimeError extends Error {
  constructor(public readonly reasonCode: string, message: string) {
    super(message);
  }
}

export class ConnectorRuntime {
  private ownerships = new Map<ConnectionId, ConnectorOwnership>();

  private async requirePermission(tenantContext: TenantContext, operation: "read" | "write" | "admin" | "reconnect" | "disconnect" | "sync" | "delete", connectionId: string): Promise<void> {
    const decision = await resourceAuthorizationAPI.canOperateConnector(tenantContext, operation, connectionId);
    if (!decision.allowed) {
      throw new ConnectorRuntimeError(decision.reasonCode, decision.explanation);
    }
  }

  async install(tenantContext: TenantContext, providerId: string, config: Record<string, unknown>): Promise<Connection> {
    const decision = await resourceAuthorizationAPI.canCreate(tenantContext, "connector");
    if (!decision.allowed) throw new ConnectorRuntimeError(decision.reasonCode, decision.explanation);

    const created = await integrationService.createConnection(tenantContext.organization.organizationId, providerId, config);
    const connection = await integrationService.connect(created.id);

    this.ownerships.set(connection.id, {
      connectionId: connection.id,
      organizationId: tenantContext.organization.organizationId,
      workspaceId: tenantContext.workspace.workspaceId,
      brandId: tenantContext.brand.brandId,
      ownerId: tenantContext.user.userId,
      sharedWith: [],
    });

    await auditService.recordEvent({
      organizationId: tenantContext.organization.organizationId,
      workspaceId: tenantContext.workspace.workspaceId,
      userId: tenantContext.user.userId,
      eventType: "entity_created",
      resource: "connector",
      resourceId: connection.id,
      description: `Connector installed: ${providerId}`,
    });
    await platformEventBus.publish({ type: "ConnectorInstalled", organizationId: tenantContext.organization.organizationId, userId: tenantContext.user.userId, payload: { providerId, connectionId: connection.id } });

    return connection;
  }

  async pause(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    await this.requirePermission(tenantContext, "write", connectionId);
    return integrationService.pause(connectionId);
  }

  async resume(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    await this.requirePermission(tenantContext, "write", connectionId);
    return integrationService.resume(connectionId);
  }

  async reconnect(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    await this.requirePermission(tenantContext, "reconnect", connectionId);
    const connection = await integrationService.connect(connectionId);
    await platformEventBus.publish({ type: "ConnectorConnected", organizationId: tenantContext.organization.organizationId, userId: tenantContext.user.userId, payload: { connectionId } });
    return connection;
  }

  async disconnect(tenantContext: TenantContext, connectionId: string): Promise<void> {
    await this.requirePermission(tenantContext, "disconnect", connectionId);
    await integrationService.disconnect(connectionId);
    await platformEventBus.publish({ type: "ConnectorDisconnected", organizationId: tenantContext.organization.organizationId, userId: tenantContext.user.userId, payload: { connectionId } });
  }

  async delete(tenantContext: TenantContext, connectionId: string): Promise<void> {
    await this.requirePermission(tenantContext, "delete", connectionId);
    await integrationService.deleteConnection(connectionId);
    this.ownerships.delete(connectionId);
    await auditService.recordEvent({
      organizationId: tenantContext.organization.organizationId,
      userId: tenantContext.user.userId,
      eventType: "entity_deleted",
      resource: "connector",
      resourceId: connectionId,
      description: `Connector deleted: ${connectionId}`,
    });
    await platformEventBus.publish({ type: "ConnectorUninstalled", organizationId: tenantContext.organization.organizationId, userId: tenantContext.user.userId, payload: { connectionId } });
  }

  async duplicate(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    await this.requirePermission(tenantContext, "write", connectionId);
    const duplicate = await integrationService.duplicateConnection(connectionId);
    const original = this.ownerships.get(connectionId);
    this.ownerships.set(duplicate.id, {
      connectionId: duplicate.id,
      organizationId: original?.organizationId ?? tenantContext.organization.organizationId,
      workspaceId: original?.workspaceId,
      brandId: original?.brandId,
      ownerId: tenantContext.user.userId,
      sharedWith: [],
    });
    return duplicate;
  }

  /** "Clone" — same as duplicate, but explicitly reset to a fresh (disconnected) auth state so the clone requires its own re-authorization rather than inheriting sealed credentials. */
  async clone(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    const duplicate = await this.duplicate(tenantContext, connectionId);
    return integrationService.updateConnection(duplicate.id, {});
  }

  /** Move — reassign organization/workspace/brand ownership. */
  async move(tenantContext: TenantContext, connectionId: string, destination: { workspaceId?: string; brandId?: string }): Promise<ConnectorOwnership> {
    await this.requirePermission(tenantContext, "admin", connectionId);
    const ownership = this.ownerships.get(connectionId);
    if (!ownership) throw new ConnectorRuntimeError("resource_not_found", `Connector ${connectionId} has no ownership record`);
    if (destination.workspaceId !== undefined) ownership.workspaceId = destination.workspaceId;
    if (destination.brandId !== undefined) ownership.brandId = destination.brandId;
    return { ...ownership };
  }

  async share(tenantContext: TenantContext, connectionId: string, userId: string, role: ConnectorOwnershipRole): Promise<ConnectorOwnership> {
    const decision = await resourceAuthorizationAPI.can(tenantContext, "connector", "share", { resourceId: connectionId, organizationId: tenantContext.organization.organizationId });
    if (!decision.allowed) throw new ConnectorRuntimeError(decision.reasonCode, decision.explanation);

    const ownership = this.ownerships.get(connectionId);
    if (!ownership) throw new ConnectorRuntimeError("resource_not_found", `Connector ${connectionId} has no ownership record`);
    ownership.sharedWith = [...ownership.sharedWith.filter(s => s.userId !== userId), { userId, role }];
    return { ...ownership };
  }

  async transferOwnership(tenantContext: TenantContext, connectionId: string, newOwnerId: string): Promise<ConnectorOwnership> {
    const decision = await resourceAuthorizationAPI.canAdmin(tenantContext, "connector", { resourceId: connectionId, organizationId: tenantContext.organization.organizationId });
    if (!decision.allowed) throw new ConnectorRuntimeError(decision.reasonCode, decision.explanation);

    const ownership = this.ownerships.get(connectionId);
    if (!ownership) throw new ConnectorRuntimeError("resource_not_found", `Connector ${connectionId} has no ownership record`);
    ownership.ownerId = newOwnerId;
    return { ...ownership };
  }

  getOwnership(connectionId: string): ConnectorOwnership | undefined {
    return this.ownerships.get(connectionId);
  }

  count(): number {
    return this.ownerships.size;
  }
}

export const connectorRuntime = new ConnectorRuntime();
