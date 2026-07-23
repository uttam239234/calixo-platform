/**
 * Calixo Platform - TEMPORARY debug endpoint for the production
 * Platform Owner detection investigation. Delete once the failing step is
 * identified and fixed — see src/identity/platformRole.ts,
 * src/features/platform-admin/platformOwnerBootstrap.action.ts,
 * src/features/platform-admin/internalRole.tsx, src/components/layout/Sidebar.tsx
 * for the matching [PlatformOwnerTrace] console instrumentation.
 *
 * Requires only a signed-in Clerk session (NOT platform-admin access) —
 * gating this behind `assertPlatformAdmin()` would make it useless for
 * exactly the person it exists to help (someone who should be recognized as
 * Platform Owner but currently isn't). Returns nothing beyond the
 * configured owner-email allowlist and the requesting user's own resolved
 * role — no secrets, no other users' data.
 */
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PLATFORM_OWNER_EMAILS } from "@/identity/platformRole";
import { checkBootstrapPlatformOwnerAction } from "@/features/platform-admin/platformOwnerBootstrap.action";
import { resolvePlatformRoleServer } from "@/features/platform-admin/resolvePlatformRole.server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  const [isPlatformOwner, { role: platformRole, hasPlatformAdminAccess }] = await Promise.all([
    checkBootstrapPlatformOwnerAction(),
    resolvePlatformRoleServer(),
  ]);

  return NextResponse.json({
    email,
    parsedPlatformOwnerEmails: PLATFORM_OWNER_EMAILS,
    isPlatformOwner,
    hasPlatformAdminAccess,
    platformRole,
    source: "server action",
  });
}
