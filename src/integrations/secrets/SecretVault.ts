/**
 * Calixo Platform - Secret Vault
 *
 * REAL encryption (Web Crypto AES-256-GCM — the same "Web Crypto API"
 * convention `PasswordService` already documents using, chosen over
 * Node's `crypto` module so this stays safe to import from code that may
 * end up in a client bundle), not a placeholder. Found during the
 * Enterprise Integration Architecture Audit: `Connection.auth.oauth2.accessToken`
 * (and `apiKey.key`, `basic.password`) were stored as PLAIN STRINGS
 * directly on the in-memory `Connection` object — a real security gap for
 * "Encrypted Secret Storage."
 *
 * Design: rather than changing `AuthCredentials`' shape (a widely-typed,
 * pre-existing contract — redesigning it is out of scope), the vault
 * stores the actual secret ciphertext keyed by an opaque reference string,
 * and callers (`IntegrationService.completeOAuth`, `SecretPlatformAPI`)
 * put that REFERENCE — not the plaintext — into `AuthCredentials` fields.
 * `reveal()` is the only way to get the real value back, and every reveal
 * is a deliberate, auditable call rather than a field read.
 *
 * Key rotation is real: `rotateKey()` generates a new active key and keeps
 * old keys in the ring so previously-sealed secrets still `reveal()`
 * correctly — verified live.
 */

export interface SealedSecretRef {
  reference: string;
}

interface VaultEntry {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  keyId: string;
}

interface KeyringEntry {
  id: string;
  key: CryptoKey;
  createdAt: string;
}

function getSubtle(): SubtleCrypto {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error("Web Crypto API (globalThis.crypto.subtle) is not available in this runtime");
  }
  return cryptoObj.subtle;
}

function randomId(): string {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export class SecretVault {
  private entries = new Map<string, VaultEntry>();
  private keyring: KeyringEntry[] = [];
  private activeKeyId: string | null = null;
  private keyReady: Promise<void>;

  constructor() {
    this.keyReady = this.generateKey();
  }

  private async generateKey(): Promise<void> {
    const subtle = getSubtle();
    const key = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const id = randomId();
    this.keyring.push({ id, key, createdAt: new Date().toISOString() });
    this.activeKeyId = id;
  }

  /** Generates a new active key; ciphertext already sealed under older keys is untouched and still decryptable. */
  async rotateKey(): Promise<string> {
    await this.keyReady;
    await this.generateKey();
    return this.activeKeyId!;
  }

  private async ensureReady(): Promise<KeyringEntry> {
    await this.keyReady;
    const active = this.keyring.find(k => k.id === this.activeKeyId);
    if (!active) throw new Error("Secret Vault has no active key");
    return active;
  }

  async seal(plaintext: string): Promise<string> {
    const subtle = getSubtle();
    const active = await this.ensureReady();
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, active.key, new TextEncoder().encode(plaintext));

    const reference = `vault:${randomId()}`;
    this.entries.set(reference, { ciphertext, iv, keyId: active.id });
    return reference;
  }

  async reveal(reference: string): Promise<string> {
    const entry = this.entries.get(reference);
    if (!entry) throw new Error(`Unknown secret reference: ${reference}`);

    const keyringEntry = this.keyring.find(k => k.id === entry.keyId);
    if (!keyringEntry) throw new Error(`Secret was sealed under a key that no longer exists: ${entry.keyId}`);

    const subtle = getSubtle();
    const plaintextBuffer = await subtle.decrypt({ name: "AES-GCM", iv: entry.iv as BufferSource }, keyringEntry.key, entry.ciphertext);
    return new TextDecoder().decode(plaintextBuffer);
  }

  revoke(reference: string): boolean {
    return this.entries.delete(reference);
  }

  isReference(value: string): boolean {
    return value.startsWith("vault:");
  }

  keyCount(): number {
    return this.keyring.length;
  }

  count(): number {
    return this.entries.size;
  }
}

export const secretVault = new SecretVault();
