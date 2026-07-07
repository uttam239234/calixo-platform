import { platformEventBus } from "../events/PlatformEventBus";
import { trustedDeviceRegistry } from "./TrustedDeviceRegistry";
import type { SecurityEventRecord } from "./types";
import type { SecurityEventType } from "@/identity/types";

/**
 * The Login History / Security Audit log `src/identity` never had — an
 * append-only event log per user, plus rule-based (not ML) suspicious-login
 * detection: a login from a device fingerprint the user hasn't trusted and
 * hasn't been seen recently is flagged, exactly the same
 * deterministic-threshold pattern used by Analytics' anomaly detection.
 */
export class SecurityEventEngine {
  private events: SecurityEventRecord[] = [];
  private seenFingerprints = new Map<string, Set<string>>();

  record(userId: string, type: SecurityEventType, context: { ipAddress?: string; userAgent?: string; deviceFingerprint?: string; metadata?: Record<string, unknown> } = {}): SecurityEventRecord {
    const isNewDevice = context.deviceFingerprint ? !this.hasSeenDevice(userId, context.deviceFingerprint) : undefined;
    if (context.deviceFingerprint) this.markSeen(userId, context.deviceFingerprint);

    const event: SecurityEventRecord = {
      id: `secevt-${userId}-${this.events.length}`,
      userId,
      type,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      deviceFingerprint: context.deviceFingerprint,
      isNewDevice,
      metadata: context.metadata,
      createdAt: new Date().toISOString(),
    };
    this.events.push(event);

    if (type === "account_locked") {
      void platformEventBus.publish({ type: "AccountLocked", userId, payload: { ipAddress: context.ipAddress } });
    }
    if (isNewDevice && type === "login_success") {
      void platformEventBus.publish({ type: "SecurityAlert", userId, payload: { reason: "new_device_login", ipAddress: context.ipAddress, userAgent: context.userAgent } });
    }
    return event;
  }

  /** Rule-based: flags a login as suspicious if it's from a brand-new device AND not an already-trusted device. Deterministic, not ML — same honesty standard as every other "AI" surface in this codebase. */
  isSuspicious(userId: string, deviceFingerprint?: string): boolean {
    if (!deviceFingerprint) return false;
    const isNew = !this.hasSeenDevice(userId, deviceFingerprint);
    const isTrusted = trustedDeviceRegistry.isTrusted(userId, deviceFingerprint);
    return isNew && !isTrusted;
  }

  getLoginHistory(userId: string, limit = 20): SecurityEventRecord[] {
    return this.events
      .filter(e => e.userId === userId && (e.type === "login_success" || e.type === "login_failed"))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getSecurityAuditTrail(userId: string, limit = 50): SecurityEventRecord[] {
    return this.events
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  private hasSeenDevice(userId: string, fingerprint: string): boolean {
    return this.seenFingerprints.get(userId)?.has(fingerprint) ?? false;
  }

  private markSeen(userId: string, fingerprint: string): void {
    const set = this.seenFingerprints.get(userId) ?? new Set<string>();
    set.add(fingerprint);
    this.seenFingerprints.set(userId, set);
  }
}

export const securityEventEngine = new SecurityEventEngine();
