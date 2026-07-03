/**
 * Calixo Platform - Authentication Service
 * 
 * Core authentication logic: login, logout, register, password reset, email verification.
 * Uses the other identity services (Password, Token, Session) to compose auth flows.
 */

import { AUTH_CONFIG } from '@/identity/config';
import { passwordService } from './PasswordService';
import { tokenService } from './TokenService';
import { sessionService } from './SessionService';
import { appLogger } from '@/logging';
import { AuthenticationError, ValidationError } from '@/errors';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthenticatedUser,
  RefreshTokenResponse,
  ChangePasswordRequest,
  SessionInfo,
} from '@/identity/types';

// In-memory user store (simulated - in production, use database)
interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  locale: string;
  timezone: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  passwordChangedAt: string;
}

export class AuthenticationService {
  private users: Map<string, StoredUser> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId
  private resetTokens: Map<string, { userId: string; expiresAt: string }> = new Map();
  private verifyTokens: Map<string, { userId: string; expiresAt: string }> = new Map();

  /**
   * Authenticate a user with email and password.
   */
  async login(request: LoginRequest, context?: { ipAddress?: string; userAgent?: string }): Promise<LoginResponse> {
    const user = this.findByEmail(request.email);
    if (!user) {
      appLogger.warn('AuthService', `Login failed: user not found - ${request.email}`);
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      appLogger.warn('AuthService', `Login failed: account locked - ${request.email}`);
      throw new AuthenticationError('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isValid = await passwordService.verify(request.password, user.passwordHash);
    if (!isValid) {
      user.failedLoginAttempts++;
      appLogger.warn('AuthService', `Login failed: invalid password - ${request.email}`, {
        attempts: user.failedLoginAttempts,
      });

      // Lock account if threshold exceeded
      if (user.failedLoginAttempts >= AUTH_CONFIG.BRUTE_FORCE.MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + AUTH_CONFIG.BRUTE_FORCE.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        user.lockedUntil = lockUntil.toISOString();
        appLogger.warn('AuthService', `Account locked due to failed attempts - ${request.email}`);
      }

      throw new AuthenticationError('Invalid email or password');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date().toISOString();

    // Create tokens
    const tokenPair = tokenService.createTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Create session
    sessionService.createSession({
      userId: user.id,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      refreshTokenFamily: tokenPair.refreshToken.split('.')[1] || '',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      isRememberMe: request.rememberMe,
    });

    appLogger.info('AuthService', `Login successful - ${request.email}`);

    return {
      user: this.toAuthenticatedUser(user),
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.accessTokenExpiresIn,
    };
  }

  /**
   * Register a new user account.
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    // Check if registration is enabled
    if (!AUTH_CONFIG.FEATURES.REGISTRATION_ENABLED) {
      throw new ValidationError('Registration is currently disabled');
    }

    // Check if email already exists
    if (this.findByEmail(request.email)) {
      throw new ValidationError('An account with this email already exists');
    }

    // Validate password
    const validation = passwordService.validate(request.password);
    if (!validation.valid) {
      passwordService.logValidationFailure('new', validation.errors);
      throw new ValidationError('Password does not meet requirements', {
        password: validation.errors,
      });
    }

    // Hash password
    const passwordHash = await passwordService.hash(request.password);

    // Create user
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}`,
      email: request.email,
      name: request.name,
      passwordHash,
      role: 'viewer',
      emailVerified: !AUTH_CONFIG.FEATURES.EMAIL_VERIFICATION_REQUIRED,
      locale: 'en-US',
      timezone: 'UTC',
      createdAt: now,
      updatedAt: now,
      passwordChangedAt: now,
      failedLoginAttempts: 0,
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);

    // Create tokens
    const tokenPair = tokenService.createTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    appLogger.info('AuthService', `User registered - ${request.email}`);

    return {
      user: this.toAuthenticatedUser(user),
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      message: 'Account created successfully',
    };
  }

  /**
   * Logout a user by revoking their session.
   */
  async logout(sessionId?: string): Promise<void> {
    if (sessionId) {
      sessionService.revokeSession(sessionId);
    }
    appLogger.info('AuthService', 'User logged out');
  }

  /**
   * Refresh an access token using a refresh token.
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const session = sessionService.findByRefreshToken(refreshToken);
    if (!session) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (session.isRevoked) {
      // Token reuse detected - revoke all sessions for user
      sessionService.revokeAllUserSessions(session.userId);
      throw new AuthenticationError('Refresh token has been revoked');
    }

    const user = this.users.get(session.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify the refresh token
    if (!tokenService.verifyToken(refreshToken)) {
      throw new AuthenticationError('Refresh token is expired or invalid');
    }

    // Create new token pair
    const tokenPair = tokenService.refreshAccessToken(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      refreshToken
    );

    if (!tokenPair) {
      throw new AuthenticationError('Failed to refresh token');
    }

    appLogger.info('AuthService', `Token refreshed for user ${user.id}`);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.accessTokenExpiresIn,
    };
  }

  /**
   * Initiate password reset.
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!AUTH_CONFIG.FEATURES.PASSWORD_RESET_ENABLED) {
      throw new ValidationError('Password reset is currently disabled');
    }

    const user = this.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return;
    }

    const token = await passwordService.generateResetToken();
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.PASSWORD.RESET_TOKEN_EXPIRY * 1000).toISOString();
    this.resetTokens.set(token, { userId: user.id, expiresAt });

    appLogger.info('AuthService', `Password reset requested for ${email}`);
  }

  /**
   * Complete password reset.
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      throw new ValidationError('Invalid or expired reset token');
    }

    if (new Date(resetData.expiresAt) < new Date()) {
      this.resetTokens.delete(token);
      throw new ValidationError('Reset token has expired');
    }

    const user = this.users.get(resetData.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Validate new password
    const validation = passwordService.validate(newPassword);
    if (!validation.valid) {
      throw new ValidationError('Password does not meet requirements', {
        password: validation.errors,
      });
    }

    user.passwordHash = await passwordService.hash(newPassword);
    user.passwordChangedAt = new Date().toISOString();
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;

    this.resetTokens.delete(token);

    // Revoke all sessions for security
    sessionService.revokeAllUserSessions(user.id);

    appLogger.info('AuthService', `Password reset completed for user ${user.id}`);
  }

  /**
   * Change password for authenticated user.
   */
  async changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isValid = await passwordService.verify(request.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Validate new password
    const validation = passwordService.validate(request.newPassword);
    if (!validation.valid) {
      throw new ValidationError('Password does not meet requirements', {
        password: validation.errors,
      });
    }

    user.passwordHash = await passwordService.hash(request.newPassword);
    user.passwordChangedAt = new Date().toISOString();

    appLogger.info('AuthService', `Password changed for user ${userId}`);
  }

  /**
   * Verify email address.
   */
  async verifyEmail(token: string): Promise<void> {
    const verifyData = this.verifyTokens.get(token);
    if (!verifyData) {
      throw new ValidationError('Invalid or expired verification token');
    }

    if (new Date(verifyData.expiresAt) < new Date()) {
      this.verifyTokens.delete(token);
      throw new ValidationError('Verification token has expired');
    }

    const user = this.users.get(verifyData.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    user.emailVerified = true;
    this.verifyTokens.delete(token);

    appLogger.info('AuthService', `Email verified for user ${user.id}`);
  }

  /**
   * Send email verification.
   */
  async sendEmailVerification(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.emailVerified) {
      return;
    }

    const token = await passwordService.generateResetToken();
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.EMAIL_VERIFICATION.TOKEN_EXPIRY * 1000).toISOString();
    this.verifyTokens.set(token, { userId: user.id, expiresAt });

    appLogger.info('AuthService', `Email verification sent to ${user.email}`);
  }

  /**
   * Get user by ID.
   */
  getUser(userId: string): AuthenticatedUser | null {
    const user = this.users.get(userId);
    return user ? this.toAuthenticatedUser(user) : null;
  }

  /**
   * Get active sessions for a user.
   */
  getUserSessions(userId: string): SessionInfo[] {
    return sessionService.getUserSessions(userId);
  }

  /**
   * Revoke a specific session.
   */
  revokeSession(sessionId: string): boolean {
    return sessionService.revokeSession(sessionId);
  }

  /**
   * Revoke all sessions except current.
   */
  revokeOtherSessions(userId: string, currentSessionId: string): number {
    return sessionService.revokeOtherSessions(userId, currentSessionId);
  }

  /**
   * Find user by email.
   */
  private findByEmail(email: string): StoredUser | undefined {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) : undefined;
  }

  /**
   * Convert stored user to authenticated user DTO.
   */
  private toAuthenticatedUser(user: StoredUser): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      locale: user.locale,
      timezone: user.timezone,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthenticationService();