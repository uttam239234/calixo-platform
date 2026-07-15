/**
 * Calixo Platform - Clerk Webhook Receiver (Round 18, audit integration)
 *
 * Verifies the signature via Clerk's own `verifyWebhook()` (real HMAC/svix
 * verification, not hand-rolled) and forwards genuine session/membership/
 * invitation lifecycle events into the already-real audit platform
 * (`auditService`, Round 16) — real new events, not a simulated stream.
 *
 * Configure in the Clerk dashboard: an endpoint at
 * `<your-domain>/api/webhooks/clerk`, subscribed to session.created,
 * session.ended, session.removed, organizationMembership.created,
 * organizationInvitation.accepted — then set CLERK_WEBHOOK_SIGNING_SECRET.
 *
 * Login/logout genuinely happen inside Clerk's own hosted UI, not in this
 * app's code — a webhook is the only real way to observe them, as opposed
 * to fabricating a client-side "recordLogin()" call that could never
 * reflect what Clerk's server actually did.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { auditService } from "@/access/audit/AuditService";
import { organizationRegistry } from "@/core/platform/organizations";
import { findCalixoUserByClerkId } from "@/identity/bridge/resolveCalixoIdentity";
import { PLATFORM_OWNER_EMAILS } from "@/identity/platformRole";
import { recordPlatformAdminLogin, recordPlatformRoleAssigned } from "@/features/platform-admin/platformAccessAudit.server";

export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return NextResponse.json({ error: { code: "invalid_signature", message: "Webhook signature verification failed." } }, { status: 400 });
  }

  switch (event.type) {
    case "session.created":
    case "session.ended":
    case "session.removed": {
      const clerkUserId = event.data.user_id;
      const clerkOrgId = event.data.last_active_organization_id;
      const user = findCalixoUserByClerkId(clerkUserId);
      const organization = clerkOrgId ? organizationRegistry.lookupByClerkOrgId(clerkOrgId) : undefined;
      // A session for a Clerk identity that hasn't touched the app yet (no JIT-provisioned Calixo user) has nothing meaningful to attribute — skip rather than fabricate a record.
      if (user) {
        await auditService.recordEvent({
          organizationId: organization?.id,
          userId: user.id,
          eventType: event.type === "session.created" ? "session_created" : "session_ended",
          resource: "session",
          resourceId: event.data.id,
          description: event.type === "session.created" ? `${user.displayName} signed in` : `${user.displayName} signed out`,
        });

        // Bootstrap Platform Owner: a real login is the one genuine, once-per-session event to hang
        // "platform admin login" off — matches the brief's own spec exactly ("When a Clerk user logs
        // in: IF user.email exists in PLATFORM_OWNER_EMAILS, assign role = PLATFORM_OWNER"). Only the
        // allowlist is checked here (not Clerk org membership) — PLATFORM_ADMIN/DEVELOPER logins aren't
        // separately audited this way, since org role isn't reliably present on this webhook's payload
        // without an extra Clerk API call; those roles' access is still fully audited at the route layer
        // (`platform_access_granted`/`_denied`) regardless.
        if (event.type === "session.created" && PLATFORM_OWNER_EMAILS.includes(user.email.toLowerCase())) {
          await recordPlatformAdminLogin(user.id);
          if (user.metadata?.platformRole !== "PLATFORM_OWNER") {
            user.metadata = { ...user.metadata, platformRole: "PLATFORM_OWNER" };
            await recordPlatformRoleAssigned(user.id, "PLATFORM_OWNER");
          }
        }
      }
      break;
    }

    case "organizationMembership.created": {
      const clerkUserId = event.data.public_user_data.user_id;
      const clerkOrgId = event.data.organization.id;
      const user = findCalixoUserByClerkId(clerkUserId);
      const organization = organizationRegistry.lookupByClerkOrgId(clerkOrgId);
      if (user && organization) {
        await auditService.recordEvent({
          organizationId: organization.id,
          userId: user.id,
          eventType: "membership_added",
          resource: "organization",
          resourceId: organization.id,
          description: `${user.displayName} joined ${organization.name}`,
        });
      }
      break;
    }

    case "organizationInvitation.accepted": {
      const clerkUserId = event.data.user_id;
      const clerkOrgId = event.data.organization_id;
      const user = findCalixoUserByClerkId(clerkUserId);
      const organization = clerkOrgId ? organizationRegistry.lookupByClerkOrgId(clerkOrgId) : undefined;
      if (user) {
        await auditService.recordEvent({
          organizationId: organization?.id,
          userId: user.id,
          eventType: "membership_added",
          resource: "organization_invitation",
          resourceId: event.data.id,
          description: `${user.displayName} accepted an invitation${organization ? ` to ${organization.name}` : ""}`,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
