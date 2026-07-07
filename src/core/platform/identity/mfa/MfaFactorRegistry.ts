import { platformEventBus } from "../../events/PlatformEventBus";
import type { MfaChallengeProvider, MfaFactor, MfaMethodType } from "./types";

/** Real enrollment bookkeeping; zero real OTP/WebAuthn/SMS logic — a provider registers itself here in a future phase (`registerProvider`), nothing does today. */
export class MfaFactorRegistry {
  private factors = new Map<string, MfaFactor[]>();
  private providers = new Map<MfaMethodType, MfaChallengeProvider>();

  enroll(userId: string, type: MfaMethodType, metadata?: Record<string, unknown>): MfaFactor {
    const factor: MfaFactor = {
      id: `mfa-${userId}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      type,
      isVerified: false,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      metadata,
    };
    const list = this.factors.get(userId) ?? [];
    list.push(factor);
    this.factors.set(userId, list);
    return factor;
  }

  markVerified(userId: string, factorId: string): MfaFactor | undefined {
    const factor = this.factors.get(userId)?.find(f => f.id === factorId);
    if (!factor) return undefined;
    factor.isVerified = true;
    void platformEventBus.publish({ type: "SecurityAlert", userId, payload: { reason: "mfa_enabled", factorType: factor.type } });
    return factor;
  }

  remove(userId: string, factorId: string): boolean {
    const list = this.factors.get(userId);
    if (!list) return false;
    const next = list.filter(f => f.id !== factorId);
    this.factors.set(userId, next);
    return next.length !== list.length;
  }

  getFactors(userId: string): MfaFactor[] {
    return this.factors.get(userId) ?? [];
  }

  hasMfaEnabled(userId: string): boolean {
    return (this.factors.get(userId) ?? []).some(f => f.isVerified);
  }

  /** A real MFA provider (TOTP, Twilio SMS, WebAuthn) registers itself here in a future phase. */
  registerProvider(provider: MfaChallengeProvider): void {
    this.providers.set(provider.type, provider);
  }

  isProviderReady(type: MfaMethodType): boolean {
    return this.providers.has(type);
  }

  count(): number {
    return Array.from(this.factors.values()).reduce((sum, list) => sum + list.length, 0);
  }
}

export const mfaFactorRegistry = new MfaFactorRegistry();
