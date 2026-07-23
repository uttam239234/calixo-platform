"use client";

/**
 * Calixo Platform - Internal Plan Management Console: Access Model
 *
 * Client-side context/provider only — all real role-derivation logic lives
 * in `src/identity/platformRole.ts` (pure, environment-agnostic, imported
 * from there rather than defined here so `core/platform/access` can also
 * read it without a `core` → `features` layering violation) so this file
 * and `resolvePlatformRole.server.ts` (the Server Component equivalent) can
 * never independently drift. `useOrganization()`/`useUser()` are Clerk's own
 * real client hooks; `derivePlatformRole()` is the identical function the
 * server uses.
 *
 * This remains a SECOND, belt-and-suspenders layer, not the primary gate —
 * `/platform-admin/layout.tsx` is now a Server Component that calls
 * `resolvePlatformRoleServer()` and returns a real HTTP 403 (`forbidden()`)
 * before any client code here even runs. Keeping this client check too
 * means role changes mid-session (e.g. an admin's org membership revoked
 * while a tab is open) still hide the console reactively without waiting
 * for a hard navigation.
 *
 * The bootstrap PLATFORM_OWNER check (`PLATFORM_OWNER_EMAILS`, a non-public
 * env var) can never be verified from `derivePlatformRole()` running in the
 * browser — that list always resolves empty client-side by design (see
 * `src/identity/platformRole.ts`). `checkBootstrapPlatformOwnerAction()`
 * bridges that one gap via a Server Action, once per mount; the
 * Clerk-org-membership branch (PLATFORM_ADMIN/PLATFORM_DEVELOPER) still
 * derives live from the client hooks below, unchanged.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { derivePlatformRole, INTERNAL_STAFF_ROLES, PLATFORM_ADMIN_ROUTE_ROLES, type InternalRole } from "@/identity/platformRole";
import { checkBootstrapPlatformOwnerAction } from "./platformOwnerBootstrap.action";

export type { InternalRole };
export { INTERNAL_ROLE_LABELS, INTERNAL_STAFF_ROLES, PLATFORM_ADMIN_ROUTE_ROLES, PLATFORM_BYPASS_ROLES, PLATFORM_OWNER_EMAILS, CALIXO_STAFF_ORG_SLUG } from "@/identity/platformRole";

interface InternalRoleContextValue {
  role: InternalRole;
  /** Any real platform role (OWNER/ADMIN/SUPPORT/DEVELOPER) — broad "is this platform staff" check. */
  isInternalStaff: boolean;
  /** The narrower OWNER/ADMIN-only check that actually gates `/platform-admin/*` and the staff sidebar section. */
  hasPlatformAdminAccess: boolean;
  /** True only for the bootstrap-email PLATFORM_OWNER, resolved server-side. */
  isPlatformOwner: boolean;
  loaded: boolean;
}

const InternalRoleContext = createContext<InternalRoleContextValue | null>(null);

export function InternalRoleProvider({ children }: { children: ReactNode }) {
  const { organization, membership, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const [isBootstrapOwner, setIsBootstrapOwner] = useState(false);

  useEffect(() => {
    (async () => {
      const isOwner = await checkBootstrapPlatformOwnerAction();
      setIsBootstrapOwner(isOwner);
    })();
  }, []);

  const orgDerivedRole = derivePlatformRole({
    email: user?.primaryEmailAddress?.emailAddress,
    orgSlug: organization?.slug,
    orgRole: membership?.role,
    hasOrgMembership: !!membership,
  });

  const role: InternalRole = isBootstrapOwner ? "PLATFORM_OWNER" : orgDerivedRole;
  const isInternalStaff = INTERNAL_STAFF_ROLES.includes(role);
  const hasPlatformAdminAccess = PLATFORM_ADMIN_ROUTE_ROLES.includes(role);
  const isPlatformOwner = role === "PLATFORM_OWNER";

  return (
    <InternalRoleContext.Provider value={{ role, isInternalStaff, hasPlatformAdminAccess, isPlatformOwner, loaded: orgLoaded && userLoaded }}>
      {children}
    </InternalRoleContext.Provider>
  );
}

export function useInternalRole(): InternalRoleContextValue {
  const ctx = useContext(InternalRoleContext);
  if (!ctx) throw new Error("useInternalRole must be used within an InternalRoleProvider");
  return ctx;
}
