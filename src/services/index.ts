/**
 * Calixo Platform - Service Layer Interfaces
 * 
 * Service interfaces define the business logic contracts.
 * Services are dependency-injection ready and replaceable.
 * They orchestrate repositories, API clients, and business rules.
 */

import type {
  Campaign,
  User,
  Organization,
  Workspace,
  SocialPost,
  Report,
  Notification,
  AIConversation,
  PaginatedResponse,
} from '@/shared/types/models';

// ============================================================================
// Campaign Service
// ============================================================================

export interface CampaignService {
  getCampaigns(organizationId: string, params?: {
    page?: number;
    limit?: number;
    status?: Campaign['status'];
    platform?: Campaign['platform'];
    search?: string;
  }): Promise<PaginatedResponse<Campaign>>;
  getCampaignById(id: string): Promise<Campaign | null>;
  createCampaign(data: Partial<Campaign>): Promise<Campaign>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<boolean>;
  pauseCampaign(id: string): Promise<Campaign>;
  resumeCampaign(id: string): Promise<Campaign>;
  duplicateCampaign(id: string): Promise<Campaign>;
  getActiveCampaigns(organizationId: string): Promise<Campaign[]>;
  getCampaignMetrics(id: string): Promise<Campaign['metrics']>;
}

// ============================================================================
// Analytics Service
// ============================================================================

export interface AnalyticsService {
  getRevenue(organizationId: string, dateRange: { start: string; end: string }): Promise<{ date: string; revenue: number }[]>;
  getChannelPerformance(organizationId: string, dateRange: { start: string; end: string }): Promise<{ channel: string; metrics: Record<string, number> }[]>;
  getCampaignPerformance(organizationId: string, dateRange: { start: string; end: string }): Promise<{ campaignId: string; metrics: Record<string, number> }[]>;
  getConversionFunnel(organizationId: string, dateRange: { start: string; end: string }): Promise<{ stage: string; count: number; conversion: number }[]>;
  getAudienceInsights(organizationId: string): Promise<{ segment: string; metrics: Record<string, number> }[]>;
  getGeoPerformance(organizationId: string, dateRange: { start: string; end: string }): Promise<{ region: string; metrics: Record<string, number> }[]>;
  getExecutiveSummary(organizationId: string, dateRange: { start: string; end: string }): Promise<Record<string, number>>;
  getAIInsights(organizationId: string, dateRange: { start: string; end: string }): Promise<{ insight: string; confidence: number; impact: string }[]>;
}

// ============================================================================
// Ads Service
// ============================================================================

export interface AdsService {
  getCampaigns(organizationId: string, params?: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
  }): Promise<PaginatedResponse<Campaign>>;
  getPlatformOverview(organizationId: string): Promise<{ platform: string; metrics: Record<string, number> }[]>;
  getBudgetOverview(organizationId: string): Promise<{ total: number; spent: number; remaining: number; byPlatform: Record<string, { budget: number; spent: number }> }>;
  getPerformanceSnapshot(organizationId: string): Promise<Record<string, number>>;
  getRecommendations(organizationId: string): Promise<{ id: string; title: string; description: string; impact: string; action: string }[]>;
  getPlatformStatus(organizationId: string): Promise<{ platform: string; status: 'connected' | 'disconnected' | 'error'; lastSync: string }[]>;
}

// ============================================================================
// Social Service
// ============================================================================

export interface SocialService {
  getPosts(workspaceId: string, params?: {
    page?: number;
    limit?: number;
    status?: SocialPost['status'];
    platform?: SocialPost['platforms'][0];
  }): Promise<PaginatedResponse<SocialPost>>;
  createPost(data: Partial<SocialPost>): Promise<SocialPost>;
  schedulePost(id: string, scheduledAt: string): Promise<SocialPost>;
  publishPost(id: string): Promise<SocialPost>;
  cancelScheduledPost(id: string): Promise<SocialPost>;
  getPostAnalytics(id: string): Promise<SocialPost['metrics']>;
  getCalendarPosts(workspaceId: string, month: number, year: number): Promise<SocialPost[]>;
}

// ============================================================================
// Content Service
// ============================================================================

export interface ContentService {
  generateContent(prompt: string, options?: {
    platform?: string;
    tone?: string;
    length?: 'short' | 'medium' | 'long';
  }): Promise<{ content: string; suggestions: string[] }>;
  analyzeContent(content: string): Promise<{
    readability: number;
    sentiment: string;
    keywords: string[];
    suggestions: string[];
  }>;
  getTemplates(category?: string): Promise<{ id: string; name: string; content: string; platform: string }[]>;
  saveDraft(data: { title: string; content: string; platform?: string }): Promise<{ id: string }>;
}

// ============================================================================
// Report Service
// ============================================================================

export interface ReportService {
  getReports(workspaceId: string, params?: {
    page?: number;
    limit?: number;
    type?: Report['type'];
  }): Promise<PaginatedResponse<Report>>;
  createReport(data: Partial<Report>): Promise<Report>;
  updateReport(id: string, data: Partial<Report>): Promise<Report>;
  deleteReport(id: string): Promise<boolean>;
  generateReport(id: string): Promise<string>; // Returns URL to generated report
  scheduleReport(id: string, schedule: Report['schedule']): Promise<Report>;
  exportReport(id: string, format: 'pdf' | 'csv' | 'excel'): Promise<Blob>;
  getScheduledReports(): Promise<Report[]>;
}

// ============================================================================
// Notification Service
// ============================================================================

export interface NotificationService {
  getNotifications(userId: string, params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedResponse<Notification>>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  sendNotification(notification: Partial<Notification>): Promise<Notification>;
  deleteNotification(id: string): Promise<boolean>;
}

// ============================================================================
// AI Service
// ============================================================================

export interface AIService {
  sendMessage(conversationId: string | null, message: string, context?: {
    page?: string;
    module?: string;
    data?: Record<string, unknown>;
  }): Promise<{ message: string; conversationId: string }>;
  getConversations(userId: string): Promise<AIConversation[]>;
  getConversation(id: string): Promise<AIConversation | null>;
  deleteConversation(id: string): Promise<boolean>;
  generateInsights(data: Record<string, unknown>): Promise<{ insight: string; confidence: number }[]>;
  suggestAction(context: Record<string, unknown>): Promise<{ action: string; description: string; confidence: number }[]>;
}

// ============================================================================
// User Service
// ============================================================================

export interface UserService {
  getCurrentUser(): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateProfile(id: string, data: Partial<User>): Promise<User>;
  updatePreferences(id: string, preferences: Partial<User['preferences']>): Promise<User>;
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
}

// ============================================================================
// Organization Service
// ============================================================================

export interface OrganizationService {
  getCurrentOrganization(): Promise<Organization | null>;
  getOrganizationById(id: string): Promise<Organization | null>;
  updateOrganization(id: string, data: Partial<Organization>): Promise<Organization>;
  getWorkspaces(organizationId: string): Promise<Workspace[]>;
  createWorkspace(organizationId: string, data: Partial<Workspace>): Promise<Workspace>;
  updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<boolean>;
  switchWorkspace(workspaceId: string): Promise<void>;
}