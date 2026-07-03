/**
 * Calixo Platform - Session Service
 * 
 * Manages user sessions, active devices, and session lifecycle.
 */

import { AUTH_CONFIG } from '@/identity/config';
import { generateId } from '@/shared/utils/string';
import { appLogger } from '@/logging';
import type { SessionInfo, DeviceType } from '@/identity/types';

export interface StoredSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenFamily: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  deviceType: DeviceType;
  isRememberMe: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isRevoked: boolean;
}

export class SessionService {
  private sessions: Map<string, StoredSession> = new Map();

  /**
   * Create a new session.
   */
  createSession(params: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    refreshTokenFamily: string;
    ipAddress?: string;
    userAgent?: string;
    isRememberMe?: boolean;
  }): StoredSession {
    const now = new Date();
    const expiryMs = params.isRememberMe
      ? AUTH_CONFIG.REFRESH_TOKEN.EXPIRY_REMEMBER_ME * 1000
      : AUTH_CONFIG.REFRESH_TOKEN.EXPIRY * 1000;

    const session: StoredSession = {
      id: generateId(16),
      userId: params.userId,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      refreshTokenFamily: params.refreshTokenFamily,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceName: this.parseDeviceName(params.userAgent),
      deviceType: this.parseDeviceType(params.userAgent),
      isRememberMe: params.isRememberMe || false,
      createdAt: now.toISOString(),
      lastActiveAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + expiryMs).toISOString(),
      isRevoked: false,
    };

    this.sessions.set(session.id, session);
    this.enforceSessionLimit(params.userId);
    
    appLogger.info('SessionService', `Session created for user ${params.userId}`, {
      sessionId: session.id,
      deviceType: session.deviceType,
    });

    return session;
  }

  /**
   * Get a session by ID.
   */
  getSession(sessionId: string): StoredSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for a user.
   */
  getUserSessions(userId: string): SessionInfo[] {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && !s.isRevoked)
      .map(s => this.toSessionInfo(s));

    return userSessions.sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  }

  /**
   * Get active session count for a user.
   */
  getActiveSessionCount(userId: string): number {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId && !s.isRevoked && !this.isExpired(s))
      .length;
  }

  /**
   * Revoke a specific session.
   */
  revokeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.isRevoked = true;
    appLogger.info('SessionService', `Session ${sessionId} revoked`);
    return true;
  }

  /**
   * Revoke all sessions for a user except the current one.
   */
  revokeOtherSessions(userId: string, currentSessionId: string): number {
    let count = 0;
    this.sessions.forEach(session => {
      if (session.userId === userId && session.id !== currentSessionId && !session.isRevoked) {
        session.isRevoked = true;
        count++;
      }
    });

    if (count > 0) {
      appLogger.info('SessionService', `Revoked ${count} other sessions for user ${userId}`);
    }

    return count;
  }

  /**
   * Revoke all sessions for a user.
   */
  revokeAllUserSessions(userId: string): number {
    let count = 0;
    this.sessions.forEach(session => {
      if (session.userId === userId && !session.isRevoked) {
        session.isRevoked = true;
        count++;
      }
    });

    appLogger.info('SessionService', `Revoked all ${count} sessions for user ${userId}`);
    return count;
  }

  /**
   * Update session activity timestamp.
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActiveAt = new Date().toISOString();
    }
  }

  /**
   * Find a session by refresh token.
   */
  findByRefreshToken(refreshToken: string): StoredSession | undefined {
    return Array.from(this.sessions.values())
      .find(s => s.refreshToken === refreshToken && !s.isRevoked);
  }

  /**
   * Check if a session is expired.
   */
  isExpired(session: StoredSession): boolean {
    return new Date(session.expiresAt).getTime() < Date.now();
  }

  /**
   * Clean up expired sessions.
   */
  cleanupExpiredSessions(): number {
    let count = 0;
    this.sessions.forEach(session => {
      if (this.isExpired(session)) {
        this.sessions.delete(session.id);
        count++;
      }
    });
    return count;
  }

  /**
   * Enforce maximum active sessions per user.
   */
  private enforceSessionLimit(userId: string): void {
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && !s.isRevoked && !this.isExpired(s))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    while (activeSessions.length > AUTH_CONFIG.SESSION.MAX_ACTIVE_SESSIONS) {
      const oldest = activeSessions.shift();
      if (oldest) {
        oldest.isRevoked = true;
        appLogger.info('SessionService', `Session ${oldest.id} revoked due to session limit`);
      }
    }
  }

  /**
   * Parse device type from user agent.
   */
  private parseDeviceType(userAgent?: string): DeviceType {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)/.test(ua)) return 'tablet';
    if (/(mobile|iphone|ipod|android.*mobile)/.test(ua)) return 'mobile';
    if (/(desktop|windows|mac|linux|cros)/.test(ua)) return 'desktop';
    return 'unknown';
  }

  /**
   * Parse device name from user agent.
   */
  private parseDeviceName(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    // Extract browser name and OS
    const ua = userAgent;
    let name = 'Unknown Device';
    
    if (ua.includes('Chrome')) name = 'Chrome';
    else if (ua.includes('Firefox')) name = 'Firefox';
    else if (ua.includes('Safari')) name = 'Safari';
    else if (ua.includes('Edge')) name = 'Edge';
    
    if (ua.includes('Windows')) name += ' (Windows)';
    else if (ua.includes('Mac OS')) name += ' (macOS)';
    else if (ua.includes('Linux')) name += ' (Linux)';
    else if (ua.includes('Android')) name += ' (Android)';
    else if (ua.includes('iPhone') || ua.includes('iPad')) name += ' (iOS)';
    
    return name;
  }

  /**
   * Convert stored session to public session info.
   */
  private toSessionInfo(session: StoredSession, currentSessionId?: string): SessionInfo {
    return {
      id: session.id,
      userId: session.userId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      isCurrent: session.id === currentSessionId,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
    };
  }
}

export const sessionService = new SessionService();