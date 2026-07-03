/**
 * Calixo Platform - Token Service
 * 
 * JWT access token and refresh token management.
 * NOTE: This is a client-side simulation. In production, tokens
 * should be generated and verified server-side.
 */

import { AUTH_CONFIG } from '@/identity/config';
import { generateId } from '@/shared/utils/string';
import { appLogger } from '@/logging';
import type { AccessToken, RefreshTokenPayload } from '@/identity/types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export class TokenService {
  /**
   * Create a mock access token payload (simulation).
   * In production, this would be done server-side with proper JWT signing.
   */
  createAccessTokenPayload(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }): AccessToken {
    const now = Math.floor(Date.now() / 1000);
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + AUTH_CONFIG.ACCESS_TOKEN.EXPIRY,
      jti: generateId(16),
    };
  }

  /**
   * Create a mock refresh token payload (simulation).
   */
  createRefreshTokenPayload(userId: string, familyId: string): RefreshTokenPayload {
    const now = Math.floor(Date.now() / 1000);
    return {
      sub: userId,
      jti: generateId(16),
      family: familyId,
      exp: now + AUTH_CONFIG.REFRESH_TOKEN.EXPIRY,
      iat: now,
    };
  }

  /**
   * Simulate creating tokens (like JWT encoding).
   */
  createTokenPair(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }, familyId?: string): TokenPair {
    const accessPayload = this.createAccessTokenPayload(user);
    const refreshPayload = this.createRefreshTokenPayload(user.id, familyId || generateId(8));

    const accessToken = this.encodeToken(accessPayload);
    const refreshToken = this.encodeToken(refreshPayload);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: AUTH_CONFIG.ACCESS_TOKEN.EXPIRY,
      refreshTokenExpiresIn: AUTH_CONFIG.REFRESH_TOKEN.EXPIRY,
    };
  }

  /**
   * Simulate JWT encoding (base64 encode JSON payload).
   */
  private encodeToken(payload: Record<string, unknown>): string {
    const header = { alg: AUTH_CONFIG.ACCESS_TOKEN.ALGORITHM, typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Simulate decoding a JWT token.
   */
  decodeToken<T = Record<string, unknown>>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = this.base64UrlDecode(parts[1]);
      return JSON.parse(decoded) as T;
    } catch {
      return null;
    }
  }

  /**
   * Simulate token verification.
   */
  verifyToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = this.decodeToken<{ exp: number }>(token);
      if (!payload) return false;

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) return false;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a token is expired.
   */
  isExpired(token: string): boolean {
    const payload = this.decodeToken<{ exp: number }>(token);
    if (!payload) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Simulate token refresh.
   */
  refreshAccessToken(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }, currentRefreshToken: string): TokenPair | null {
    if (!this.verifyToken(currentRefreshToken)) {
      appLogger.warn('TokenService', 'Refresh token verification failed');
      return null;
    }

    const payload = this.decodeToken<RefreshTokenPayload>(currentRefreshToken);
    if (!payload) return null;

    return this.createTokenPair(user, payload.family);
  }

  /**
   * Calculate remaining time until token expiry.
   */
  getTokenTimeToLive(token: string): number {
    const payload = this.decodeToken<{ exp: number }>(token);
    if (!payload) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }

  private base64UrlEncode(data: string): string {
    const base64 = typeof btoa !== 'undefined' 
      ? btoa(data)
      : Buffer.from(data).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private base64UrlDecode(data: string): string {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return typeof atob !== 'undefined'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString();
  }

  private createSignature(data: string): string {
    // Simulated signature - in production, use proper HMAC
    return this.base64UrlEncode(
      Array.from(new TextEncoder().encode(data))
        .reduce((acc, b) => acc + b.toString(16), '')
    );
  }
}

export const tokenService = new TokenService();