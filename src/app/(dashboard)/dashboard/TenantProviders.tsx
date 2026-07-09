"use client";

/**
 * Calixo Platform - Dashboard Tenant Context Bridge
 *
 * Mounts the real Identity/Organization/Workspace platform providers for
 * the `/dashboard/*` route group. None of these were previously mounted
 * anywhere in the app — every dashboard hook read hardcoded demo
 * constants instead. `AuthProvider` never redirects and settles to
 * `{ user: null, isAuthenticated: false }` when nothing is in
 * localStorage, so mounting it here is a no-op until a real login flow
 * exists, and becomes real the moment one does.
 *
 * `OrganizationProvider` takes `userId` as a prop rather than reading
 * context itself, and neither it nor `WorkspaceProvider` auto-load on
 * mount ("initial load is triggered externally", per their own source) —
 * the bootstrap components below replicate the exact
 * `refreshOrganizations()`-on-`user`-change pattern already used by
 * `OrganizationSwitcher.tsx`, the one existing (if unmounted) consumer.
 */

import { useEffect, type ReactNode } from "react";
import { AuthProvider, useUser } from "@/identity/hooks/useAuth";
import { OrganizationProvider, useOrganization, useOrganizationId } from "@/organizations/hooks/useOrganization";
import { WorkspaceProvider, useWorkspace } from "@/workspaces/hooks/useWorkspace";

function OrganizationBootstrap({ children }: { children: ReactNode }) {
  const user = useUser();
  const { refreshOrganizations } = useOrganization();

  useEffect(() => {
    if (user) refreshOrganizations();
  }, [user, refreshOrganizations]);

  return <>{children}</>;
}

function WorkspaceBootstrap({ children }: { children: ReactNode }) {
  const organizationId = useOrganizationId();
  const { refreshWorkspaces } = useWorkspace();

  useEffect(() => {
    if (organizationId) refreshWorkspaces();
  }, [organizationId, refreshWorkspaces]);

  return <>{children}</>;
}

function OrganizationProviderBridge({ children }: { children: ReactNode }) {
  const user = useUser();
  return (
    <OrganizationProvider userId={user?.id ?? null}>
      <OrganizationBootstrap>{children}</OrganizationBootstrap>
    </OrganizationProvider>
  );
}

export function DashboardTenantProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrganizationProviderBridge>
        <WorkspaceProvider>
          <WorkspaceBootstrap>{children}</WorkspaceBootstrap>
        </WorkspaceProvider>
      </OrganizationProviderBridge>
    </AuthProvider>
  );
}
