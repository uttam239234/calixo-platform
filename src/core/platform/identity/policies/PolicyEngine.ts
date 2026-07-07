/**
 * Calixo Platform - Auth Policy Engine
 *
 * Composes the effective authentication policy for an organization by
 * layering: `passwordService.getPolicy()` (reused, not duplicated),
 * `AUTH_CONFIG.SESSION` (reused), and the organization's OWN
 * `OrganizationSettings.security` (already modeled in the Platform
 * Foundation phase — `twoFactorRequired`/`sessionTimeoutMinutes` were
 * declared but nothing ever read them until now).
 */
import { passwordService } from "@/identity/services/PasswordService";
import { AUTH_CONFIG } from "@/identity/config";
import { organizationRegistry } from "../../organizations/OrganizationRegistry";
import type { DevicePolicy, EffectiveAuthPolicy, IpRestrictionPolicy, SessionPolicy, TrustedNetworkPolicy } from "../types";

const DEFAULT_DEVICE_POLICY: DevicePolicy = { requireTrustedDeviceForRememberMe: false, maxTrustedDevices: 10 };

export class PolicyEngine {
  private ipRestrictions = new Map<string, IpRestrictionPolicy>();
  private trustedNetworks = new Map<string, TrustedNetworkPolicy>();
  private devicePolicies = new Map<string, DevicePolicy>();

  getSessionPolicy(organizationId: string): SessionPolicy {
    const organization = organizationRegistry.lookup(organizationId);
    return {
      idleTimeoutMinutes: 30,
      absoluteTimeoutMinutes: organization?.settings.security.sessionTimeoutMinutes ?? 60,
      maxConcurrentSessions: AUTH_CONFIG.SESSION.MAX_ACTIVE_SESSIONS,
    };
  }

  getDevicePolicy(organizationId: string): DevicePolicy {
    return this.devicePolicies.get(organizationId) ?? DEFAULT_DEVICE_POLICY;
  }

  setDevicePolicy(organizationId: string, policy: DevicePolicy): void {
    this.devicePolicies.set(organizationId, policy);
  }

  setIpRestriction(policy: IpRestrictionPolicy): void {
    this.ipRestrictions.set(policy.organizationId, policy);
  }

  getIpRestriction(organizationId: string): IpRestrictionPolicy {
    return this.ipRestrictions.get(organizationId) ?? { organizationId, mode: "off", cidrs: [] };
  }

  setTrustedNetwork(policy: TrustedNetworkPolicy): void {
    this.trustedNetworks.set(policy.organizationId, policy);
  }

  getTrustedNetwork(organizationId: string): TrustedNetworkPolicy {
    return this.trustedNetworks.get(organizationId) ?? { organizationId, trustedCidrs: [], bypassMfaOnTrustedNetwork: false };
  }

  /** Two-factor requirement is read straight from `OrganizationSettings.security.twoFactorRequired` — set once during Organization Platform, never consumed until now. */
  isTwoFactorRequired(organizationId: string): boolean {
    return organizationRegistry.lookup(organizationId)?.settings.security.twoFactorRequired ?? false;
  }

  getEffectivePolicy(organizationId: string): EffectiveAuthPolicy {
    return {
      password: passwordService.getPolicy(),
      session: this.getSessionPolicy(organizationId),
      device: this.getDevicePolicy(organizationId),
      twoFactorRequired: this.isTwoFactorRequired(organizationId),
      ipRestriction: this.getIpRestriction(organizationId),
      trustedNetwork: this.getTrustedNetwork(organizationId),
    };
  }
}

export const policyEngine = new PolicyEngine();
