'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { organizationService } from '@/organizations/services/OrganizationService';
import { appLogger } from '@/logging';
import type { OrganizationProfile, OrganizationContextValue, CreateOrganizationRequest, UpdateOrganizationRequest } from '@/organizations/types';

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export function OrganizationProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string | null;
}) {
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [isLoading, setIsLoading] = useState(!!userId);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load is triggered externally via refreshOrganizations
  const refreshOrganizations = useCallback(async () => {
    if (!userId) {
      setOrganization(null);
      setOrganizations([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const orgs = await organizationService.getUserOrganizations(userId);
      setOrganizations(orgs);
      if (orgs.length > 0) {
        setOrganization(prev => prev || orgs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const switchOrganization = useCallback(async (orgId: string) => {
    if (!userId) return;
    setIsSwitching(true);
    setError(null);
    try {
      const org = await organizationService.switchOrganization(userId, orgId);
      setOrganization(org);
      appLogger.info('OrganizationContext', `Switched to organization ${orgId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
      throw err;
    } finally {
      setIsSwitching(false);
    }
  }, [userId]);

  const createOrganization = useCallback(async (request: CreateOrganizationRequest): Promise<OrganizationProfile> => {
    if (!userId) throw new Error('Not authenticated');
    const org = await organizationService.createOrganization(userId, request);
    setOrganizations(prev => [...prev, org]);
    setOrganization(org);
    return org;
  }, [userId]);

  const updateOrganization = useCallback(async (orgId: string, data: UpdateOrganizationRequest): Promise<OrganizationProfile> => {
    const org = await organizationService.updateOrganization(orgId, data, userId ?? undefined);
    setOrganization(org);
    setOrganizations(prev => prev.map(o => o.id === orgId ? org : o));
    return org;
  }, [userId]);

  const archiveOrganization = useCallback(async (orgId: string) => {
    await organizationService.archiveOrganization(orgId, userId ?? undefined);
    setOrganizations(prev => {
      const filtered = prev.filter(o => o.id !== orgId);
      if (organization?.id === orgId) {
        setOrganization(filtered[0] || null);
      }
      return filtered;
    });
  }, [organization, userId]);

  const value: OrganizationContextValue = {
    organization,
    organizations,
    isLoading,
    isSwitching,
    error,
    switchOrganization,
    createOrganization,
    updateOrganization,
    archiveOrganization,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

export function useCurrentOrganization(): OrganizationProfile | null {
  return useOrganization().organization;
}

export function useOrganizationId(): string | null {
  return useOrganization().organization?.id || null;
}