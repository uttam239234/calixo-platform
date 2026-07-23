/**
 * Calixo Platform - Platform Admin: Server-Side Gate
 *
 * Shared by every Platform Admin Server Action (Secrets console, and — as of
 * the Round 20 persistence investigation — every Plan Management Console
 * section's save action too). Moved here from `secrets/guard.ts` (its
 * original, single-consumer home) now that a second family of Server
 * Actions needs the identical check: one gate, not a copy per section.
 *
 * Reuses the shared `resolvePlatformRoleServer()` (the same function
 * `/platform-admin/layout.tsx` uses) instead of a hand-rolled Clerk org-role
 * check — a bootstrap PLATFORM_OWNER (the founder allowlist) must reach
 * every `/platform-admin/*` Server Action, not just the page route.
 */
import "server-only";
import { resolvePlatformRoleServer } from "@/features/platform-admin/resolvePlatformRole.server";
import type { InternalRole } from "@/identity/platformRole";

export class NotPlatformAdminError extends Error {
  constructor() {
    super("Platform Admin access required.");
    this.name = "NotPlatformAdminError";
  }
}

/** Returns the real, resolved Calixo `userId` for audit attribution, or throws if the caller is not PLATFORM_OWNER/PLATFORM_ADMIN. */
export async function assertPlatformAdmin(): Promise<{ userId: string; role: InternalRole }> {
  const { role, hasPlatformAdminAccess, calixoUserId } = await resolvePlatformRoleServer();
  if (!hasPlatformAdminAccess || !calixoUserId) throw new NotPlatformAdminError();
  return { userId: calixoUserId, role };
}

export class NotPlatformOwnerError extends Error {
  constructor() {
    super("Only the Platform Owner can make this change.");
    this.name = "NotPlatformOwnerError";
  }
}

/**
 * The narrower gate the OAuth Applications console needs: "Only Platform
 * Owner may Create/Update/Delete/Validate/Test. Everyone else Read Only."
 * Every other Platform Admin console today treats PLATFORM_OWNER and
 * PLATFORM_ADMIN identically (`assertPlatformAdmin()` above) — this is the
 * first place that distinction actually matters. Still requires real
 * Platform Admin route access first (so a non-staff caller gets the same
 * generic denial as everywhere else, not a role-specific one that leaks
 * information about the RBAC model to someone with no console access at all).
 */
export async function assertPlatformOwner(): Promise<{ userId: string; role: InternalRole }> {
  const { userId, role } = await assertPlatformAdmin();
  if (role !== "PLATFORM_OWNER") throw new NotPlatformOwnerError();
  return { userId, role };
}
