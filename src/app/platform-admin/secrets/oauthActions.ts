"use server";

/**
 * Calixo Platform - OAuth Applications Console: Server Actions
 *
 * Read actions (`list`, `getAuditLog`) require Platform Admin route access
 * (`assertPlatformAdmin` — PLATFORM_OWNER or PLATFORM_ADMIN), matching
 * every other Platform Admin console. Every mutation (`save`, `reset`,
 * `validate`, `test`) requires `assertPlatformOwner` specifically — the
 * brief's "Only Platform Owner may Create/Update/Delete/Validate/Test.
 * Everyone else Read Only." `listOAuthApplicationsAction` also returns
 * `canManage` so the client can disable mutation controls up front, not
 * just discover the denial after clicking.
 */
import { assertPlatformAdmin, assertPlatformOwner, NotPlatformAdminError, NotPlatformOwnerError } from "../guard";
import { recordPlatformAccess } from "@/features/platform-admin/platformAccessAudit.server";
import { OAuthApplicationService } from "@/core/platform/secrets/oauth";
import { getRequestOrigin } from "@/shared/server/requestOrigin";
import type { OAuthActionResult, OAuthApplicationInput, OAuthApplicationSummary, OAuthAuditEntry, OAuthProviderId } from "@/core/platform/secrets/oauth";

function denied(err: unknown): OAuthActionResult {
  if (err instanceof NotPlatformAdminError || err instanceof NotPlatformOwnerError) return { ok: false, error: err.message };
  return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
}

export async function listOAuthApplicationsAction(): Promise<{ ok: boolean; error?: string; applications?: OAuthApplicationSummary[]; canManage?: boolean }> {
  try {
    const { userId, role } = await assertPlatformAdmin();
    await recordPlatformAccess({ calixoUserId: userId, role, granted: true, resource: "OAuth Applications" });
    return { ok: true, applications: await OAuthApplicationService.list(), canManage: role === "PLATFORM_OWNER" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function saveOAuthApplicationAction(provider: OAuthProviderId, input: OAuthApplicationInput): Promise<OAuthActionResult> {
  try {
    const { userId } = await assertPlatformOwner();
    const existing = await OAuthApplicationService.get(provider);
    return existing?.status === "missing" ? await OAuthApplicationService.create(provider, input, userId) : await OAuthApplicationService.update(provider, input, userId);
  } catch (err) {
    return denied(err);
  }
}

export async function resetOAuthApplicationAction(provider: OAuthProviderId): Promise<OAuthActionResult> {
  try {
    const { userId } = await assertPlatformOwner();
    return await OAuthApplicationService.delete(provider, userId);
  } catch (err) {
    return denied(err);
  }
}

export async function validateOAuthApplicationAction(provider: OAuthProviderId): Promise<OAuthActionResult> {
  try {
    const { userId } = await assertPlatformOwner();
    return await OAuthApplicationService.validate(provider, userId);
  } catch (err) {
    return denied(err);
  }
}

export async function testOAuthApplicationAction(provider: OAuthProviderId): Promise<OAuthActionResult> {
  try {
    const { userId } = await assertPlatformOwner();
    const origin = await getRequestOrigin();
    return await OAuthApplicationService.test(provider, userId, origin);
  } catch (err) {
    return denied(err);
  }
}

export async function getOAuthAuditLogAction(provider: OAuthProviderId): Promise<{ ok: boolean; error?: string; entries?: OAuthAuditEntry[] }> {
  try {
    await assertPlatformAdmin();
    return { ok: true, entries: await OAuthApplicationService.getAuditLog(provider) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

