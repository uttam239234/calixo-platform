"use client";

/**
 * Calixo Users & Teams Center - directory list/profile/edit state.
 * The only place allowed to call UserRegistry and UserEngine (plus
 * UserValidationEngine, for inline profile-field validation) —
 * components never import any of these directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { userRegistry, userEngine, userValidationEngine } from "@/core/users";
import type { User, UserSaveResult, UserStatus, UserValidationResult } from "@/core/users";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  /** Populates state with the engine-merged view (base record + any saved override) for every user, so the directory list itself reflects profile edits, not just a single selected record. */
  const refresh = useCallback(() => {
    setUsers(userRegistry.list().map(u => userEngine.load(u.id) ?? u));
  }, []);

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

  const groupByStatus = useCallback(() => userRegistry.groupByStatus(), []);
  const groupByWorkspace = useCallback(() => userRegistry.groupByWorkspace(), []);
  const groupByTeam = useCallback(() => userRegistry.groupByTeam(), []);

  const lookup = useCallback((userId: string) => users.find(u => u.id === userId), [users]);

  const toggleFavorite = useCallback((userId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const favoriteUsers = useMemo(() => users.filter(u => favorites.has(u.id)), [users, favorites]);

  return {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    updateProfile,
    updateStatus,
    resetProfile,
    validateProfile,
    historyFor,
    groupByStatus,
    groupByWorkspace,
    groupByTeam,
    lookup,
    favorites,
    favoriteUsers,
    toggleFavorite,
    refresh,
  };
}

export type UseUsersResult = ReturnType<typeof useUsers>;
