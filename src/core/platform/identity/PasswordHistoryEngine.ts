import { passwordService } from "@/identity/services/PasswordService";
import type { PasswordHistoryEntry } from "./types";

/**
 * `PasswordPolicyConfig.requireNoReuse`/`maxReuseHistory` already existed
 * in `src/identity/types` but nothing ever enforced them — `PasswordService`
 * validates strength and hashes, but never checked reuse. This engine adds
 * that enforcement on top of it without touching `PasswordService` itself.
 */
export class PasswordHistoryEngine {
  private history = new Map<string, PasswordHistoryEntry[]>();

  async isReused(userId: string, newPassword: string): Promise<boolean> {
    const policy = passwordService.getPolicy();
    if (!policy.requireNoReuse) return false;
    const entries = (this.history.get(userId) ?? []).slice(-policy.maxReuseHistory);
    for (const entry of entries) {
      if (await passwordService.verify(newPassword, entry.passwordHash)) return true;
    }
    return false;
  }

  record(userId: string, passwordHash: string): void {
    const entries = this.history.get(userId) ?? [];
    entries.push({ userId, passwordHash, changedAt: new Date().toISOString() });
    const policy = passwordService.getPolicy();
    this.history.set(userId, entries.slice(-Math.max(policy.maxReuseHistory, 1)));
  }

  isExpired(userId: string, passwordChangedAt: string): boolean {
    return passwordService.isExpired(passwordChangedAt);
  }
}

export const passwordHistoryEngine = new PasswordHistoryEngine();
