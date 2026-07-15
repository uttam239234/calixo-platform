/**
 * Calixo Platform - Internal Plan Management Console: Route Gate
 *
 * A real Server Component (no "use client") — this is what makes
 * `/platform-admin/*` protection genuine server-side enforcement instead of
 * a client-rendered "Access Denied" message sitting under an HTTP 200.
 * `resolvePlatformRoleServer()` re-derives the platform role from Clerk's
 * real server-side session (never trusts anything the client sent), and
 * `forbidden()` (next/navigation, enabled via `experimental.authInterrupts`
 * in next.config.ts) returns a REAL HTTP 403, caught by the root
 * `src/app/forbidden.tsx` boundary.
 *
 * Only PLATFORM_OWNER and PLATFORM_ADMIN pass — PLATFORM_SUPPORT and
 * PLATFORM_DEVELOPER are real platform staff (see `src/identity/platformRole.ts`)
 * but do not get console access per this round's brief.
 *
 * Every entry is audited, granted or denied — `proxy.ts`'s coarse
 * "must be signed in" redirect happens before this ever runs, so by the
 * time this executes there is always a real Clerk session; the interesting
 * case this layer adds is "signed in, but not an authorized platform role."
 */
import type { ReactNode } from "react";
import { forbidden } from "next/navigation";
import { resolvePlatformRoleServer } from "@/features/platform-admin/resolvePlatformRole.server";
import { recordPlatformAccess } from "@/features/platform-admin/platformAccessAudit.server";
import { PlatformAdminShell } from "./PlatformAdminShell";

export default async function PlatformAdminLayout({ children }: { children: ReactNode }) {
  const { role, hasPlatformAdminAccess, calixoUserId } = await resolvePlatformRoleServer();

  if (!hasPlatformAdminAccess) {
    await recordPlatformAccess({ calixoUserId, role, granted: false, resource: "the Platform Admin console" });
    forbidden();
  }

  await recordPlatformAccess({ calixoUserId, role, granted: true, resource: "the Platform Admin console" });

  return <PlatformAdminShell>{children}</PlatformAdminShell>;
}
