import "server-only";

/**
 * Calixo Platform - AIOS Provider Key Resolution
 *
 * Every real provider (`OpenAIProvider`/`AnthropicProvider`/`GoogleProvider`)
 * needs the same thing: "is this vendor's key configured, and if so, what's
 * the plaintext?" — sourced from the same real, sealed `platformSecretsRegistry`
 * the Platform Secrets Console (Round 19) already writes to, not a second
 * key store. `import "server-only"` here is deliberate: this is the exact
 * point a raw vendor API key touches process memory, so it must be
 * impossible to reach from a client bundle, the same guarantee
 * `PlatformSecretsRegistry` itself already provides for the admin console.
 *
 * These files are intentionally never re-exported from `@/aios`'s barrel
 * `index.ts` — deep-import them directly wherever needed. A prior round
 * (Adaptive Workspace OS) broke a client build by re-exporting a `server-only`
 * class through a widely-reachable barrel; the fix there and the standing
 * rule here is the same: don't chase every downstream import site, just
 * don't put a `server-only` value in a barrel a client component might
 * import from for something unrelated.
 */
import { platformSecretsRegistry } from "@/core/platform/secrets/PlatformSecretsRegistry";

export async function getProviderKey(catalogId: string): Promise<string | undefined> {
  const record = await platformSecretsRegistry.get(catalogId);
  if (!record || record.status !== "configured" || !record.sealedRef) return undefined;
  try {
    return await platformSecretsRegistry.vault.reveal(record.sealedRef);
  } catch {
    return undefined;
  }
}

export async function isProviderKeyConfigured(catalogId: string): Promise<boolean> {
  const record = await platformSecretsRegistry.get(catalogId);
  return record?.status === "configured" && Boolean(record.sealedRef);
}
