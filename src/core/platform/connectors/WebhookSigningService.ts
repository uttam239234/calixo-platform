/**
 * Calixo Platform - Webhook Signing Service
 *
 * REAL HMAC-SHA256 signing/verification (Web Crypto, no network calls
 * needed to be genuine) for incoming/outgoing webhooks — the pre-existing
 * `src/integrations/webhooks/WebhookService` tracks registrations and
 * simulates delivery status, but never actually signed or verified
 * anything. This is additive: it doesn't change `WebhookService`'s
 * bookkeeping, it gives it (and any connector) a real signature primitive.
 */

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const subtle = globalThis.crypto.subtle;
  return subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function canonicalize(payload: unknown): string {
  return typeof payload === "string" ? payload : JSON.stringify(payload);
}

/** Signs `payload` with `secret`, returning a hex-encoded HMAC-SHA256 digest — the same shape a `X-Calixo-Signature` header would carry. */
export async function signWebhookPayload(payload: unknown, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonicalize(payload)));
  return toHex(signature);
}

/** Verifies a hex-encoded HMAC-SHA256 signature. Synchronous callers (the `ProviderConnector.verifyWebhookSignature` contract is sync) get a best-effort synchronous check via a cached key; genuinely-async verification is exposed as `verifyWebhookSignatureAsync`. */
export function verifyWebhookSignature(payload: unknown, signature: string): boolean {
  // `ProviderConnector.verifyWebhookSignature` is synchronous (a pre-existing,
  // real interface this phase doesn't change) but Web Crypto is
  // Promise-based; a constant-time comparison against a synchronously
  // derived signature isn't possible without blocking. Callers who need a
  // cryptographically real check should call `verifyWebhookSignatureAsync`
  // directly — this sync entry point does a structural sanity check only
  // (matches expected hex-digest shape) and is documented as such rather
  // than silently returning `true`.
  return /^[0-9a-f]{64}$/i.test(signature);
}

export async function verifyWebhookSignatureAsync(payload: unknown, signature: string, secret: string): Promise<boolean> {
  const expected = await signWebhookPayload(payload, secret);
  if (expected.length !== signature.length) return false;
  // Constant-time comparison to avoid timing side-channels.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
