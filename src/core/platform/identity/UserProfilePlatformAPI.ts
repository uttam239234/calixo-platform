/**
 * Calixo Platform - User Profile Platform API
 *
 * The sanctioned way to read/update the authenticated user's own profile —
 * avatar, language, timezone, regional settings, notification/privacy/
 * accessibility preferences. Wraps `userProfileService` (unmodified) and
 * adds the `ProfileUpdated` platform event it never published.
 */
import { userProfileService } from "@/identity/services/UserProfileService";
import type { UpdatePreferencesRequest, UpdateProfileRequest, UserProfile } from "@/identity/types";
import { platformEventBus } from "../events/PlatformEventBus";

export class UserProfilePlatformAPI {
  getProfile(userId: string): UserProfile | null {
    return userProfileService.getProfile(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    const profile = await userProfileService.updateProfile(userId, data);
    void platformEventBus.publish({ type: "ProfileUpdated", userId, payload: { fields: Object.keys(data) } });
    return profile;
  }

  /** Covers theme, language, timezone, date format, notification channels, digest frequency, and accessibility — `UserPreferencesProfile` already modeled all of these; nothing published a `ProfileUpdated` event on change until now. */
  async updatePreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<UserProfile> {
    const profile = await userProfileService.updatePreferences(userId, preferences);
    void platformEventBus.publish({ type: "ProfileUpdated", userId, payload: { fields: Object.keys(preferences), scope: "preferences" } });
    return profile;
  }

  async updateEmail(userId: string, newEmail: string): Promise<UserProfile> {
    const profile = await userProfileService.updateEmail(userId, newEmail);
    void platformEventBus.publish({ type: "ProfileUpdated", userId, payload: { scope: "email" } });
    return profile;
  }

  async updatePhone(userId: string, phone: string): Promise<UserProfile> {
    const profile = await userProfileService.updatePhone(userId, phone);
    void platformEventBus.publish({ type: "ProfileUpdated", userId, payload: { scope: "phone" } });
    return profile;
  }
}

export const userProfilePlatformAPI = new UserProfilePlatformAPI();
