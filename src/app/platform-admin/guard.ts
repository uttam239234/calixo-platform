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
