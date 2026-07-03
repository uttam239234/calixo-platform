/**
 * Calixo Platform - Authentication Provider & Hooks
 * 
 * React context and hooks for authentication state management.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { identityService } from '@/identity/services/IdentityService';
import { tokenService } from '@/identity/services/TokenService';
import { appLogger } from '@/logging';
import type {
  AuthState,
  AuthContextValue,
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
} from '@/identity/types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'calixo_at',
  REFRESH_TOKEN: 'calixo_rt',
  USER: 'calixo_user',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      isEmailVerified: false,
      error: null,
    };
  }

  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (accessToken && refreshToken && userStr) {
      const user = JSON.parse(userStr) as AuthenticatedUser;
      
      // Check if token is still valid
      if (tokenService.isExpired(accessToken)) {
        // Try to refresh
        return {
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: true, // Will attempt refresh
          isEmailVerified: user.emailVerified,
          error: null,
        };
      }
      
      return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: user.emailVerified,
        error: null,
      };
    }
  } catch {
    // Invalid stored data
    clearStorage();
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    isEmailVerified: false,
    error: null,
  };
}

function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

function persistAuth(auth: { user: AuthenticatedUser; accessToken: string; refreshToken: string }): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(auth.user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  // Attempt to refresh token on mount if needed
  useEffect(() => {
    if (state.isLoading && state.refreshToken) {
      (async () => {
        try {
          const currentRefreshToken = state.refreshToken;
          if (!currentRefreshToken) return;
          const response = await identityService.refreshToken(currentRefreshToken);
          persistAuth({ ...state, ...response } as { user: AuthenticatedUser; accessToken: string; refreshToken: string });
          setState(prev => ({
            ...prev,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          }));
        } catch {
          clearStorage();
          setState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null,
          }));
        }
      })();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (request: LoginRequest): Promise<LoginResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await identityService.login(request);
      persistAuth(response);
      setState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: response.user.emailVerified,
        error: null,
      });
      appLogger.info('AuthProvider', 'User logged in successfully');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await identityService.logout();
    } finally {
      clearStorage();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isEmailVerified: false,
        error: null,
      });
      appLogger.info('AuthProvider', 'User logged out');
    }
  }, []);

  const register = useCallback(async (request: RegisterRequest): Promise<RegisterResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await identityService.register(request);
      persistAuth(response);
      setState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: response.user.emailVerified,
        error: null,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<RefreshTokenResponse> => {
    const currentRefreshToken = state.refreshToken;
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await identityService.refreshToken(currentRefreshToken);
      persistAuth({ ...state, ...response } as { user: AuthenticatedUser; accessToken: string; refreshToken: string });
      setState(prev => ({
        ...prev,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isLoading: false,
      }));
      return response;
    } catch (error) {
      clearStorage();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isEmailVerified: false,
        error: null,
      });
      throw error;
    }
  }, [state]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<UserProfile> => {
    if (!state.user) throw new Error('Not authenticated');
    const profile = await identityService.updateProfile(state.user.id, data);
    return profile;
  }, [state.user]);

  const updatePassword = useCallback(async (request: ChangePasswordRequest): Promise<void> => {
    if (!state.user) throw new Error('Not authenticated');
    await identityService.changePassword(state.user.id, request);
  }, [state.user]);

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    await identityService.requestPasswordReset(email);
  }, []);

  const confirmPasswordReset = useCallback(async (token: string, password: string): Promise<void> => {
    await identityService.confirmPasswordReset(token, password);
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    await identityService.verifyEmail(token);
    setState(prev => ({ ...prev, isEmailVerified: true }));
  }, []);

  const updatePreferences = useCallback(async (preferences: UpdatePreferencesRequest): Promise<void> => {
    if (!state.user) throw new Error('Not authenticated');
    await identityService.updatePreferences(state.user.id, preferences);
  }, [state.user]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    refreshSession,
    updateProfile,
    updatePassword,
    sendPasswordReset,
    confirmPasswordReset,
    verifyEmail,
    updatePreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser(): AuthenticatedUser | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useIsLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}