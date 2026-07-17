"use client";

/**
 * Calixo Users & Teams Center - directory list/profile/edit state.
 * The only place allowed to call UserRegistry and UserEngine (plus
 * UserValidationEngine, for inline profile-field validation) —
 * components never import any of these directly. Scoped to a single
 * organization: every list read and mutation stays inside `organizationId`,
 * which is what makes People/Teams isolation real rather than assumed.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { userRegistry, userEngine, userValidationEngine } from "@/core/users";
import type { PeopleAccessLevel, User, UserSaveResult, UserStatus, UserValidationResult } from "@/core/users";
import { organizationPlatformAPI } from "@/core/platform/organizations";

export function useUsers(organizationId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  /** Populates state with the engine-merged view (base record + any saved override) for every user in this organization, so the directory list itself reflects profile edits, not just a single selected record. */
  const refresh = useCallback(() => {
    setUsers(userRegistry.list({ organizationId }).map(u => userEngine.load(u.id) ?? u));
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) ?? null, [users, selectedUserId]);

  const updateProfile = useCallback(
    (userId: string, patch: Partial<Pick<User, "displayName" | "phone" | "avatar" | "title" | "department" | "timezone" | "locale" | "language" | "preferences">>): UserSaveResult => {
      const result = userEngine.updateProfile(userId, patch);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const updateStatus = useCallback(
    (userId: string, status: UserStatus): UserSaveResult => {
      const result = userEngine.updateStatus(userId, status);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const updateAccessLevel = useCallback(
    (userId: string, accessLevel: PeopleAccessLevel): UserSaveResult => {
      const result = userEngine.updateAccessLevel(userId, accessLevel);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const suspend = useCallback(
    (userId: string): UserSaveResult => {
      const result = userEngine.suspend(userId);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const reinstate = useCallback(
    (userId: string): UserSaveResult => {
      const result = userEngine.reinstate(userId);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const resetAccess = useCallback(
    (userId: string): UserSaveResult => {
      const result = userEngine.resetAccess(userId);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  /** Removes a person from this organization for good — both their directory entry and their real org membership. */
  const remove = useCallback(
    (userId: string, actorId: string): boolean => {
      const removed = organizationPlatformAPI.removeMember(organizationId, userId, actorId);
      if (removed) {
        userRegistry.unregister(userId);
        refresh();
      }
      return removed;
    },
    [organizationId, refresh]
  );

  const resetProfile = useCallback(
    (userId: string): UserSaveResult => {
      const result = userEngine.reset(userId);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const validateProfile = useCallback((patch: Partial<User>): UserValidationResult => userValidationEngine.validateUser(patch), []);

  const historyFor = useCallback((userId: string) => userEngine.getHistory(userId), []);

  const groupByTeam = useCallback(() => userRegistry.groupByTeam(), []);

  const lookup = useCallback((userId: string) => users.find(u => u.id === userId), [users]);

  return {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    updateProfile,
    updateStatus,
    updateAccessLevel,
    suspend,
    reinstate,
    resetAccess,
    remove,
    resetProfile,
    validateProfile,
    historyFor,
    groupByTeam,
    lookup,
    refresh,
  };
}

export type UseUsersResult = ReturnType<typeof useUsers>;
