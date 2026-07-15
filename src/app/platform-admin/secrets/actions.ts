"use server";

/**
 * Calixo Platform - Internal Platform Secrets Console: Server Actions
 *
 * The ONLY entry points the client page uses. Real plaintext values only
 * ever cross the wire once, on submit, over the same-origin Server Action
 * transport — never in a response. `core/platform/secrets`'s registry/vault
 * are `import "server-only"`, so this file is the sole caller; nothing here
 * imports the engine into a client bundle.
 */
import { assertPlatformAdmin, NotPlatformAdminError } from "../guard";
import { recordPlatformAccess } from "@/features/platform-admin/platformAccessAudit.server";
import { listPlatformSecrets, addOrUpdateSecret, rotateSecret, validateSecret, testConnection } from "@/core/platform/secrets";
import type { SecretActionResult, PlatformSecretSummary } from "@/core/platform/secrets";

function denied(err: unknown): SecretActionResult {
  if (err instanceof NotPlatformAdminError) return { ok: false, error: err.message };
  return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
}

export async function listPlatformSecretsAction(): Promise<{ ok: boolean; error?: string; secrets?: PlatformSecretSummary[] }> {
  try {
    const { userId, role } = await assertPlatformAdmin();
    // The brief's own worked example ("Uttam Das accessed Platform Secrets.") — logged once per real page load, not per Server Action mutation.
    await recordPlatformAccess({ calixoUserId: userId, role, granted: true, resource: "Platform Secrets" });
    return { ok: true, secrets: await listPlatformSecrets() };
  } catch (err) {
    return denied(err);
  }
}

export async function addOrUpdateSecretAction(catalogId: string, plaintext: string): Promise<SecretActionResult> {
  try {
    const { userId } = await assertPlatformAdmin();
    return await addOrUpdateSecret(catalogId, plaintext, userId);
  } catch (err) {
    return denied(err);
  }
}

export async function rotateSecretAction(catalogId: string, plaintext?: string): Promise<SecretActionResult> {
  try {
    const { userId } = await assertPlatformAdmin();
    return await rotateSecret(catalogId, userId, plaintext);
  } catch (err) {
    return denied(err);
  }
}

export async function validateSecretAction(catalogId: string): Promise<SecretActionResult> {
  try {
    const { userId } = await assertPlatformAdmin();
    return await validateSecret(catalogId, userId);
  } catch (err) {
    return denied(err);
  }
}

export async function testConnectionAction(catalogId: string): Promise<SecretActionResult> {
  try {
    const { userId } = await assertPlatformAdmin();
    return await testConnection(catalogId, userId);
  } catch (err) {
    return denied(err);
  }
}
