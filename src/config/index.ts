/**
 * Calixo Platform - Centralized Configuration
 * 
 * This module serves as the single source of truth for all application
 * configuration values. Every module should import from here rather than
 * using hardcoded values or process.env directly.
 */

// ============================================================================
// Environment Configuration
// ============================================================================

export const ENV = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  
  get IS_DEV() { return this.NODE_ENV === 'development'; },
  get IS_PROD() { return this.NODE_ENV === 'production'; },
  get IS_TEST() { return this.NODE_ENV === 'test'; },
} as const;

// ============================================================================
// Application Constants
// ============================================================================

export const APP = {
  NAME: 'Calixo',
  TAGLINE: 'AI Marketing Operating System',
  VERSION: '1.0.0',
  COMPANY: 'Calixo Inc.',
  SUPPORT_EMAIL: 'support@calixo.io',
  COPYRIGHT_YEAR: new Date().getFullYear(),
  
  // Timeouts & Limits
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 200,
  SKELETON_DELAY: 100,
  TOAST_DURATION: 5000,
  MAX_UPLOAD_SIZE_MB: 10,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API = {
  BASE_URL: ENV.NEXT_PUBLIC_API_URL,
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    ORGANIZATIONS: '/organizations',
    WORKSPACES: '/workspaces',
    USERS: '/users',
    CAMPAIGNS: '/campaigns',
    ANALYTICS: '/analytics',
    ADS: '/ads',
    SOCIAL: '/social',
    BRAND: '/brand-monitoring',
    CONTENT: '/content',
    AI: '/ai',
    REPORTS: '/reports',
    INTEGRATIONS: '/integrations',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
  } as const,
} as const;

// ============================================================================
// Feature Flags Configuration
// ============================================================================

export const FEATURE_FLAGS = {
  DASHBOARD: { id: 'module.dashboard', defaultEnabled: true },
  ANALYTICS: { id: 'module.analytics', defaultEnabled: true },
  ADS_MANAGER: { id: 'module.ads-manager', defaultEnabled: true },
  SOCIAL_MEDIA: { id: 'module.social-media', defaultEnabled: true },
  BRAND_MONITORING: { id: 'module.brand-monitoring', defaultEnabled: true },
  CONTENT_STUDIO: { id: 'module.content-studio', defaultEnabled: true },
  AI_COPILOT: { id: 'module.ai-copilot', defaultEnabled: true, beta: true },
  REPORTS: { id: 'module.reports', defaultEnabled: true },
  ADMINISTRATION: { id: 'module.administration', defaultEnabled: true },
} as const;

// ============================================================================
// Route Configuration
// ============================================================================

export const ROUTES = {
  HOME: '/',
  
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  
  DASHBOARD: {
    ROOT: '/dashboard',
    HOME: '/dashboard',
    ANALYTICS: '/dashboard/analytics',
    ADS: '/dashboard/ads',
    SOCIAL: '/dashboard/social',
    BRAND: '/dashboard/brand',
    CONTENT: '/dashboard/content',
    AI: '/dashboard/ai',
    REPORTS: '/dashboard/reports',
  },
  
  ADMIN: {
    SETTINGS: '/dashboard/settings',
    USERS: '/dashboard/settings/users',
    ROLES: '/dashboard/settings/roles',
    WORKSPACES: '/dashboard/settings/workspaces',
    INTEGRATIONS: '/dashboard/settings/integrations',
    BILLING: '/dashboard/settings/billing',
    AUDIT: '/dashboard/settings/audit',
    API: '/dashboard/settings/api',
  },
  
  get DASHBOARD_ROUTES() {
    return Object.values(this.DASHBOARD);
  },
  
  get ADMIN_ROUTES() {
    return Object.values(this.ADMIN);
  },
} as const;

// ============================================================================
// Theme Configuration
// ============================================================================

export const THEME = {
  STORAGE_KEY: 'calixo-theme',
  DEFAULT_THEME: 'light' as const,
  SIDEBAR_COLLAPSED_KEY: 'calixo-sidebar-collapsed',
  SIDEBAR_DEFAULT_COLLAPSED: false,
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  THEME: THEME.STORAGE_KEY,
  SIDEBAR: THEME.SIDEBAR_COLLAPSED_KEY,
  AUTH_TOKEN: 'calixo-auth-token',
  REFRESH_TOKEN: 'calixo-refresh-token',
  USER_PREFERENCES: 'calixo-user-preferences',
  DRAFT_CAMPAIGNS: 'calixo-draft-campaigns',
  RECENT_WORKSPACE: 'calixo-recent-workspace',
} as const;

// ============================================================================
// Permissions Configuration
// ============================================================================

export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: 'dashboard:view',
    EXPORT: 'dashboard:export',
  },
  ANALYTICS: {
    VIEW: 'analytics:view',
    EXPORT: 'analytics:export',
    MANAGE: 'analytics:manage',
  },
  CAMPAIGNS: {
    VIEW: 'campaigns:view',
    CREATE: 'campaigns:create',
    EDIT: 'campaigns:edit',
    DELETE: 'campaigns:delete',
    APPROVE: 'campaigns:approve',
  },
  ADMIN: {
    MANAGE_USERS: 'admin:manage-users',
    MANAGE_ROLES: 'admin:manage-roles',
    MANAGE_BILLING: 'admin:manage-billing',
    MANAGE_SETTINGS: 'admin:manage-settings',
    VIEW_AUDIT: 'admin:view-audit',
  },
  SOCIAL: {
    VIEW: 'social:view',
    CREATE: 'social:create',
    PUBLISH: 'social:publish',
    MANAGE: 'social:manage',
  },
  AI: {
    USE: 'ai:use',
    MANAGE: 'ai:manage',
  },
  REPORTS: {
    VIEW: 'reports:view',
    CREATE: 'reports:create',
    EXPORT: 'reports:export',
  },
} as const;

// ============================================================================
// Caching Configuration
// ============================================================================

export const CACHE = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 30 * 60 * 1000, // 30 minutes
  RETRY: 3,
  RETRY_DELAY: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
} as const;

// ============================================================================
// Export convenience accessor
// ============================================================================

const config = {
  ENV,
  APP,
  API,
  FEATURE_FLAGS,
  ROUTES,
  THEME,
  STORAGE_KEYS,
  PERMISSIONS,
  CACHE,
} as const;

export default config;