import { organizationRegistry } from "../organizations/OrganizationRegistry";
import { platformEventBus } from "../events/PlatformEventBus";
import { subscriptionEngine } from "../subscription/SubscriptionEngine";
import { workspaceRegistry } from "./WorkspaceRegistry";
import type { CreateWorkspaceInput, UpdateWorkspaceInput, Workspace, WorkspaceAuditEntry, WorkspaceMember, WorkspaceMemberRole, WorkspacePermissionOverride } from "./types";

function now(): string {
  return new Date().toISOString();
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Thrown by `assertBelongsToOrganization()` — the concrete isolation boundary between Organizations and Workspaces. */
export class WorkspaceIsolationError extends Error {
  constructor(workspaceId: string, organizationId: string) {
    super(`Workspace "${workspaceId}" does not belong to organization "${organizationId}".`);
    this.name = "WorkspaceIsolationError";
  }
}

const DEFAULT_SETTINGS = (): Workspace["settings"] => ({ timezone: "UTC", language: "en", defaultView: "grid", itemsPerPage: 25 });
const DEFAULT_BRANDING = (): Workspace["branding"] => ({ theme: { primary: "#4F46E5", secondary: "#0EA5E9", accent: "#F59E0B" } });

export class WorkspaceEngine {
  private members = new Map<string, WorkspaceMember[]>();
  private permissionOverrides: WorkspacePermissionOverride[] = [];
  private audit: WorkspaceAuditEntry[] = [];

  create(input: CreateWorkspaceInput, actorId: string): Workspace {
    const organization = organizationRegistry.lookup(input.organizationId);
    if (!organization) throw new Error(`Cannot create workspace: organization "${input.organizationId}" does not exist.`);

    const limitCheck = subscriptionEngine.checkLimit(input.organizationId, "workspacesUsed", 1);
    if (!limitCheck.allowed) throw new Error(limitCheck.reason);

    const id = `ws-${slugify(input.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const isFirstForOrg = workspaceRegistry.list({ organizationId: input.organizationId }).length === 0;
    const workspace: Workspace = {
      id,
      organizationId: input.organizationId,
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      description: input.description,
      type: input.type ?? "team",
      isDefault: input.isDefault ?? isFirstForOrg,
      isArchived: false,
      settings: { ...DEFAULT_SETTINGS(), ...input.settings },
      branding: DEFAULT_BRANDING(),
      featureFlagOverrides: {},
      metadata: {},
      memberCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    workspaceRegistry.register(workspace);
    subscriptionEngine.recordUsage(input.organizationId, "workspacesUsed", 1);
    this.addMember(id, actorId, "admin");
    this.recordAudit(id, actorId, "workspace.created", id);
    void platformEventBus.publish({ type: "WorkspaceCreated", organizationId: input.organizationId, workspaceId: id, userId: actorId, payload: { name: workspace.name } });
    return workspace;
  }

  update(id: string, input: UpdateWorkspaceInput, actorId: string): Workspace | undefined {
    const workspace = workspaceRegistry.lookup(id);
    if (!workspace) return undefined;
    if (input.name) workspace.name = input.name;
    if (input.description !== undefined) workspace.description = input.description;
    if (input.settings) workspace.settings = { ...workspace.settings, ...input.settings };
    if (input.branding) workspace.branding = { ...workspace.branding, ...input.branding };
    workspace.updatedAt = now();
    this.recordAudit(id, actorId, "workspace.updated", id);
    void platformEventBus.publish({ type: "WorkspaceUpdated", organizationId: workspace.organizationId, workspaceId: id, userId: actorId, payload: { name: workspace.name } });
    return workspace;
  }

  archive(id: string, actorId: string): Workspace | undefined {
    const workspace = workspaceRegistry.lookup(id);
    if (!workspace) return undefined;
    workspace.isArchived = true;
    workspace.archivedAt = now();
    workspace.updatedAt = now();
    this.recordAudit(id, actorId, "workspace.archived", id);
    void platformEventBus.publish({ type: "WorkspaceArchived", organizationId: workspace.organizationId, workspaceId: id, userId: actorId, payload: {} });
    return workspace;
  }

  /** The reusable isolation check every engine/service should call before acting on a (workspaceId, organizationId) pair from a request. */
  assertBelongsToOrganization(workspaceId: string, organizationId: string): Workspace {
    const workspace = workspaceRegistry.lookup(workspaceId);
    if (!workspace || workspace.organizationId !== organizationId) {
      throw new WorkspaceIsolationError(workspaceId, organizationId);
    }
    return workspace;
  }

  // -- Members ------------------------------------------------------------

  addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole = "editor"): WorkspaceMember {
    const member: WorkspaceMember = { id: `wsmem-${workspaceId}-${userId}`, workspaceId, userId, role, joinedAt: now(), isActive: true };
    const list = this.members.get(workspaceId) ?? [];
    list.push(member);
    this.members.set(workspaceId, list);
    const workspace = workspaceRegistry.lookup(workspaceId);
    if (workspace) workspace.memberCount = list.filter(m => m.isActive).length;
    return member;
  }

  removeMember(workspaceId: string, userId: string, actorId: string): boolean {
    const member = this.members.get(workspaceId)?.find(m => m.userId === userId);
    if (!member) return false;
    member.isActive = false;
    const workspace = workspaceRegistry.lookup(workspaceId);
    if (workspace) workspace.memberCount = (this.members.get(workspaceId) ?? []).filter(m => m.isActive).length;
    this.recordAudit(workspaceId, actorId, "workspace.member-removed", userId);
    return true;
  }

  getMembers(workspaceId: string): WorkspaceMember[] {
    return (this.members.get(workspaceId) ?? []).filter(m => m.isActive);
  }

  /** Workspaces a given user is an active member of — the "workspace switching" data source. */
  getWorkspacesForUser(userId: string): Workspace[] {
    const ids = new Set<string>();
    for (const [workspaceId, list] of this.members.entries()) {
      if (list.some(m => m.userId === userId && m.isActive)) ids.add(workspaceId);
    }
    return workspaceRegistry.list().filter(w => ids.has(w.id));
  }

  // -- Permission overrides -------------------------------------------------

  setPermissionOverride(workspaceId: string, userId: string, permission: string, granted: boolean): void {
    const existing = this.permissionOverrides.find(o => o.workspaceId === workspaceId && o.userId === userId && o.permission === permission);
    if (existing) existing.granted = granted;
    else this.permissionOverrides.push({ workspaceId, userId, permission, granted });
  }

  getPermissionOverrides(workspaceId: string, userId: string): WorkspacePermissionOverride[] {
    return this.permissionOverrides.filter(o => o.workspaceId === workspaceId && o.userId === userId);
  }

  setFeatureFlagOverride(workspaceId: string, flagId: string, enabled: boolean): void {
    const workspace = workspaceRegistry.lookup(workspaceId);
    if (!workspace) return;
    workspace.featureFlagOverrides[flagId] = enabled;
    void platformEventBus.publish({ type: "FeatureFlagChanged", organizationId: workspace.organizationId, workspaceId, payload: { flagId, enabled, scope: "workspace" } });
  }

  private recordAudit(workspaceId: string, actorId: string, action: string, target?: string, metadata?: Record<string, unknown>): void {
    this.audit.push({ id: `wsaudit-${workspaceId}-${this.audit.length}`, workspaceId, actorId, action, target, timestamp: now(), metadata });
  }

  getAuditTrail(workspaceId: string): WorkspaceAuditEntry[] {
    return this.audit.filter(a => a.workspaceId === workspaceId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const workspaceEngine = new WorkspaceEngine();
