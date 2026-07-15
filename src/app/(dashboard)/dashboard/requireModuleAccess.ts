/**
 * Calixo Platform - Module Access Gate (server-side)
 *
 * Called from each product module's own `layout.tsx`/`page.tsx`, BEFORE its
 * client Provider (and the data it generates on mount) ever renders. This is
 * the actual "backend enforcement, not UI hiding" the Entitlement
 * Enforcement mandate calls for: prior to this, every one of the 10
 * modules' access checks ran entirely client-side (a `useEffect` fetching
 * permissions, then conditionally rendering) — reachable by URL and
 * generating real mock data regardless of the check's outcome, since the
 * check and the data generation both ran in the same browser-bundled code.
 *
 * `proxy.ts` already guarantees a signed-in Clerk session by the time any
 * module route renders (redirects anonymous requests earlier); this is the
 * finer-grained layer it explicitly defers to the resource — is this
 * specific module included in this organization's plan, and does this user
 * have permission to see it.
 */
import "server-only";
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService, type EntitlementModuleId, type EntitlementResult } from "@/core/platform/access";

export interface ModuleAccessCheck {
  allowed: boolean;
  result: EntitlementResult;
}

export async function requireModuleAccess(moduleId: EntitlementModuleId): Promise<ModuleAccessCheck> {
  const identity = await resolveIdentity();
  if (!identity) {
    return { allowed: false, result: { allowed: false, reasonCode: "insufficient_permission", message: "Sign in required." } };
  }
  const result = await entitlementService.canAccessModule({ userId: identity.userId, organizationId: identity.organizationId }, moduleId);
  return { allowed: result.allowed, result };
}
