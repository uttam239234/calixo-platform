/**
 * Calixo Platform - Identity Configuration
 * 
 * Centralized configuration for authentication and identity services.
 */

import { ENV } from '@/config';

export const AUTH_CONFIG = {
  // Access Token
  ACCESS_TOKEN: {
    SECRET: process.env.ACCESS_TOKEN_SECRET || 'calixo-dev-access-secret-change-in-production',
    EXPIRY: 15 * 60, // 15 minutes in seconds
    EXPIRY_REMEMBER_ME: 7 * 24 * 60 * 60, // 7 days in seconds
    ALGORITHM: 'HS256' as const,
    ISSUER: 'calixo-platform',
    AUDIENCE: 'calixo-api',
  },

  // Refresh Token
  REFRESH_TOKEN: {
    SECRET: process.env.REFRESH_TOKEN_SECRET || 'calixo-dev-refresh-secret-change-in-production',
    EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
    EXPIRY_REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days in seconds
    ROTATE: true,
    REUSE_DETECTION: true,
  },

  // Session
  SESSION: {
    MAX_ACTIVE_SESSIONS: 10,
    EXTEND_ON_ACTIVITY: true,
    ACTIVITY_EXTEND_WINDOW: 5 * 60, // 5 minutes
  },

  // Password
  PASSWORD: {
    SALT_ROUNDS: 12,
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    MAX_REUSE_HISTORY: 5,
    EXPIRY_DAYS: 90,
    RESET_TOKEN_EXPIRY: 60 * 60, // 1 hour in seconds
  },

  // Brute Force Protection
  BRUTE_FORCE: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    WINDOW_MINUTES: 15,
  },

  // Rate Limiting
  RATE_LIMIT: {
    LOGIN: { windowMs: 15 * 60 * 1000, max: 10 },
    REGISTER: { windowMs: 60 * 60 * 1000, max: 3 },
    PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 },
    VERIFY_EMAIL: { windowMs: 60 * 60 * 1000, max: 5 },
    API: { windowMs: 60 * 1000, max: 100 },
  },

  // Cookies
  COOKIES: {
    ACCESS_TOKEN: {
      name: 'calixo_at',
      httpOnly: true,
      secure: ENV.IS_PROD,
      sameSite: 'lax' as const,
      path: '/',
    },
    REFRESH_TOKEN: {
      name: 'calixo_rt',
      httpOnly: true,
      secure: ENV.IS_PROD,
      sameSite: 'strict' as const,
      path: '/api/auth',
    },
  },

  // Feature Flags
  FEATURES: {
    REGISTRATION_ENABLED: true,
    EMAIL_VERIFICATION_REQUIRED: false,
    PASSWORD_RESET_ENABLED: true,
    MFA_ENABLED: false,
    REMEMBER_ME_ENABLED: true,
  },

  // Email Verification
  EMAIL_VERIFICATION: {
    TOKEN_EXPIRY: 24 * 60 * 60, // 24 hours in seconds
    RESEND_COOLDOWN: 60, // 1 minute
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;