/**
 * Calixo Platform - User Profile Service
 * 
 * Manages user profile data, preferences, and account settings.
 */

import { appLogger } from '@/logging';
import { AuthenticationError } from '@/errors';
import type {
  UserProfile,
  UserPreferencesProfile,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  AuthenticatedUser,
} from '@/identity/types';

interface ProfileData {
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

export class UserProfileService {
  private profiles: Map<string, ProfileData> = new Map();

  /**
   * Get full user profile.
   */
  getProfile(userId: string): UserProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;
    return this.toUserProfile(profile);
  }

  /**
   * Initialize a profile for a new user.
   */
  initializeProfile(user: AuthenticatedUser): UserProfile {
    const now = new Date().toISOString();
    const profile: ProfileData = {
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale || 'en-US',
      timezone: user.timezone || 'UTC',
      dateFormat: 'MM/DD/YYYY',
      emailVerified: user.emailVerified,
      phoneVerified: false,
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: user.timezone || 'UTC',
        dateFormat: 'MM/DD/YYYY',
        sidebarCollapsed: false,
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        marketingEmails: false,
        digestFrequency: 'never',
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'normal',
          screenReaderOptimized: false,
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(user.id, profile);
    appLogger.info('UserProfileService', `Profile initialized for user ${user.id}`);
    return this.toUserProfile(profile);
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    const profile = this.profiles.get(userId);
    if (!profile) {
      throw new AuthenticationError('Profile not found');
    }

    if (data.name !== undefined) profile.name = data.name;
    if (data.displayName !== undefined) profile.displayName = data.displayName;
    if (data.avatar !== undefined) profile.avatar = data.avatar;
    if (data.phone !== undefined) profile.phone = data.phone;
    if (data.locale !== undefined) profile.locale = data.locale;
    if (data.timezone !== undefined) profile.timezone = data.timezone;
    if (data.dateFormat !== undefined) profile.dateFormat = data.dateFormat;

    profile.updatedAt = new Date().toISOString();

    appLogger.info('UserProfileService', `Profile updated for user ${userId}`);
    return this.toUserProfile(profile);
  }

  /**
   * Update user preferences.
   */
  async updatePreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<UserProfile> {
    const profile = this.profiles.get(userId);
    if (!profile) {
      throw new AuthenticationError('Profile not found');
    }

    const prefs = profile.preferences;

    if (preferences.theme !== undefined) prefs.theme = preferences.theme;
    if (preferences.language !== undefined) prefs.language = preferences.language;
    if (preferences.timezone !== undefined) {
      prefs.timezone = preferences.timezone;
      profile.timezone = preferences.timezone;
    }
    if (preferences.dateFormat !== undefined) {
      prefs.dateFormat = preferences.dateFormat;
      profile.dateFormat = preferences.dateFormat;
    }
    if (preferences.sidebarCollapsed !== undefined) prefs.sidebarCollapsed = preferences.sidebarCollapsed;
    if (preferences.emailNotifications !== undefined) prefs.emailNotifications = preferences.emailNotifications;
    if (preferences.pushNotifications !== undefined) prefs.pushNotifications = preferences.pushNotifications;
    if (preferences.inAppNotifications !== undefined) prefs.inAppNotifications = preferences.inAppNotifications;
    if (preferences.marketingEmails !== undefined) prefs.marketingEmails = preferences.marketingEmails;
    if (preferences.digestFrequency !== undefined) prefs.digestFrequency = preferences.digestFrequency;

    profile.updatedAt = new Date().toISOString();

    appLogger.info('UserProfileService', `Preferences updated for user ${userId}`);
    return this.toUserProfile(profile);
  }

  /**
   * Update email address.
   */
  async updateEmail(userId: string, newEmail: string): Promise<UserProfile> {
    const profile = this.profiles.get(userId);
    if (!profile) {
      throw new AuthenticationError('Profile not found');
    }

    const oldEmail = profile.email;
    profile.email = newEmail;
    profile.emailVerified = false;
    profile.updatedAt = new Date().toISOString();

    appLogger.info('UserProfileService', `Email changed for user ${userId}: ${oldEmail} -> ${newEmail}`);
    return this.toUserProfile(profile);
  }

  /**
   * Update phone number.
   */
  async updatePhone(userId: string, phone: string): Promise<UserProfile> {
    const profile = this.profiles.get(userId);
    if (!profile) {
      throw new AuthenticationError('Profile not found');
    }

    profile.phone = phone;
    profile.phoneVerified = false;
    profile.updatedAt = new Date().toISOString();

    appLogger.info('UserProfileService', `Phone updated for user ${userId}`);
    return this.toUserProfile(profile);
  }

  /**
   * Mark email as verified.
   */
  async verifyEmail(userId: string): Promise<void> {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    profile.emailVerified = true;
    profile.updatedAt = new Date().toISOString();
  }

  /**
   * Convert internal profile to public UserProfile.
   */
  private toUserProfile(profile: ProfileData): UserProfile {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      displayName: profile.displayName,
      avatar: profile.avatar,
      phone: profile.phone,
      locale: profile.locale,
      timezone: profile.timezone,
      dateFormat: profile.dateFormat,
      emailVerified: profile.emailVerified,
      phoneVerified: profile.phoneVerified,
      preferences: { ...profile.preferences },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

export const userProfileService = new UserProfileService();