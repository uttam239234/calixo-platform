/**
 * Calixo Platform - Route Protection (Round 18, production identity migration)
 *
 * Named `proxy.ts`, not `middleware.ts` — Next.js 16 deprecated the
 * `middleware.ts` convention in favor of `proxy.ts` (same export shape,
 * same `config.matcher`); a leftover `middleware.ts` is silently ignored at
 * build time with no error, which is exactly the failure mode this file
 * avoids. See https://nextjs.org/docs/messages/middleware-to-proxy.
 *
 * Deliberately a COARSE gate only: "is anyone signed in at all." Clerk's
 * current guidance deprecates `createRouteMatcher()`-driven fine-grained
 * blocking inside proxy/middleware in favor of checking auth "as close to
 * the resource as possible" (https://clerk.com/docs/reference/nextjs/clerk-middleware)
 * — path-matching here can diverge from how Next.js actually routes a
 * request and leave a resource reachable another way. Every fine-grained
 * check (organization membership, workspace membership, role, entitlement)
 * lives at the resource layer instead — `dashboard/layout.tsx`,
 * `platform-admin/layout.tsx`, and the API route handler — using the real,
 * already-built RBAC/entitlement engines. This also matches the brief's own
 * "UI hiding is insufficient — backend validation required" stance: the
 * real enforcement is server-side regardless of where in the request
 * lifecycle it runs.
 *
 * A plain path-prefix check is used instead of the deprecated route-matcher
 * helper — no functional difference for this coarse a check, avoids the
 * deprecation warning.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PROTECTED_PAGE_PREFIXES = ["/dashboard", "/platform-admin", "/internal", "/developer"];
const PROTECTED_API_PREFIXES = ["/api/v1"];
const PUBLIC_API_PATHS = new Set(["/api/v1/health", "/api/v1/openapi.json"]);
// Clerk's own webhook calls (`/api/webhooks/clerk`) are signature-verified inside the route handler itself (`verifyWebhook()`) — they never carry a Clerk session, API key, or Bearer token, so the coarse session/API-key gate below must not apply to them.

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isProtectedPage) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  const isProtectedApi = PROTECTED_API_PREFIXES.some(prefix => pathname.startsWith(prefix)) && !PUBLIC_API_PATHS.has(pathname);
  if (isProtectedApi) {
    const { userId } = await auth();
    // API-key-authenticated traffic (see ApiGatewayEngine.authenticate()) never has a Clerk session — the Gateway itself re-verifies via X-Api-Key/Bearer, so only block requests with neither a Clerk session nor those headers present.
    const hasApiKeyOrBearer = req.headers.has("x-api-key") || req.headers.has("authorization");
    if (!userId && !hasApiKeyOrBearer) {
      return NextResponse.json({ error: { code: "unauthenticated", message: "Authentication required." } }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  // A blanket "exclude any path with a dot" pattern (the common copy-pasted convention for skipping static assets) would also skip real routes like /api/v1/openapi.json — excluded here by exact static-asset path instead.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
