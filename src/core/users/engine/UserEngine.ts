/**
 * Calixo Platform - User Engine
 *
 * Loads, saves, validates, and tracks change history for users. No real
 * persistence lives here — it delegates storage to an injected
 * UserStorageProvider (in-memory by default) layered on top of the
 * UserRegistry's base record, so swapping in a real backend later never
 * requires changing this engine. Presence and activity responsibilities
 * are delegated to PresenceEngine/ActivityEngine rather than duplicated.
 */

import { generateId } from "@/shared/utils/string";
import { userRegistry, UserRegistry } from "../registry/UserRegistry";
import { memoryUserStorageProvider } from "../storage/UserStorageProvider";
import { userValidationEngine, UserValidationEngine } from "../validation/UserValidationEngine";
import { presenceEngine, PresenceEngine } from "../presence/PresenceEngine";
import { activityEngine, ActivityEngine } from "../activity/ActivityEngine";
import type { PeopleAccessLevel, PresenceStatus, User, UserChangeRecord, UserSaveResult, UserStatus, UserStorageProvider } from "../types/index";

export class UserEngine {
  constructor(
    private registry: UserRegistry = userRegistry,
    private storage: UserStorageProvider = memoryUserStorageProvider,
    private validationEngine: UserValidationEngine = userValidationEngine,
    private presence: PresenceEngine = presenceEngine,
    private activity: ActivityEngine = activityEngine
  ) {}

  private history: UserChangeRecord[] = [];

  /** Reads the current effective record: the registered base merged with any saved override. */
  load(userId: string): User | undefined {
    const base = this.registry.lookup(userId);
    if (!base) return undefined;
    const override = this.storage.get(userId) as Partial<User> | undefined;
    return override ? { ...base, ...override } : base;
  }

  save(userId: string, patch: Partial<User>): UserSaveResult {
    const current = this.load(userId);
    if (!current) return { success: false, errors: [`Unknown user: ${userId}`] };

    const merged: User = { ...current, ...patch };
    const validation = this.validationEngine.validateUser(merged);
    if (!validation.valid) return { success: false, errors: validation.issues.map(i => i.message) };

    const previousValue = { ...current };
    const existingOverride = (this.storage.get(userId) as Partial<User>) ?? {};
    const newOverride: Partial<User> = { ...existingOverride, ...patch, updatedAt: new Date().toISOString() };
    this.storage.set(userId, newOverride);

    this.recordChange(userId, "update", previousValue, patch);
    return { success: true, errors: [], user: { ...merged, updatedAt: newOverride.updatedAt! } };
  }

  /** Clears any saved override, returning the user to their originally registered record. */
  reset(userId: string): UserSaveResult {
    const base = this.registry.lookup(userId);
    if (!base) return { success: false, errors: [`Unknown user: ${userId}`] };
    const previousValue = this.load(userId) ?? null;
    this.storage.delete(userId);
    this.recordChange(userId, "reset", previousValue, base);
    return { success: true, errors: [], user: base };
  }

  updateProfile(
    userId: string,
    patch: Partial<Pick<User, "displayName" | "phone" | "avatar" | "title" | "department" | "timezone" | "locale" | "language" | "preferences">>
  ): UserSaveResult {
    const organizationId = this.load(userId)?.organizationId;
    const result = this.save(userId, patch);
    if (result.success && organizationId) {
      this.activity.record(userId, organizationId, "profile-update", `Profile updated: ${Object.keys(patch).join(", ") || "no fields"}`);
    }
    return result;
  }

  updateStatus(userId: string, status: UserStatus): UserSaveResult {
    const previous = this.load(userId)?.status;
    const result = this.save(userId, { status });
    if (result.success) {
      this.recordChange(userId, "status-change", { status: previous } as Partial<User>, { status });
    }
    return result;
  }

  /** Reversible — sets status to suspended and logs a readable activity event. */
  suspend(userId: string): UserSaveResult {
    const organizationId = this.load(userId)?.organizationId;
    const result = this.updateStatus(userId, "suspended");
    if (result.success && organizationId) this.activity.record(userId, organizationId, "suspended", "Access suspended");
    return result;
  }

  /** Reverses a suspension, returning the person to active status. */
  reinstate(userId: string): UserSaveResult {
    const organizationId = this.load(userId)?.organizationId;
    const result = this.updateStatus(userId, "active");
    if (result.success && organizationId) this.activity.record(userId, organizationId, "reinstated", "Access reinstated");
    return result;
  }

  /** Changes a person's business-facing access level (Owner/Administrator/Manager/Member/Viewer) and logs a readable activity event. */
  updateAccessLevel(userId: string, accessLevel: PeopleAccessLevel): UserSaveResult {
    const organizationId = this.load(userId)?.organizationId;
    const result = this.save(userId, { accessLevel });
    if (result.success && organizationId) this.activity.record(userId, organizationId, "role-changed", `Access level set to ${accessLevel}`);
    return result;
  }

  /** Resets a person's access level back to the baseline "Member" tier and clears any granular role assignments. */
  resetAccess(userId: string): UserSaveResult {
    const organizationId = this.load(userId)?.organizationId;
    const result = this.save(userId, { accessLevel: "member", roleIds: [] });
    if (result.success && organizationId) this.activity.record(userId, organizationId, "role-changed", "Access reset to Member");
    return result;
  }

  /** Thin delegation to PresenceEngine — no presence logic is duplicated here. */
  updatePresence(userId: string, status: PresenceStatus): void {
    this.presence.setStatus(userId, status);
    this.save(userId, { presence: status });
  }

  getHistory(userId?: string): UserChangeRecord[] {
    return userId ? this.history.filter(h => h.userId === userId) : [...this.history];
  }

  private recordChange(userId: string, action: UserChangeRecord["action"], previousValue: Partial<User> | null, newValue: Partial<User>): void {
    this.history.push({ id: generateId(12), userId, action, previousValue, newValue, timestamp: new Date().toISOString() });
  }
}

export const userEngine = new UserEngine();
