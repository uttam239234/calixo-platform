/**
 * Calixo Platform - Resource Authorization API
 *
 * The ONE facade every module (Dashboard, Analytics, Ads Manager, Social
 * Media, Brand Monitoring, Content Studio, Creative Composer, Marketing
 * Resource Hub, Reports, Workflow, Assets, Settings, Users, Organizations,
 * Workspaces, Brands, Campaigns, Connectors, Notifications, Billing, AI
 * Conversations, Knowledge Base, Media, Files, and every future module)
 * should call — "no module may implement its own permission logic."
 * Thin sugar over `AuthorizationPlatformAPI.authorize()`.
 */
import { authorizationPlatformAPI } from "./AuthorizationPlatformAPI";
import type { TenantContext } from "../tenant/types";
import type { ActionType, AuthorizationDecision, ResourceContext, ResourceType } from "./types";

export class ResourceAuthorizationAPI {
  can(tenantContext: TenantContext, resourceType: ResourceType, action: ActionType, resourceContext?: Partial<ResourceContext>): Promise<AuthorizationDecision> {
    return authorizationPlatformAPI.authorize(tenantContext, resourceType, action, resourceContext);
  }

  canRead(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "read", resourceContext); }
  canCreate(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "create", resourceContext); }
  canUpdate(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "update", resourceContext); }
  canDelete(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "delete", resourceContext); }
  canPublish(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "publish", resourceContext); }
  canApprove(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "approve", resourceContext); }
  canExport(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "export", resourceContext); }
  canManage(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "manage", resourceContext); }
  canAdmin(tenantContext: TenantContext, resourceType: ResourceType, resourceContext?: Partial<ResourceContext>) { return this.can(tenantContext, resourceType, "admin", resourceContext); }

  /**
   * AI Authorization (section 12) — every skill/tool/agent/workflow/prompt
   * execution should call this before running. Maps onto the standard
   * matrix (`ai:execute`) rather than inventing AI-specific permission
   * names, and genuinely consumes the organization's AI-credit limit via
   * `AuthorizationPlatformAPI`'s subscription gate.
   */
  canExecuteAi(tenantContext: TenantContext, skillOrToolId: string): Promise<AuthorizationDecision> {
    return this.can(tenantContext, "ai", "execute", { organizationId: tenantContext.organization.organizationId, attributes: { skillOrToolId } });
  }

  /**
   * Connector Authorization (section 11) — OAuth-scope-shaped operations
   * mapped onto the standard matrix rather than custom permission names:
   * create->create, read->read, write->update, admin->admin,
   * reconnect->execute, disconnect->delete, sync->execute, delete->delete.
   * `create` is its own operation (not folded into `write`) because
   * installing a brand-new connector instance is a distinct, coarser-grained
   * action than editing an existing one's config — it also reuses the
   * already-wired `connector: { create: "connectorsUsed" }` subscription
   * limit gate (`AuthorizationPlatformAPI.ts`), which no operation reached
   * before this.
   */
  canOperateConnector(tenantContext: TenantContext, operation: "create" | "read" | "write" | "admin" | "reconnect" | "disconnect" | "sync" | "delete", connectorId: string): Promise<AuthorizationDecision> {
    const actionMap = { create: "create", read: "read", write: "update", admin: "admin", reconnect: "execute", disconnect: "delete", sync: "execute", delete: "delete" } as const;
    return this.can(tenantContext, "connector", actionMap[operation], { resourceId: connectorId, organizationId: tenantContext.organization.organizationId });
  }
}

export const resourceAuthorizationAPI = new ResourceAuthorizationAPI();
