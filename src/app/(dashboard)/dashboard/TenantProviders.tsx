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
import { seedDepartmentWorkspaces } from "@/features/settings/workspaces/seedDepartmentWorkspaces";
import { seedOrganizationConnections } from "@/features/settings/integrations/seedOrganizationConnections";
import { seedRoleAssignmentsForOrganizationMembers } from "@/features/settings/integrations/seedOrganizationMemberRoles";
import { initializeConnectorFoundation } from "@/core/platform/connectors";
import { seedDashboardConnections } from "@/core/dashboard/integrations/seedDashboardConnections";
import { initializeCommercialFoundation } from "@/core/platform/commercial";
import { seedOrganizationBilling } from "@/features/settings/billing/seedOrganizationBilling";

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
      // Grants the real demo user ("user-current"/"user-2"/"user-3") a real,
      // permission-checked role in every organization it's actually a member
      // of — closes a gap the roster-only role seed above left open (see
      // `seedOrganizationMemberRoles.ts`), needed by any hard-gated platform
      // check (e.g. the Connector Platform's `ConnectorRuntime`).
      await seedRoleAssignmentsForOrganizationMembers();
      // Real per-department Workspace records (Marketing/Admissions/Outreach/...),
      // one per existing Team — replaces the generic per-org mock workspace id
      // every team/person previously shared. Must run before `WorkspaceBootstrap`
      // below reads real data; see that component's own gating for why the
      // ordering works out even though it's a sibling effect, not a sequenced call.
      await seedDepartmentWorkspaces();
      // Registers the Marketplace's 8 additional apps and connects each
      // organization's real starter set — must run after organizations exist,
      // same "seed after the data it depends on" ordering as the steps above.
      await initializeConnectorFoundation();
      // Registers Google Ads/Meta/Instagram/LinkedIn/YouTube into the shared
      // connector registry — previously only triggered by the Dashboard page
      // mounting; needed here too since `seedOrganizationConnections()` below
      // installs real connections for some of these providers (found via this
      // round's own isolation verification route: without this, install()
      // throws "Provider google-ads not found"). Its own "org-current" demo
      // connections are unrelated to the 4 real organizations below.
      await seedDashboardConnections();
      await seedOrganizationConnections();
      // Registers pricing rules, usage types, and quotas — otherwise only
      // reachable via the umbrella `initializePlatformFoundation()`, which is
      // itself gated behind a real session user that never exists in this
      // demo (found via this round's own research). Then grants each
      // organization's real included AI credits and seeds realistic starting
      // billing data (consumption, a default payment method, paid invoices).
      await initializeCommercialFoundation();
      await seedOrganizationBilling();
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
