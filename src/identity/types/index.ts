/**
 * Calixo Platform - Identity & Authentication Types
 * 
 * Core types for the Enterprise Identity Platform.
 */

// ============================================================================
// Authentication
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms?: boolean;
}

export interface RegisterResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// User Profile
// ============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  locale: string;
  timezone: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  preferences: UserPreferencesProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferencesProfile {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  marketingEmails: boolean;
  digestFrequency: 'never' | 'daily' | 'weekly';
  accessibility: AccessibilityPreferences;
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
  screenReaderOptimized: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  locale?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
  password: string;
}

export interface UpdatePhoneRequest {
  phone: string;
}

export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  sidebarCollapsed?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
  marketingEmails?: boolean;
  digestFrequency?: 'never' | 'daily' | 'weekly';
}

// ============================================================================
// Session
// ============================================================================

export interface SessionInfo {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  deviceType?: DeviceType;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface ActiveSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  deviceType: DeviceType;
  isRememberMe: boolean;
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// Token
// ============================================================================

export interface AccessToken {
  sub: string;
  email: string;
  name: string;
  role: string;
  orgId?: string;
  wsId?: string;
  iat: number;
  exp: number;
  jti: string;
  [key: string]: unknown;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  family: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

// ============================================================================
// Security Events
// ============================================================================

export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_changed'
  | 'phone_changed'
  | 'profile_updated'
  | 'session_revoked'
  | 'session_expired'
  | 'token_refreshed'
  | 'account_locked'
  | 'account_unlocked'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'trusted_device_added'
  | 'trusted_device_removed';

// ============================================================================
// Authentication State
// ============================================================================

export interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (request: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  register: (request: RegisterRequest) => Promise<RegisterResponse>;
  refreshSession: () => Promise<RefreshTokenResponse>;
  updateProfile: (data: UpdateProfileRequest) => Promise<UserProfile>;
  updatePassword: (request: ChangePasswordRequest) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updatePreferences: (preferences: UpdatePreferencesRequest) => Promise<void>;
}

// ============================================================================
// Password Policy
// ============================================================================

export interface PasswordPolicyConfig {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  requireNoReuse: boolean;
  maxReuseHistory: number;
  expiryDays: number;
  lockoutThreshold: number;
  lockoutDurationMinutes: number;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  score: PasswordScore;
}

export type PasswordScore = 'weak' | 'fair' | 'strong' | 'very_strong';