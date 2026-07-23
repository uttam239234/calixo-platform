/**
 * Calixo Platform - OAuth Applications: Registry
 *
 * `import "server-only"` for the exact reason `PlatformSecretsRegistry.ts`
 * documents: the real AES-256-GCM key must live in exactly one place, the
 * Next.js server process. A dedicated `SecretVault` instance — not the
 * platform secrets console's own vault, and not the per-organization
 * connector `secretVault` singleton — keeps OAuth application secrets on
 * their own key, isolated from both.
 *
 * Two tables, mirroring `PlatformSecretsRegistry`'s own split exactly:
 * `platform_oauth_applications_metadata` (status, timestamps, plaintext
 * client ids — never a secret value) and `platform_oauth_applications_vault`
 * (the encrypted blob + keyring, so `reveal()` still works after a real
 * process restart).
 */
import "server-only";
import { SecretVault, type VaultExportState } from "@/integrations/secrets/SecretVault";
import { readTable, writeTable } from "@/core/platform/configStore/PlatformConfigFileStore";
import { OAUTH_PROVIDER_IDS } from "./types";
import type { PlatformOAuthApplication } from "./types";

const oauthVault = new SecretVault();

const records = new Map<string, PlatformOAuthApplication>();

let readyPromise: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const persistedVault = readTable<VaultExportState>("platform_oauth_applications_vault");
      if (persistedVault) await oauthVault.importState(persistedVault);

      // `redirectUri` was persisted here in an earlier round; it's now environment-derived
      // infrastructure computed fresh on every use (see `types.ts`'s `PlatformOAuthApplication`
      // doc comment), never trusted from storage. Typed as an extra untyped field below purely
      // to detect and strip a legacy value — real code never reads it again after this migration.
      const persistedRecords = readTable<(PlatformOAuthApplication & { redirectUri?: string })[]>("platform_oauth_applications_metadata");
      if (persistedRecords?.length) {
        let migratedLegacyRedirectUri = false;
        for (const { redirectUri, ...record } of persistedRecords) {
          if (redirectUri !== undefined) migratedLegacyRedirectUri = true;
          records.set(record.provider, record);
        }
        if (migratedLegacyRedirectUri) await persist();
      } else {
        for (const provider of OAUTH_PROVIDER_IDS) {
          records.set(provider, { id: provider, provider, status: "missing", defaultScopes: [], extraFieldValues: {}, extraSecretRefs: {} });
        }
      }
    })();
  }
  return readyPromise;
}

async function persist(): Promise<void> {
  await Promise.all([
    writeTable("platform_oauth_applications_metadata", Array.from(records.values())),
    writeTable("platform_oauth_applications_vault", await oauthVault.exportState()),
  ]);
}

export const oauthApplicationRegistry = {
  vault: oauthVault,

  async get(provider: string): Promise<PlatformOAuthApplication | undefined> {
    await ensureReady();
    return records.get(provider);
  },

  async list(): Promise<PlatformOAuthApplication[]> {
    await ensureReady();
    return OAUTH_PROVIDER_IDS.map(provider => records.get(provider) ?? { id: provider, provider, status: "missing" as const, defaultScopes: [], extraFieldValues: {}, extraSecretRefs: {} });
  },

  async set(record: PlatformOAuthApplication): Promise<void> {
    await ensureReady();
    records.set(record.provider, record);
    await persist();
  },
};
