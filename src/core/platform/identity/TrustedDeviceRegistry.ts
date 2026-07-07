import { platformEventBus } from "../events/PlatformEventBus";
import type { TrustedDevice } from "./types";

/** Distinct from `SessionService`'s per-session device parsing — this is an explicit, user-approved "remember this device" registry, keyed by a client-supplied fingerprint. */
export class TrustedDeviceRegistry {
  private devices = new Map<string, TrustedDevice[]>();

  isTrusted(userId: string, fingerprint: string): boolean {
    return (this.devices.get(userId) ?? []).some(d => d.fingerprint === fingerprint);
  }

  trust(userId: string, fingerprint: string, deviceName: string): TrustedDevice {
    const existing = this.devices.get(userId) ?? [];
    const found = existing.find(d => d.fingerprint === fingerprint);
    if (found) {
      found.lastSeenAt = new Date().toISOString();
      return found;
    }
    const device: TrustedDevice = {
      id: `device-${userId}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      fingerprint,
      deviceName,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      trustedAt: new Date().toISOString(),
    };
    existing.push(device);
    this.devices.set(userId, existing);
    return device;
  }

  revoke(userId: string, deviceId: string): boolean {
    const existing = this.devices.get(userId);
    if (!existing) return false;
    const next = existing.filter(d => d.id !== deviceId);
    this.devices.set(userId, next);
    void platformEventBus.publish({ type: "SecurityAlert", userId, payload: { reason: "trusted_device_removed", deviceId } });
    return next.length !== existing.length;
  }

  list(userId: string): TrustedDevice[] {
    return this.devices.get(userId) ?? [];
  }

  count(): number {
    return Array.from(this.devices.values()).reduce((sum, list) => sum + list.length, 0);
  }
}

export const trustedDeviceRegistry = new TrustedDeviceRegistry();
