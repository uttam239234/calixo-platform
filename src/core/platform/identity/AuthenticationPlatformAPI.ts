/**
 * Calixo Platform - Authentication Platform API
 *
 * The sanctioned entry point for every authentication flow. Wraps
 * `src/identity`'s `authService`/`identityService`/`passwordService`/
 * `sessionService` (none of which are modified) and adds what they never
 * had: tenant resolution after login, password-reuse enforcement, trusted-
 * device/security-event recording, and Platform Event publishing.
 */
import { ValidationError } from "@/errors";
import { authService } from "@/identity/services/AuthenticationService";
import { identityService } from "@/identity/services/IdentityService";
import { passwordService } from "@/identity/services/PasswordService";
import { sessionService } from "@/identity/services/SessionService";
import type { ChangePasswordRequest, RegisterRequest, RegisterResponse } from "@/identity/types";
import { platformEventBus } from "../events/PlatformEventBus";
import { organizationEngine } from "../organizations/OrganizationEngine";
import { workspaceEngine } from "../workspaces/WorkspaceEngine";
import { workspaceRegistry } from "../workspaces/WorkspaceRegistry";
import { tenantContextService } from "../tenant/TenantContextService";
import { securityEventEngine } from "./SecurityEventEngine";
import { trustedDeviceRegistry } from "./TrustedDeviceRegistry";
import { passwordHistoryEngine } from "./PasswordHistoryEngine";
import type { CaptchaVerifier, TenantLoginRequest, TenantLoginResult } from "./types";

/** No-op default — a real CAPTCHA provider (recaptcha/hcaptcha/turnstile) registers a replacement in a future phase. Architecture only, per the mandate. */
const noopCaptchaVerifier: CaptchaVerifier = {
  isRequired: ({ failedAttempts }) => failedAttempts >= 3,
  verify: async () => true,
};

export class AuthenticationPlatformAPI {
  private captchaVerifier: CaptchaVerifier = noopCaptchaVerifier;

  setCaptchaVerifier(verifier: CaptchaVerifier): void {
    this.captchaVerifier = verifier;
  }

  async login(request: TenantLoginRequest): Promise<TenantLoginResult> {
    let userIdForEvent: string | undefined;
    try {
      const response = await authService.login(
        { email: request.email, password: request.password, rememberMe: request.rememberMe },
        { ipAddress: request.ipAddress, userAgent: request.userAgent }
      );
      userIdForEvent = response.user.id;

      const session = sessionService.findByRefreshToken(response.refreshToken);
      const isSuspicious = securityEventEngine.isSuspicious(response.user.id, request.deviceFingerprint);
      const securityEvent = securityEventEngine.record(response.user.id, "login_success", {
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        deviceFingerprint: request.deviceFingerprint,
      });

      if (request.rememberMe && request.deviceFingerprint) {
        trustedDeviceRegistry.trust(response.user.id, request.deviceFingerprint, session?.deviceName ?? "Unknown device");
      }
      if (isSuspicious) {
        void platformEventBus.publish({ type: "SecurityAlert", userId: response.user.id, payload: { reason: "suspicious_login", ipAddress: request.ipAddress } });
      }

      const organizations = organizationEngine.getOrganizationsForUser(response.user.id);
      const targetOrgId = request.organizationId && organizations.some(o => o.id === request.organizationId) ? request.organizationId : organizations[0]?.id;
      const workspace = targetOrgId ? (workspaceEngine.getWorkspacesForUser(response.user.id).find(w => w.organizationId === targetOrgId) ?? workspaceRegistry.getDefaultForOrganization(targetOrgId)) : undefined;
      const tenantContext = targetOrgId ? await tenantContextService.resolve({ organizationId: targetOrgId, workspaceId: workspace?.id, userId: response.user.id }) : null;

      void platformEventBus.publish({ type: "UserLoggedIn", organizationId: targetOrgId, workspaceId: workspace?.id, userId: response.user.id, payload: { rememberMe: !!request.rememberMe } });
      if (session) {
        void platformEventBus.publish({ type: "SessionCreated", organizationId: targetOrgId, userId: response.user.id, payload: { sessionId: session.id, deviceType: session.deviceType } });
      }

      return {
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        sessionId: session?.id ?? "",
        isNewDevice: securityEvent.isNewDevice ?? false,
        availableOrganizations: organizations.map(o => ({ id: o.id, name: o.name })),
        tenantContext,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const eventType = message.toLowerCase().includes("locked") ? "account_locked" : "login_failed";
      if (userIdForEvent) {
        securityEventEngine.record(userIdForEvent, eventType, { ipAddress: request.ipAddress, userAgent: request.userAgent, deviceFingerprint: request.deviceFingerprint });
      }
      throw error;
    }
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    await authService.logout(sessionId);
    securityEventEngine.record(userId, "logout");
    void platformEventBus.publish({ type: "UserLoggedOut", userId, payload: { sessionId } });
    if (sessionId) {
      void platformEventBus.publish({ type: "SessionRevoked", userId, payload: { sessionId, reason: "logout" } });
    }
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await identityService.register(request);
    securityEventEngine.record(response.user.id, "login_success", { metadata: { via: "register" } });
    return response;
  }

  async changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    if (await passwordHistoryEngine.isReused(userId, request.newPassword)) {
      throw new ValidationError("This password has been used recently. Choose a different password.");
    }
    await authService.changePassword(userId, request);
    const newHash = await passwordService.hash(request.newPassword);
    passwordHistoryEngine.record(userId, newHash);
    securityEventEngine.record(userId, "password_changed");
    void platformEventBus.publish({ type: "PasswordChanged", userId, payload: {} });
  }

  async forgotPassword(email: string): Promise<void> {
    await authService.requestPasswordReset(email);
  }

  /** Reuse-checking is skipped for token-based reset — `authService`'s reset-token store is private, so the acting user isn't known until after `confirmPasswordReset` succeeds (documented limitation, not a bug). */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await authService.confirmPasswordReset(token, newPassword);
    void platformEventBus.publish({ type: "PasswordReset", payload: {} });
  }

  getPasswordPolicy() {
    return passwordService.getPolicy();
  }

  validatePassword(password: string) {
    return passwordService.validate(password);
  }
}

export const authenticationPlatformAPI = new AuthenticationPlatformAPI();
