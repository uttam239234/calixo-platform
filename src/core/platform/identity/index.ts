/**
 * Calixo Platform - Enterprise Authentication & Identity Platform
 *
 * Built on top of (never replacing) `src/identity`'s AuthenticationService/
 * IdentityService/PasswordService/SessionService/UserProfileService, and
 * `src/access`'s AuthorizationEngine/roleService via `TenantContextService`
 * (Platform Foundation phase). New this phase: tenant-aware login,
 * trusted devices, login history / security events, password-reuse
 * enforcement, session idle/absolute timeout policy, SSO/MFA extension
 * points (architecture only), and 4 platform-facade APIs.
 */
export * from "./types";

export { TrustedDeviceRegistry, trustedDeviceRegistry } from "./TrustedDeviceRegistry";
export { SecurityEventEngine, securityEventEngine } from "./SecurityEventEngine";
export { PasswordHistoryEngine, passwordHistoryEngine } from "./PasswordHistoryEngine";

export { AuthenticationPlatformAPI, authenticationPlatformAPI } from "./AuthenticationPlatformAPI";
export { SessionPlatformAPI, sessionPlatformAPI } from "./SessionPlatformAPI";
export { IdentityPlatformAPI, identityPlatformAPI } from "./IdentityPlatformAPI";
export { UserProfilePlatformAPI, userProfilePlatformAPI } from "./UserProfilePlatformAPI";

export { PolicyEngine, policyEngine } from "./policies";
export * from "./sso";
export * from "./mfa";

let initialized = false;
/** No built-in default catalog (same pattern as Organizations/Workspaces) — just flips the idempotency guard so callers can depend on identity services being ready. */
export function initializeIdentityFoundation(): void {
  if (initialized) return;
  initialized = true;
}
