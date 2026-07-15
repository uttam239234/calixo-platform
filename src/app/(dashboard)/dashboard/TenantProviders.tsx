"use client";

/**
 * Calixo Platform - Dashboard Tenant Context Bridge
 *
 * Production identity migration (Round 18): the real, Clerk-verified
 * identity now drives this bridge — `useCalixoIdentity()` resolves a real
 * `userId`/`organizationId` (JIT-provisioning on first contact; see
 * `src/identity/bridge/resolveCalixoIdentity.ts`), replacing the
 * `DEMO_CURRENT_USER_ID` fallback that previously made this a no-op ("no
 * real login flow exists yet") on every request.
 *
 * `OrganizationProvider`/`organizationService` were already real — they
 * always delegated to the canonical `organizationPlatformAPI`
 * (`core/platform/organizations`), a genuine RBAC-aware multi-org engine.
 * The only thing that was fake was the `userId` fed into them and "active
 * org" defaulting to `orgs[0]` rather than a real selection. Both are fixed
 * here without touching the 12 other files that already consume
 * `useOrganization()`/`useOrganizationId()` — only what backs them changes.
 *
 * The rich pre-seeded demo roster (`seedOrganizationsPlatformMockData` and
 * friends — Royal Global University / Calixo Technologies / MIT WPU /
 * Agency Client A) is no longer auto-seeded here: attaching any real signed
 *-in user to that roster would itself be the kind of hardcoded shortcut
 * this migration exists to remove. `resolveCalixoIdentity()` still ensures
 * every foundational registry (subscription tiers, RBAC roles, connector
 * catalog, commercial platform) is initialized — just not fake identities.
 */

import { useEffect, type ReactNode } from "react";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { OrganizationProvider, useOrganization, useOrganizationId } from "@/organizations/hooks/useOrganization";
import { WorkspaceProvider, useWorkspace } from "@/workspaces/hooks/useWorkspace";

function OrganizationBootstrap({ children, activeOrganizationId }: { children: ReactNode; activeOrganizationId: string | null }) {
  const { organizations, organization, switchOrganization, refreshOrganizations } = useOrganization();

  useEffect(() => {
    (async () => {
      await refreshOrganizations();
    })();
  }, [refreshOrganizations]);

  // Keeps the "active" organization in sync with the identity bridge's real resolution (the org Clerk's session says is active, or the user's JIT-provisioned org) rather than the provider's own "defaults to orgs[0]" fallback.
  useEffect(() => {
    if (!activeOrganizationId) return;
    if (organization?.id === activeOrganizationId) return;
    if (!organizations.some(o => o.id === activeOrganizationId)) return;
    void switchOrganization(activeOrganizationId);
  }, [activeOrganizationId, organization?.id, organizations, switchOrganization]);

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

function SignedOutState() {
  return <div className="mx-auto max-w-6xl px-6 py-24 text-sm text-muted-foreground">Redirecting to sign-in…</div>;
}

export function DashboardTenantProviders({ children }: { children: ReactNode }) {
  const { loaded, signedIn, identity } = useCalixoIdentity();

  if (!loaded) {
    return <div className="mx-auto max-w-6xl px-6 py-24 text-sm text-muted-foreground">Loading your workspace…</div>;
  }
  // `middleware.ts` already redirects an unauthenticated request before this ever renders — this is a defensive fallback, not the primary gate (matching Clerk's current "protect at the resource" guidance).
  if (!signedIn || !identity) {
    return <SignedOutState />;
  }

  return (
    <OrganizationProvider userId={identity.userId}>
      <OrganizationBootstrap activeOrganizationId={identity.organizationId}>
        <WorkspaceProvider>
          <WorkspaceBootstrap>{children}</WorkspaceBootstrap>
        </WorkspaceProvider>
      </OrganizationBootstrap>
    </OrganizationProvider>
  );
}
