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
 * the bootstrap components below call `refreshOrganizations()`/
 * `refreshWorkspaces()` once per `userId`/`organizationId` change;
 * `refreshOrganizations()` itself already no-ops safely when its `userId`
 * is falsy, so the bootstrap doesn't need to duplicate that check.
 *
 * `DEMO_CURRENT_USER_ID` is the same "no real login flow exists yet"
 * fallback every other module already uses locally (e.g. Reports'
 * `REPORTS_CURRENT_USER_ID`), applied here at the shared session-bootstrap
 * level so the organization switcher — and every module reading
 * `useOrganizationId()` — sees one real, consistent "current organization"
 * instead of each module silently falling back to its own disconnected
 * constant. Swap this for `sessionUser.id` the moment a real login flow
 * exists; nothing downstream needs to change.
 */

import { useEffect, type ReactNode } from "react";
import { AuthProvider, useUser } from "@/identity/hooks/useAuth";
import { OrganizationProvider, useOrganization, useOrganizationId } from "@/organizations/hooks/useOrganization";
import { WorkspaceProvider, useWorkspace } from "@/workspaces/hooks/useWorkspace";
import { organizationRegistry, initializeOrganizationsFoundation, seedOrganizationsPlatformMockData } from "@/core/platform/organizations";
import { userRegistry, initializeUsersFoundation, seedUsersPlatformMockData } from "@/core/users";
import { initializeAccessControlFoundation } from "@/core/platform/access";
import { seedRoleAssignmentsForRoster } from "@/features/settings/roles/seedRoleAssignments";

const DEMO_CURRENT_USER_ID = "user-current";

function OrganizationBootstrap({ children }: { children: ReactNode }) {
  const { refreshOrganizations } = useOrganization();

  useEffect(() => {
    (async () => {
      if (organizationRegistry.count() === 0) {
        initializeOrganizationsFoundation();
        seedOrganizationsPlatformMockData();
      }
      // Users & Teams' roster is keyed to these same organizations (see `core/users/mock/rosters.ts`) — seed it right alongside them, once, app-wide.
      if (userRegistry.count() === 0) {
        initializeUsersFoundation();
        seedUsersPlatformMockData();
      }
      // Real business roles (Owner/Administrator/Manager/Member/Viewer) + a real
      // UserRoleAssignment per roster person — both idempotent, and neither gated
      // behind a session user (unlike SettingsProvider's own effect), since no
      // real login flow exists yet and this data needs to exist regardless.
      await initializeAccessControlFoundation();
      await seedRoleAssignmentsForRoster();
      refreshOrganizations();
    })();
  }, [refreshOrganizations]);

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
    <OrganizationProvider userId={user?.id ?? DEMO_CURRENT_USER_ID}>
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
