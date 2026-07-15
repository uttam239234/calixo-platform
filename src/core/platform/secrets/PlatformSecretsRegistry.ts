/**
 * Calixo Platform - Internal Platform Secrets Console: Registry
 *
 * `import "server-only"` is deliberate and stricter than every sibling
 * `core/platform` registry (those are intentionally isomorphic, called
 * directly from client-side hooks). This one is not: `SecretVault`'s real
 * AES-256-GCM encryption key must live in exactly one place — the Next.js
 * server process — not scattered across whichever admin's browser tab
 * happened to call it. The existing `secretVault` singleton
 * (`@/integrations/secrets/SecretVault`) is already imported by client
 * components (the Integrations connect wizard) for per-organization
 * connector secrets, so a SEPARATE `SecretVault` instance is created here
 * rather than reusing that shared, client-reachable one. If this file is
 * ever accidentally imported into a "use client" bundle, the build fails
 * immediately instead of silently running a second, browser-local vault.
 *
 * Round 20 persistence: `get`/`list`/`set` became async (were sync) — the
 * one-time hydration read now genuinely touches disk (`PlatformConfigFileStore`)
 * and, when a persisted vault export exists, re-imports the AES keyring via
 * Web Crypto, which is itself async. `platform_secrets_metadata` (status,
 * timestamps — never a value) and `platform_secrets_vault` (the encrypted
 * blob + keyring, so `reveal()` still works after a real restart) are two
 * separate tables, matching the brief's own example table name exactly for
 * the former.
 */
import "server-only";
import { SecretVault, type VaultExportState } from "@/integrations/secrets/SecretVault";
import { readTable, writeTable } from "@/core/platform/configStore/PlatformConfigFileStore";
import { listCatalog } from "./PlatformSecretCatalog";
import type { PlatformSecretRecord } from "./types";

const platformSecretVault = new SecretVault();

const records = new Map<string, PlatformSecretRecord>();

let readyPromise: Promise<void> | null = null;

/** Loads persisted metadata + vault state from disk on first access; falls back to seeding Configured/Missing from real `process.env` presence only when no persisted metadata exists yet (a genuinely first-ever boot). Never reads or stores an env var's actual value. */
function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const persistedVault = readTable<VaultExportState>("platform_secrets_vault");
      if (persistedVault) await platformSecretVault.importState(persistedVault);

      const persistedRecords = readTable<PlatformSecretRecord[]>("platform_secrets_metadata");
      if (persistedRecords?.length) {
        for (const record of persistedRecords) records.set(record.catalogId, record);
      } else {
        for (const entry of listCatalog()) {
          const presentInEnv = entry.envVar ? Boolean(process.env[entry.envVar]?.trim()) : false;
          records.set(entry.id, {
            catalogId: entry.id,
            status: presentInEnv ? "configured" : "missing",
            lastUpdatedAt: presentInEnv ? new Date().toISOString() : undefined,
          });
        }
      }
    })();
  }
  return readyPromise;
}

async function persist(): Promise<void> {
  await Promise.all([writeTable("platform_secrets_metadata", Array.from(records.values())), writeTable("platform_secrets_vault", await platformSecretVault.exportState())]);
}

export const platformSecretsRegistry = {
  vault: platformSecretVault,

  async get(catalogId: string): Promise<PlatformSecretRecord | undefined> {
    await ensureReady();
    return records.get(catalogId);
  },

  async list(): Promise<PlatformSecretRecord[]> {
    await ensureReady();
    return listCatalog().map(entry => records.get(entry.id) ?? { catalogId: entry.id, status: "missing" as const });
  },

  async set(record: PlatformSecretRecord): Promise<void> {
    await ensureReady();
    records.set(record.catalogId, record);
    await persist();
  },
};
