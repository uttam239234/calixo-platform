/**
 * Calixo Platform - Authentication & Identity Platform Types
 *
 * New types this phase introduces on top of the existing `src/identity`
 * (AuthenticationService/SessionService/PasswordService/UserProfileService)
 * and `src/access` (AuthorizationEngine/roleService) engines — none of
 * which are redefined here, only extended with tenant-awareness, device
 * trust, login history, and password-history capabilities they didn't
 * have yet.
 */
import type { AuthenticatedUser, PasswordPolicyConfig, SecurityEventType, UserProfile } from "@/identity/types";
import type { TenantContext } from "../tenant/types";

// ============================================================================
// Trusted Devices
// ============================================================================

export interface TrustedDevice {
  id: string;
  userId: string;
  fingerprint: string;
  deviceName: string;
  firstSeenAt: string;
  lastSeenAt: string;
  trustedAt: string;
}

// ============================================================================
// Login History / Security Events
// ============================================================================

export interface SecurityEventRecord {
  id: string;
  userId: string;
  type: SecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  isNewDevice?: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================================
// Password History
// ============================================================================

export interface PasswordHistoryEntry {
  userId: string;
  passwordHash: string;
  changedAt: string;
}

// ============================================================================
// Policies
// ============================================================================

export interface SessionPolicy {
  idleTimeoutMinutes: number;
  absoluteTimeoutMinutes: number;
  maxConcurrentSessions: number;
}

export interface DevicePolicy {
  requireTrustedDeviceForRememberMe: boolean;
  maxTrustedDevices: number;
}

export interface IpRestrictionPolicy {
  organizationId: string;
  mode: "allowlist" | "denylist" | "off";
  cidrs: string[];
}

export interface TrustedNetworkPolicy {
  organizationId: string;
  trustedCidrs: string[];
  bypassMfaOnTrustedNetwork: boolean;
}

export interface EffectiveAuthPolicy {
  password: PasswordPolicyConfig;
  session: SessionPolicy;
  device: DevicePolicy;
  twoFactorRequired: boolean;
  ipRestriction: IpRestrictionPolicy;
  trustedNetwork: TrustedNetworkPolicy;
}

// ============================================================================
// Tenant-aware login
// ============================================================================

export interface TenantLoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  organizationId?: string;
  deviceFingerprint?: string;
  captchaToken?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TenantLoginResult {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
  isNewDevice: boolean;
  availableOrganizations: { id: string; name: string }[];
  tenantContext: TenantContext | null;
}

// ============================================================================
// Current User (bridges Identity's AuthenticatedUser/UserProfile with the
// Users & Teams directory + Tenant Context — the one shape every module
// should consume via `IdentityPlatformAPI.getCurrentUser()`)
// ============================================================================

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  profile: UserProfile | null;
  directoryUserId?: string;
  organizationId?: string;
  workspaceId?: string;
  tenantContext: TenantContext | null;
}

// ============================================================================
// CAPTCHA readiness (architecture only)
// ============================================================================

export interface CaptchaVerifier {
  isRequired(context: { failedAttempts: number }): boolean;
  verify(token: string): Promise<boolean>;
}
