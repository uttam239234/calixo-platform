/**
 * Calixo Platform - Token Service
 *
 * JWT-shaped access token and refresh token management. Signing is real
 * HMAC-SHA256 (Web Crypto, matching Phase 5's `WebhookSigningService`
 * precedent) using `AUTH_CONFIG`'s already-declared, previously-unused
 * `ACCESS_TOKEN.SECRET`/`REFRESH_TOKEN.SECRET` — found during the Track 1
 * Enterprise Platform Certification to have never actually been verified:
 * `verifyToken()` checked only token shape and expiry, never the signature,
 * so any 3-part base64url string with a future `exp` was accepted as valid
 * by the API Gateway's Bearer-token authentication. This closes that gap
 * without changing the token shape, claim structure, or expiry semantics.
 */

import { AUTH_CONFIG } from '@/identity/config';
import { generateId } from '@/shared/utils/string';
import { appLogger } from '@/logging';
import type { AccessToken, RefreshTokenPayload } from '@/identity/types';

export type TokenKind = 'access' | 'refresh';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export class TokenService {
  /**
   * Builds the access token claim set (signing happens in `encodeToken`).
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
   * Builds the refresh token claim set (signing happens in `encodeToken`).
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
   * Create and sign a real access/refresh token pair (HMAC-SHA256).
   */
  async createTokenPair(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }, familyId?: string): Promise<TokenPair> {
    const accessPayload = this.createAccessTokenPayload(user);
    const refreshPayload = this.createRefreshTokenPayload(user.id, familyId || generateId(8));

    const accessToken = await this.encodeToken(accessPayload, AUTH_CONFIG.ACCESS_TOKEN.SECRET);
    const refreshToken = await this.encodeToken(refreshPayload, AUTH_CONFIG.REFRESH_TOKEN.SECRET);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: AUTH_CONFIG.ACCESS_TOKEN.EXPIRY,
      refreshTokenExpiresIn: AUTH_CONFIG.REFRESH_TOKEN.EXPIRY,
    };
  }

  /**
   * JWT-shaped encoding (base64url header/payload) with a real HMAC-SHA256 signature.
   */
  private async encodeToken(payload: Record<string, unknown>, secret: string): Promise<string> {
    const header = { alg: AUTH_CONFIG.ACCESS_TOKEN.ALGORITHM, typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`, secret);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decodes the payload segment without verifying the signature — standard
   * JWT decode/verify split; callers needing a trust boundary must use
   * `verifyToken()`.
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
   * Verifies both expiry AND the HMAC-SHA256 signature — recomputes the
   * expected signature from the token's own header+payload segments using
   * the secret for `tokenKind` and compares in constant time. A forged
   * token (arbitrary payload, no knowledge of `AUTH_CONFIG`'s secret)
   * cannot produce a matching signature.
   */
  async verifyToken(token: string, tokenKind: TokenKind = 'access'): Promise<boolean> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = this.decodeToken<{ exp: number }>(token);
      if (!payload) return false;

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) return false;

      const secret = tokenKind === 'refresh' ? AUTH_CONFIG.REFRESH_TOKEN.SECRET : AUTH_CONFIG.ACCESS_TOKEN.SECRET;
      const expectedSignature = await this.createSignature(`${parts[0]}.${parts[1]}`, secret);
      return this.constantTimeEqual(expectedSignature, parts[2]);
    } catch {
      return false;
    }
  }

  private constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
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
   * Verifies the refresh token (signature + expiry) and issues a new pair.
   */
  async refreshAccessToken(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }, currentRefreshToken: string): Promise<TokenPair | null> {
    if (!(await this.verifyToken(currentRefreshToken, 'refresh'))) {
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

  private hmacKeyCache = new Map<string, Promise<CryptoKey>>();

  private importHmacKey(secret: string): Promise<CryptoKey> {
    let cached = this.hmacKeyCache.get(secret);
    if (!cached) {
      cached = globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      this.hmacKeyCache.set(secret, cached);
    }
    return cached;
  }

  /** Real HMAC-SHA256 (Web Crypto — same primitive as `WebhookSigningService`), base64url-encoded to match JWT convention. */
  private async createSignature(data: string, secret: string): Promise<string> {
    const key = await this.importHmacKey(secret);
    const digest = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    const binary = Array.from(new Uint8Array(digest)).map(b => String.fromCharCode(b)).join('');
    return this.base64UrlEncode(binary);
  }
}

export const tokenService = new TokenService();