/**
 * Calixo Platform - Platform Access Audit Logging
 *
 * Real audit entries for the brief's three required events: platform admin
 * login, platform role assignment, and platform admin access attempts
 * (granted AND denied). Reuses the same `PLATFORM_ADMIN_ORG_SENTINEL` the
 * Internal Plan Console already established so these surface in the Audit
 * Logs module's existing Platform Admin Logs panel for free.
 */
import "server-only";
import { auditService } from "@/access/audit/AuditService";
import { userRegistry } from "@/core/users";
import { PLATFORM_ADMIN_ORG_SENTINEL } from "./commitPlanChange";
import { INTERNAL_ROLE_LABELS, type InternalRole } from "@/identity/platformRole";

function actorName(calixoUserId: string): string {
  return userRegistry.lookup(calixoUserId)?.displayName ?? "Someone";
}

/** Called from `/platform-admin/layout.tsx` on every real page load — `resource` names the area being entered (e.g. "Platform Secrets"), matching the brief's own worked example format exactly. */
export async function recordPlatformAccess(params: { calixoUserId: string | null; role: InternalRole; granted: boolean; resource: string }): Promise<void> {
  const { calixoUserId, role, granted, resource } = params;
  if (!calixoUserId) return;
  const name = actorName(calixoUserId);

  await auditService.recordEvent({
    organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
    userId: calixoUserId,
    eventType: granted ? "platform_access_granted" : "platform_access_denied",
    resource: "platform_admin_route",
    description: granted ? `${name} accessed ${resource}.` : `${name} (${INTERNAL_ROLE_LABELS[role]}) attempted to access ${resource} and was denied.`,
  });
}

/** Called from the Clerk webhook on `session.created` — a real once-per-login event, distinct from per-page-view access records above. */
export async function recordPlatformAdminLogin(calixoUserId: string): Promise<void> {
  const name = actorName(calixoUserId);
  await auditService.recordEvent({
    organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
    userId: calixoUserId,
    eventType: "platform_admin_login",
    resource: "platform_admin",
    description: `${name} logged in as Platform Owner.`,
  });
}

export async function recordPlatformRoleAssigned(calixoUserId: string, role: InternalRole): Promise<void> {
  const name = actorName(calixoUserId);
  await auditService.recordEvent({
    organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
    userId: calixoUserId,
    eventType: "platform_role_assigned",
    resource: "platform_role",
    description: `${name} was assigned the ${INTERNAL_ROLE_LABELS[role]} role (bootstrap allowlist).`,
  });
}
