/**
 * Calixo Platform - Session Platform API
 *
 * The sanctioned entry point for session management. Wraps
 * `sessionService`/`authService` (unmodified) and adds idle/absolute
 * timeout enforcement driven by `PolicyEngine`'s organization-aware
 * session policy — `SessionService` only ever tracked one fixed
 * remember-me-vs-not expiry; per-organization idle/absolute timeouts
 * didn't exist until now.
 */
import { authService } from "@/identity/services/AuthenticationService";
import { sessionService } from "@/identity/services/SessionService";
import type { RefreshTokenResponse, SessionInfo } from "@/identity/types";
import { platformEventBus } from "../events/PlatformEventBus";
import { policyEngine } from "./policies/PolicyEngine";
import { securityEventEngine } from "./SecurityEventEngine";

export class SessionPlatformAPI {
  listSessions(userId: string, currentSessionId?: string): SessionInfo[] {
    return sessionService.getUserSessions(userId).map(s => ({ ...s, isCurrent: s.id === currentSessionId }));
  }

  getActiveSessionCount(userId: string): number {
    return sessionService.getActiveSessionCount(userId);
  }

  terminateSession(userId: string, sessionId: string): boolean {
    const revoked = sessionService.revokeSession(sessionId);
    if (revoked) {
      securityEventEngine.record(userId, "session_revoked", { metadata: { sessionId } });
      void platformEventBus.publish({ type: "SessionRevoked", userId, payload: { sessionId, reason: "manual" } });
    }
    return revoked;
  }

  /** "Logout everywhere else" — keeps the current session alive. */
  terminateOtherSessions(userId: string, currentSessionId: string): number {
    const count = sessionService.revokeOtherSessions(userId, currentSessionId);
    if (count > 0) {
      securityEventEngine.record(userId, "session_revoked", { metadata: { scope: "other_sessions", count } });
      void platformEventBus.publish({ type: "SessionRevoked", userId, payload: { reason: "logout_everywhere_else", count } });
    }
    return count;
  }

  /** "Logout everywhere" — including the current session. */
  terminateAllSessions(userId: string): number {
    const count = sessionService.revokeAllUserSessions(userId);
    if (count > 0) {
      securityEventEngine.record(userId, "session_revoked", { metadata: { scope: "all_sessions", count } });
      void platformEventBus.publish({ type: "SessionRevoked", userId, payload: { reason: "logout_everywhere", count } });
    }
    return count;
  }

  async refreshSession(refreshToken: string): Promise<RefreshTokenResponse> {
    return authService.refreshToken(refreshToken);
  }

  /**
   * Enforces the organization's idle + absolute session timeout on top of
   * `SessionService`'s own remember-me-based expiry. Actively revokes and
   * publishes `SessionExpired` the first time a caller checks a session
   * that has aged out — there's no background sweep (no scheduler is
   * running this phase; the Background Platform's queue/scheduler was
   * flagged as never-started in the architecture audit and remains
   * out of scope here).
   */
  checkAndEnforceTimeout(userId: string, sessionId: string, organizationId: string): "active" | "expired" | "not_found" {
    const session = sessionService.getSession(sessionId);
    if (!session || session.userId !== userId) return "not_found";
    if (session.isRevoked) return "expired";

    const policy = policyEngine.getSessionPolicy(organizationId);
    const idleMs = Date.now() - new Date(session.lastActiveAt).getTime();
    const absoluteMs = Date.now() - new Date(session.createdAt).getTime();
    const idleExpired = idleMs > policy.idleTimeoutMinutes * 60 * 1000;
    const absoluteExpired = absoluteMs > policy.absoluteTimeoutMinutes * 60 * 1000;
    const hardExpired = sessionService.isExpired(session);

    if (idleExpired || absoluteExpired || hardExpired) {
      sessionService.revokeSession(sessionId);
      securityEventEngine.record(userId, "session_expired", { metadata: { sessionId, reason: idleExpired ? "idle_timeout" : absoluteExpired ? "absolute_timeout" : "token_expiry" } });
      void platformEventBus.publish({ type: "SessionExpired", userId, organizationId, payload: { sessionId } });
      return "expired";
    }

    sessionService.updateActivity(sessionId);
    return "active";
  }
}

export const sessionPlatformAPI = new SessionPlatformAPI();
