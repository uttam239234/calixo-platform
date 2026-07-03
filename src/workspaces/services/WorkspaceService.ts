/**
 * Calixo Platform - Workspace Service
 * 
 * Manages workspace lifecycle within organizations.
 */

import { appLogger } from '@/logging';
import { NotFoundError } from '@/errors';
import { generateId, slugify } from '@/shared/utils/string';
import type {
  WorkspaceProfile,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceSettings,
  WorkspaceBranding,
} from '@/workspaces/types';

const DEFAULT_SETTINGS: WorkspaceSettings = {
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  weekStartsOn: 'monday',
  language: 'en',
  currency: 'USD',
  preferences: {
    defaultView: 'list',
    itemsPerPage: 20,
    enableNotifications: true,
    enableAutomation: true,
  },
};

const DEFAULT_BRANDING: WorkspaceBranding = {
  theme: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#8B5CF6',
  },
};

export class WorkspaceService {
  private workspaces: Map<string, WorkspaceProfile> = new Map();
  private orgWorkspaces: Map<string, Set<string>> = new Map(); // orgId -> Set<wsId>

  async createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceProfile> {
    const now = new Date().toISOString();
    const slug = request.slug || slugify(request.name);

    const ws: WorkspaceProfile = {
      id: generateId(16),
      organizationId: request.organizationId,
      name: request.name,
      slug,
      description: request.description,
      type: request.type || 'team',
      isDefault: false,
      isActive: true,
      isDeleted: false,
      settings: { ...DEFAULT_SETTINGS, ...request.settings },
      branding: { ...DEFAULT_BRANDING },
      memberCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.workspaces.set(ws.id, ws);

    if (!this.orgWorkspaces.has(request.organizationId)) {
      this.orgWorkspaces.set(request.organizationId, new Set());
    }
    this.orgWorkspaces.get(request.organizationId)!.add(ws.id);

    // If first workspace, make it default
    const orgWsCount = this.orgWorkspaces.get(request.organizationId)!.size;
    if (orgWsCount === 1) {
      ws.isDefault = true;
    }

    appLogger.info('WorkspaceService', `Workspace created: ${ws.name} (${ws.id})`);
    return { ...ws };
  }

  async getWorkspace(wsId: string): Promise<WorkspaceProfile | null> {
    const ws = this.workspaces.get(wsId);
    if (!ws || ws.isDeleted) return null;
    return { ...ws };
  }

  async getOrganizationWorkspaces(orgId: string): Promise<WorkspaceProfile[]> {
    const wsIds = this.orgWorkspaces.get(orgId);
    if (!wsIds) return [];

    return Array.from(wsIds)
      .map(id => this.workspaces.get(id))
      .filter((ws): ws is WorkspaceProfile => !!ws && !ws.isDeleted)
      .map(ws => ({ ...ws }))
      .sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }

  async updateWorkspace(wsId: string, data: UpdateWorkspaceRequest): Promise<WorkspaceProfile> {
    const ws = this.workspaces.get(wsId);
    if (!ws || ws.isDeleted) {
      throw new NotFoundError('Workspace');
    }

    if (data.name !== undefined) ws.name = data.name;
    if (data.description !== undefined) ws.description = data.description;
    if (data.type !== undefined) ws.type = data.type;
    if (data.settings !== undefined) {
      ws.settings = { ...ws.settings, ...data.settings, preferences: { ...ws.settings.preferences, ...data.settings.preferences } };
    }
    if (data.branding !== undefined) {
      ws.branding = { ...ws.branding, ...data.branding, theme: { ...ws.branding.theme, ...data.branding.theme } };
    }

    ws.updatedAt = new Date().toISOString();
    appLogger.info('WorkspaceService', `Workspace updated: ${ws.id}`);
    return { ...ws };
  }

  async archiveWorkspace(wsId: string): Promise<void> {
    const ws = this.workspaces.get(wsId);
    if (!ws || ws.isDeleted) {
      throw new NotFoundError('Workspace');
    }

    ws.isDeleted = true;
    ws.deletedAt = new Date().toISOString();
    appLogger.info('WorkspaceService', `Workspace archived: ${ws.id}`);
  }

  async switchWorkspace(wsId: string): Promise<WorkspaceProfile> {
    const ws = await this.getWorkspace(wsId);
    if (!ws) {
      throw new NotFoundError('Workspace');
    }
    appLogger.info('WorkspaceService', `Switched to workspace ${wsId}`);
    return ws;
  }

  async getDefaultWorkspace(orgId: string): Promise<WorkspaceProfile | null> {
    const workspaces = await this.getOrganizationWorkspaces(orgId);
    return workspaces.find(ws => ws.isDefault) || workspaces[0] || null;
  }
}

export const workspaceService = new WorkspaceService();