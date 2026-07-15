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

/** JSON-safe (base64) mirror of the vault's live state — `exportState()`/`importState()`'s wire format, used by `PlatformSecretsRegistry` (Round 20) to survive a process restart. AES-GCM keys are generated `extractable: true` specifically so this round-trip is possible. */
export interface VaultExportState {
  keys: { id: string; keyBase64: string; createdAt: string }[];
  activeKeyId: string | null;
  entries: { reference: string; ciphertextBase64: string; ivBase64: string; keyId: string }[];
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

/** `btoa`/`atob` (not Node's `Buffer`) — both are real globals in Node AND the browser, keeping this file's existing "safe to import from client-reachable code" property. */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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

  /**
   * Serializes the live keyring + sealed entries to a JSON-safe shape —
   * `PlatformSecretsRegistry` (Round 20) writes this to disk after every
   * change so `reveal()` still works after a real process restart, not just
   * the metadata (Configured/Missing/Last Updated) around it. Exporting a
   * raw AES key to a local JSON file is a genuine, disclosed limitation —
   * this environment has no real KMS/HSM to hold it instead, same posture
   * already accepted for other locally-simulated secrets this session.
   */
  async exportState(): Promise<VaultExportState> {
    await this.keyReady;
    const subtle = getSubtle();
    const keys = await Promise.all(
      this.keyring.map(async k => ({ id: k.id, keyBase64: bytesToBase64(new Uint8Array(await subtle.exportKey("raw", k.key))), createdAt: k.createdAt }))
    );
    const entries = Array.from(this.entries.entries()).map(([reference, entry]) => ({
      reference,
      ciphertextBase64: bytesToBase64(new Uint8Array(entry.ciphertext)),
      ivBase64: bytesToBase64(entry.iv),
      keyId: entry.keyId,
    }));
    return { keys, activeKeyId: this.activeKeyId, entries };
  }

  /** Replaces the live keyring/entries with a previously-exported state. Awaits the constructor's own initial key generation first so that ephemeral key is cleanly discarded rather than racing this import. */
  async importState(state: VaultExportState): Promise<void> {
    await this.keyReady;
    const subtle = getSubtle();
    this.keyring = await Promise.all(
      state.keys.map(async k => ({ id: k.id, key: await subtle.importKey("raw", base64ToBytes(k.keyBase64) as BufferSource, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]), createdAt: k.createdAt }))
    );
    this.activeKeyId = state.activeKeyId;
    this.entries = new Map(state.entries.map(e => [e.reference, { ciphertext: base64ToBytes(e.ciphertextBase64).buffer as ArrayBuffer, iv: base64ToBytes(e.ivBase64), keyId: e.keyId }]));
    this.keyReady = Promise.resolve();
  }

  keyCount(): number {
    return this.keyring.length;
  }

  count(): number {
    return this.entries.size;
  }
}

export const secretVault = new SecretVault();
