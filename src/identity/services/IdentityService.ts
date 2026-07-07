/**
 * Calixo Platform - Identity Service (Facade)
 * 
 * Unified facade over all identity services.
 * Provides a single entry point for all identity operations.
 */

import { authService } from './AuthenticationService';
import { userProfileService } from './UserProfileService';
import { passwordService } from './PasswordService';
import { tokenService } from './TokenService';
import { appLogger } from '@/logging';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  UserProfile,
  AuthenticatedUser,
  SessionInfo,
  PasswordPolicyConfig,
  PasswordValidationResult,
} from '@/identity/types';

export class IdentityService {
  /**
   * Authenticate user with email and password.
   */
  async login(request: LoginRequest, context?: { ipAddress?: string; userAgent?: string }): Promise<LoginResponse> {
    const response = await authService.login(request, context);
    userProfileService.initializeProfile(response.user);
    return response;
  }

  /**
   * Register a new user account.
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await authService.register(request);
    userProfileService.initializeProfile(response.user);
    return response;
  }

  /**
   * Logout current user.
   */
  async logout(sessionId?: string): Promise<void> {
    await authService.logout(sessionId);
  }

  /**
   * Refresh access token.
   */
  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    return authService.refreshToken(token);
  }

  /**
   * Get current user.
   */
  getUser(userId: string): AuthenticatedUser | null {
    return authService.getUser(userId);
  }

  /**
   * Get user profile.
   */
  getProfile(userId: string): UserProfile | null {
    return userProfileService.getProfile(userId);
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    appLogger.info('IdentityService', `Updating profile for user ${userId}`);
    return userProfileService.updateProfile(userId, data);
  }

  /**
   * Update user preferences.
   */
  async updatePreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<UserProfile> {
    appLogger.info('IdentityService', `Updating preferences for user ${userId}`);
    return userProfileService.updatePreferences(userId, preferences);
  }

  /**
   * Change password.
   */
  async changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    await authService.changePassword(userId, request);
  }

  /**
   * Request password reset.
   */
  async requestPasswordReset(email: string): Promise<void> {
    await authService.requestPasswordReset(email);
  }

  /**
   * Confirm password reset.
   */
  async confirmPasswordReset(token: string, password: string): Promise<void> {
    await authService.confirmPasswordReset(token, password);
  }

  /**
   * Verify email address.
   */
  async verifyEmail(token: string): Promise<void> {
    await authService.verifyEmail(token);
    // Also update profile
  }

  /**
   * Send email verification.
   */
  async sendEmailVerification(userId: string): Promise<void> {
    await authService.sendEmailVerification(userId);
  }

  /**
   * Validate password strength.
   */
  validatePassword(password: string): PasswordValidationResult {
    return passwordService.validate(password);
  }

  /**
   * Get password policy.
   */
  getPasswordPolicy(): PasswordPolicyConfig {
    return passwordService.getPolicy();
  }

  /**
   * Get active sessions for user.
   */
  getUserSessions(userId: string): SessionInfo[] {
    return authService.getUserSessions(userId);
  }

  /**
   * Revoke a specific session.
   */
  revokeSession(sessionId: string): boolean {
    return authService.revokeSession(sessionId);
  }

  /**
   * Revoke all sessions except current.
   */
  revokeOtherSessions(userId: string, currentSessionId: string): number {
    return authService.revokeOtherSessions(userId, currentSessionId);
  }

  /**
   * Check if an access token is still valid (signature + expiry).
   */
  isTokenValid(token: string): Promise<boolean> {
    return tokenService.verifyToken(token);
  }

  /**
   * Get remaining TTL for a token.
   */
  getTokenTimeToLive(token: string): number {
    return tokenService.getTokenTimeToLive(token);
  }
}

export const identityService = new IdentityService();