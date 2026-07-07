import type { Workspace } from "./types";

export interface WorkspaceListParams {
  organizationId?: string;
  type?: Workspace["type"];
  includeArchived?: boolean;
}

export class WorkspaceRegistry {
  private workspaces = new Map<string, Workspace>();

  register(workspace: Workspace): void {
    this.workspaces.set(workspace.id, workspace);
  }

  lookup(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  list(params: WorkspaceListParams = {}): Workspace[] {
    return Array.from(this.workspaces.values()).filter(w => {
      if (params.organizationId && w.organizationId !== params.organizationId) return false;
      if (params.type && w.type !== params.type) return false;
      if (!params.includeArchived && w.isArchived) return false;
      return true;
    });
  }

  getDefaultForOrganization(organizationId: string): Workspace | undefined {
    return this.list({ organizationId }).find(w => w.isDefault) ?? this.list({ organizationId })[0];
  }

  discover(query: string): Workspace[] {
    const q = query.toLowerCase();
    return this.list().filter(w => w.name.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q));
  }

  remove(id: string): boolean {
    return this.workspaces.delete(id);
  }

  count(): number {
    return this.workspaces.size;
  }
}

export const workspaceRegistry = new WorkspaceRegistry();
