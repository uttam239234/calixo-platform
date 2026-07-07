/** Calixo Platform - MFA Extension Points (architecture only — no external provider integrations, per the mandate). */

export type MfaMethodType = "totp" | "sms" | "email-otp" | "backup-codes" | "security-key" | "passkey";

export interface MfaFactor {
  id: string;
  userId: string;
  type: MfaMethodType;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: string;
  /** e.g. masked phone number, key nickname — never a real secret. */
  metadata?: Record<string, unknown>;
}

export interface MfaChallengeResult {
  success: boolean;
  factorId: string;
  verifiedAt?: string;
}

/** The contract a real provider (a TOTP library, Twilio for SMS, WebAuthn for passkeys/security keys) implements in a future phase. Nothing in this phase implements it. */
export interface MfaChallengeProvider {
  type: MfaMethodType;
  startChallenge(factor: MfaFactor): Promise<{ challengeId: string }>;
  verifyChallenge(challengeId: string, code: string): Promise<MfaChallengeResult>;
}
