/**
 * Calixo Platform - Encryption Readiness (architecture only)
 *
 * Per the mandate: "Architecture only." No cryptography is implemented or
 * called anywhere in this package. These types exist so a future phase's
 * field/column/tenant encryption and key rotation have a contract to
 * implement against instead of inventing one under time pressure.
 */

export interface FieldEncryptionConfig {
  entityType: string;
  field: string;
  algorithm: "aes-256-gcm";
}

export interface TenantEncryptionConfig {
  organizationId: string;
  keyId: string;
}

export interface KeyRotationPolicy {
  keyId: string;
  rotationIntervalDays: number;
  lastRotatedAt?: string;
}

/** Not implemented — would delegate to a secrets manager (Vault/KMS/etc.) in a real deployment. */
export interface SecretsProvider {
  getSecret(keyId: string): Promise<string>;
}
