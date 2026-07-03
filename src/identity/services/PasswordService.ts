/**
 * Calixo Platform - Password Service
 * 
 * Handles password hashing, validation, and policy enforcement.
 * Uses Web Crypto API for hashing (client-side) with bcrypt-style verification.
 * NOTE: In production, server-side bcrypt should be used.
 */

import { AUTH_CONFIG } from '@/identity/config';
import type { PasswordValidationResult, PasswordScore, PasswordPolicyConfig } from '@/identity/types';
import { appLogger } from '@/logging';

export class PasswordService {
  private policy: PasswordPolicyConfig;

  constructor(policy?: Partial<PasswordPolicyConfig>) {
    this.policy = {
      minLength: AUTH_CONFIG.PASSWORD.MIN_LENGTH,
      maxLength: AUTH_CONFIG.PASSWORD.MAX_LENGTH,
      requireUppercase: AUTH_CONFIG.PASSWORD.REQUIRE_UPPERCASE,
      requireLowercase: AUTH_CONFIG.PASSWORD.REQUIRE_LOWERCASE,
      requireNumbers: AUTH_CONFIG.PASSWORD.REQUIRE_NUMBERS,
      requireSpecialChars: AUTH_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS,
      requireNoReuse: true,
      maxReuseHistory: AUTH_CONFIG.PASSWORD.MAX_REUSE_HISTORY,
      expiryDays: AUTH_CONFIG.PASSWORD.EXPIRY_DAYS,
      lockoutThreshold: AUTH_CONFIG.BRUTE_FORCE.MAX_ATTEMPTS,
      lockoutDurationMinutes: AUTH_CONFIG.BRUTE_FORCE.LOCKOUT_DURATION_MINUTES,
      ...policy,
    };
  }

  /**
   * Validate a password against the current policy.
   */
  validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < this.policy.minLength) {
      errors.push(`At least ${this.policy.minLength} characters required`);
    }

    if (password.length > this.policy.maxLength) {
      errors.push(`Maximum ${this.policy.maxLength} characters`);
    }

    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('One uppercase letter required');
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('One lowercase letter required');
    }

    if (this.policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('One number required');
    }

    if (this.policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character required');
    }

    const score = this.calculateScore(password);

    return {
      valid: errors.length === 0,
      errors,
      score,
    };
  }

  /**
   * Calculate password strength score.
   */
  private calculateScore(password: string): PasswordScore {
    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'fair';
    if (score <= 6) return 'strong';
    return 'very_strong';
  }

  /**
   * Simulate password hashing (client-side).
   * In production, this should call a server endpoint.
   */
  async hash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + AUTH_CONFIG.PASSWORD.SALT_ROUNDS);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `$simulated$v1$${AUTH_CONFIG.PASSWORD.SALT_ROUNDS}$${hashHex}`;
  }

  /**
   * Simulate password verification (client-side).
   * In production, this should call a server endpoint.
   */
  async verify(password: string, hash: string): Promise<boolean> {
    const computedHash = await this.hash(password);
    return computedHash === hash;
  }

  /**
   * Check if password has expired based on last change date.
   */
  isExpired(lastChangedAt: string): boolean {
    const changed = new Date(lastChangedAt);
    const now = new Date();
    const diffDays = (now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > this.policy.expiryDays;
  }

  /**
   * Generate a cryptographically secure random token.
   */
  async generateResetToken(): Promise<string> {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get the policy configuration (for frontend forms).
   */
  getPolicy(): PasswordPolicyConfig {
    return { ...this.policy };
  }

  /**
   * Log password validation failure.
   */
  logValidationFailure(userId: string, errors: string[]): void {
    appLogger.warn('PasswordService', `Password validation failed for user ${userId}`, { errors });
  }
}

export const passwordService = new PasswordService();