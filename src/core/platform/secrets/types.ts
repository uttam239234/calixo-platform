/**
 * Calixo Platform - Internal Platform Secrets Console: Types
 *
 * These describe METADATA only — status, timestamps, outcomes. No type in
 * this file, and no value returned by anything in this module, ever carries
 * a secret's plaintext or its sealed ciphertext reference back to a caller.
 */

export type SecretSection = "ai_providers" | "authentication" | "payments" | "integrations" | "security" | "database" | "storage" | "monitoring";

/**
 * How "Rotate Secret" behaves for a given catalog entry:
 *  - "generate": Calixo controls the value's format entirely (a signing
 *    secret, not issued by any vendor) — rotate mints a fresh cryptographically
 *    random value itself, no input needed.
 *  - "manual": a vendor/infrastructure-issued credential — Calixo cannot mint
 *    a working replacement; rotate requires the admin to paste the new value
 *    obtained from the vendor's own dashboard (same input as Update, tagged
 *    with a distinct audit event and `lastRotatedAt`).
 */
export type RotationStrategy = "generate" | "manual";

/** Whether "Test Connection" can attempt a real, live network round-trip to the vendor, or only a local format check. */
export type TestSupport = "live" | "format_only";

export interface SecretCatalogEntry {
  id: string;
  section: SecretSection;
  label: string;
  description: string;
  placeholder: string;
  rotationStrategy: RotationStrategy;
  testSupport: TestSupport;
  /** Real env var this secret corresponds to, if any — used only to seed the initial Configured/Missing status from `process.env` presence (never its value) at first read. */
  envVar?: string;
  /** Real, local format check against the actual plaintext (server-side only, never sent to the client) — e.g. a vendor's documented key prefix. */
  validateFormat: (plaintext: string) => { valid: boolean; message: string };
}

export type SecretStatus = "configured" | "missing";
export type ValidationOutcome = "valid" | "invalid";
export type TestOutcome = "success" | "failed" | "format_only" | "unreachable";

export interface PlatformSecretRecord {
  catalogId: string;
  status: SecretStatus;
  /** Opaque reference into the server-only vault instance — never the plaintext. */
  sealedRef?: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  lastRotatedAt?: string;
  lastValidatedAt?: string;
  lastValidationResult?: ValidationOutcome;
  lastValidationMessage?: string;
  lastTestedAt?: string;
  lastTestResult?: TestOutcome;
  lastTestMessage?: string;
}

/** The one shape ever sent to the client — a `PlatformSecretRecord` with the catalog's own descriptive fields joined in, and `lastUpdatedBy` resolved to a display name. Still carries no secret material. */
export interface PlatformSecretSummary {
  id: string;
  section: SecretSection;
  label: string;
  description: string;
  placeholder: string;
  rotationStrategy: RotationStrategy;
  testSupport: TestSupport;
  status: SecretStatus;
  lastUpdatedAt?: string;
  lastUpdatedByName?: string;
  lastRotatedAt?: string;
  lastValidatedAt?: string;
  lastValidationResult?: ValidationOutcome;
  lastValidationMessage?: string;
  lastTestedAt?: string;
  lastTestResult?: TestOutcome;
  lastTestMessage?: string;
}

export interface SecretActionResult {
  ok: boolean;
  error?: string;
  summary?: PlatformSecretSummary;
}
