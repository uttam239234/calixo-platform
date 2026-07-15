'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { workspaceService } from '@/workspaces/services/WorkspaceService';
import { appLogger } from '@/logging';
import { useOrganizationId } from '@/organizations/hooks/useOrganization';
import { useCalixoIdentity } from '@/identity/bridge/useCalixoIdentity';
import type { WorkspaceProfile, WorkspaceContextValue, CreateWorkspaceRequest, UpdateWorkspaceRequest } from '@/workspaces/types';

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const organizationId = useOrganizationId();
  const { identity } = useCalixoIdentity();
  const actorId = identity?.userId ?? '';
  const [workspace, setWorkspace] = useState<WorkspaceProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(!!organizationId);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspaces = useCallback(async () => {
    if (!organizationId) {
      setWorkspace(null);
      setWorkspaces([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const wsList = await workspaceService.getOrganizationWorkspaces(organizationId);
      setWorkspaces(wsList);
      if (wsList.length > 0) {
        setWorkspace(prev => prev || wsList[0]);
      } else {
        setWorkspace(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  const switchWorkspace = useCallback(async (wsId: string) => {
    setIsSwitching(true);
    setError(null);
    try {
      const ws = await workspaceService.switchWorkspace(wsId);
      setWorkspace(ws);
      appLogger.info('WorkspaceContext', `Switched to workspace ${wsId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch workspace');
      throw err;
    } finally {
      setIsSwitching(false);
    }
  }, []);

  const createWorkspace = useCallback(async (request: CreateWorkspaceRequest): Promise<WorkspaceProfile> => {
    if (!organizationId) throw new Error('No organization selected');
    const ws = await workspaceService.createWorkspace({ ...request, organizationId }, actorId);
    setWorkspaces(prev => [...prev, ws]);
    setWorkspace(ws);
    return ws;
  }, [organizationId, actorId]);

  const updateWorkspace = useCallback(async (wsId: string, data: UpdateWorkspaceRequest): Promise<WorkspaceProfile> => {
    const ws = await workspaceService.updateWorkspace(wsId, data, actorId);
    setWorkspace(ws);
    setWorkspaces(prev => prev.map(w => w.id === wsId ? ws : w));
    return ws;
  }, [actorId]);

  const archiveWorkspace = useCallback(async (wsId: string) => {
    await workspaceService.archiveWorkspace(wsId, actorId);
    setWorkspaces(prev => {
      const filtered = prev.filter(w => w.id !== wsId);
      if (workspace?.id === wsId) {
        setWorkspace(filtered[0] || null);
      }
      return filtered;
    });
  }, [workspace, actorId]);

  const value: WorkspaceContextValue = {
    workspace,
    workspaces,
    isLoading,
    isSwitching,
    error,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    archiveWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export function useCurrentWorkspace(): WorkspaceProfile | null {
  return useWorkspace().workspace;
}

export function useWorkspaceId(): string | null {
  return useWorkspace().workspace?.id || null;
}