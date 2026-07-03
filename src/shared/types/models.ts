/**
 * Calixo Platform - Shared Domain Models
 * 
 * Centralized type definitions for all domain entities.
 * These types are shared across modules, services, and repositories
 * to ensure consistency and type safety throughout the platform.
 */

// ============================================================================
// Identity & Core
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  lastLoginAt?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  language: string;
  notifications: NotificationPreferences;
  sidebarCollapsed: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: 'never' | 'daily' | 'weekly';
  categories: NotificationCategory[];
}

export type NotificationCategory = 
  | 'campaigns' 
  | 'analytics' 
  | 'ai_insights' 
  | 'system' 
  | 'billing' 
  | 'team';

// ============================================================================
// Organization & Workspace
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  settings: OrganizationSettings;
  branding: Branding;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise' | 'agency';

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  language: string;
  security: SecuritySettings;
}

export interface SecuritySettings {
  twoFactorRequired: boolean;
  ipAllowlist: string[];
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  expiryDays: number;
}

export interface Branding {
  logo?: string;
  favicon?: string;
  colors?: BrandColors;
  domain?: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  type: WorkspaceType;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceType = 'team' | 'client' | 'project';

// ============================================================================
// Campaign
// ============================================================================

export interface Campaign {
  id: string;
  organizationId: string;
  workspaceId: string;
  name: string;
  description?: string;
  platform: AdPlatform;
  status: CampaignStatus;
  budget: CampaignBudget;
  targeting: CampaignTargeting;
  metrics: CampaignMetrics;
  schedule: CampaignSchedule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AdPlatform = 'google' | 'meta' | 'linkedin' | 'tiktok' | 'twitter';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended' | 'archived';

export interface CampaignBudget {
  amount: number;
  currency: string;
  spent: number;
  type: 'daily' | 'lifetime';
  startDate: string;
  endDate?: string;
}

export interface CampaignTargeting {
  locations: string[];
  ageRange?: [number, number];
  gender?: 'male' | 'female' | 'all';
  interests: string[];
  devices: string[];
  languages: string[];
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export interface CampaignSchedule {
  startDate: string;
  endDate?: string;
  timezone: string;
  adSchedule?: DayTimeSlot[];
}

export interface DayTimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
}

// ============================================================================
// Social Media
// ============================================================================

export interface SocialPost {
  id: string;
  workspaceId: string;
  content: string;
  media: MediaAsset[];
  platforms: SocialPlatform[];
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  metrics: PostMetrics;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';

export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mimeType: string;
  alt?: string;
}

export interface PostMetrics {
  impressions: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

// ============================================================================
// Brand Monitoring
// ============================================================================

export interface BrandMention {
  id: string;
  organizationId: string;
  source: MentionSource;
  content: string;
  url: string;
  sentiment: Sentiment;
  author: string;
  platform: string;
  engagement: MentionEngagement;
  detectedAt: string;
  createdAt: string;
}

export type MentionSource = 'social' | 'news' | 'review' | 'forum' | 'blog';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface MentionEngagement {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

// ============================================================================
// Reports
// ============================================================================

export interface Report {
  id: string;
  organizationId: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: ReportSchedule;
  lastGenerated?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 'performance' | 'analytics' | 'campaign' | 'social' | 'custom';

export interface ReportConfig {
  metrics: string[];
  dimensions: string[];
  filters: Record<string, unknown>;
  visualization: 'table' | 'chart' | 'both';
  dateRange: DateRange;
}

export interface DateRange {
  start: string;
  end: string;
  preset?: DatePreset;
}

export type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'custom';

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel';
}

// ============================================================================
// Notifications
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  description: string;
  type: NotificationType;
  severity: NotificationSeverity;
  category: NotificationCategory;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type NotificationType = 
  | 'campaign_started' 
  | 'campaign_ended' 
  | 'budget_alert' 
  | 'ai_insight' 
  | 'team_update' 
  | 'system' 
  | 'billing';

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

// ============================================================================
// Tasks
// ============================================================================

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// ============================================================================
// AI
// ============================================================================

export interface AIConversation {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  context: AIContext;
  messages: AIMessage[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AIContext {
  page: string;
  module: string;
  data?: Record<string, unknown>;
  recentActions?: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
    confidence?: number;
  };
  createdAt: string;
}

// ============================================================================
// Integrations
// ============================================================================

export interface Integration {
  id: string;
  organizationId: string;
  name: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config: IntegrationConfig;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationProvider = 
  | 'google_ads' 
  | 'meta_ads' 
  | 'linkedin_ads' 
  | 'google_analytics' 
  | 'salesforce' 
  | 'hubspot' 
  | 'slack' 
  | 'shopify';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'expired';

export interface IntegrationConfig {
  scopes: string[];
  settings: Record<string, unknown>;
  webhookUrl?: string;
}

// ============================================================================
// Common / Shared
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: unknown;
}

export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}