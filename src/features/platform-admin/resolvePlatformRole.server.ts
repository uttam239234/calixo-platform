/**
 * Calixo Platform - Platform Role Model: Server-Side Resolver
 *
 * The Server Component / Server Action equivalent of `internalRole.tsx`'s
 * `InternalRoleProvider` — same `derivePlatformRole()` function, fed by
 * Clerk's real server-side `auth()`/`currentUser()` instead of the browser
 * hooks. This is what makes the `/platform-admin/*` gate a REAL server-side
 * 403 rather than a client-rendered "Access Denied" message: see
 * `src/app/platform-admin/layout.tsx`.
 */
import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { derivePlatformRole, PLATFORM_ADMIN_ROUTE_ROLES, type InternalRole } from "@/identity/platformRole";

export interface ServerPlatformRole {
  role: InternalRole;
  hasPlatformAdminAccess: boolean;
  /** The real Calixo `User.id` (JIT-resolved) for audit attribution — `null` only when there is no signed-in Clerk session at all. */
  calixoUserId: string | null;
}

export async function resolvePlatformRoleServer(): Promise<ServerPlatformRole> {
  const { userId: clerkUserId, orgSlug, orgRole } = await auth();
  if (!clerkUserId) return { role: "NONE", hasPlatformAdminAccess: false, calixoUserId: null };

  const [user, identity] = await Promise.all([currentUser(), resolveIdentity()]);
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const role = derivePlatformRole({ email, orgSlug: orgSlug ?? null, orgRole: orgRole ?? null, hasOrgMembership: !!orgSlug });

  return { role, hasPlatformAdminAccess: PLATFORM_ADMIN_ROUTE_ROLES.includes(role), calixoUserId: identity?.userId ?? null };
}
