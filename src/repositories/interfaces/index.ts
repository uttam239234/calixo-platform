/**
 * Calixo Platform - Repository Interfaces
 * 
 * Repository pattern interfaces for data access abstraction.
 * These interfaces define the contract for data operations
 * without coupling to specific implementations.
 */

import type {
  Campaign,
  User,
  Organization,
  Workspace,
  SocialPost,
  BrandMention,
  Report,
  Notification,
  Task,
  AIConversation,
  Integration,
  PaginatedResponse,
  SortConfig,
  FilterConfig,
} from '@/shared/types/models';

// ============================================================================
// Base Repository Interface
// ============================================================================

export interface Repository<T, ID = string> {
  getById(id: ID): Promise<T | null>;
  exists(id: ID): Promise<boolean>;
  count(filters?: FilterConfig[]): Promise<number>;
}

export interface CrudRepository<T, ID = string, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
  extends Repository<T, ID> {
  create(data: CreateDTO): Promise<T>;
  update(id: ID, data: UpdateDTO): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

export interface PaginatedRepository<T> {
  getAll(params?: {
    page?: number;
    limit?: number;
    sort?: SortConfig[];
    filters?: FilterConfig[];
    search?: string;
  }): Promise<PaginatedResponse<T>>;
}

// ============================================================================
// Campaign Repository
// ============================================================================

export interface CampaignRepository
  extends CrudRepository<Campaign>,
    PaginatedRepository<Campaign> {
  getByOrganization(organizationId: string): Promise<Campaign[]>;
  getByStatus(status: Campaign['status']): Promise<Campaign[]>;
  getByPlatform(platform: Campaign['platform']): Promise<Campaign[]>;
  updateStatus(id: string, status: Campaign['status']): Promise<Campaign>;
  updateMetrics(id: string, metrics: Partial<Campaign['metrics']>): Promise<Campaign>;
  getActiveCampaigns(organizationId: string): Promise<Campaign[]>;
  getCampaignsByDateRange(organizationId: string, startDate: string, endDate: string): Promise<Campaign[]>;
}

// ============================================================================
// User Repository
// ============================================================================

export interface UserRepository
  extends CrudRepository<User>,
    PaginatedRepository<User> {
  getByEmail(email: string): Promise<User | null>;
  getByOrganization(organizationId: string): Promise<User[]>;
  updatePreferences(id: string, preferences: Partial<User['preferences']>): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  search(query: string): Promise<User[]>;
}

// ============================================================================
// Organization Repository
// ============================================================================

export interface OrganizationRepository
  extends CrudRepository<Organization> {
  getBySlug(slug: string): Promise<Organization | null>;
  updateSettings(id: string, settings: Partial<Organization['settings']>): Promise<Organization>;
  updateBranding(id: string, branding: Partial<Organization['branding']>): Promise<Organization>;
  getWorkspaces(organizationId: string): Promise<Workspace[]>;
}

// ============================================================================
// Workspace Repository
// ============================================================================

export interface WorkspaceRepository
  extends CrudRepository<Workspace>,
    PaginatedRepository<Workspace> {
  getByOrganization(organizationId: string): Promise<Workspace[]>;
  getByType(type: Workspace['type']): Promise<Workspace[]>;
}

// ============================================================================
// Social Repository
// ============================================================================

export interface SocialRepository
  extends CrudRepository<SocialPost>,
    PaginatedRepository<SocialPost> {
  getByWorkspace(workspaceId: string): Promise<SocialPost[]>;
  getByStatus(status: SocialPost['status']): Promise<SocialPost[]>;
  getScheduledPosts(workspaceId: string): Promise<SocialPost[]>;
  getPublishedPosts(workspaceId: string): Promise<SocialPost[]>;
  updatePostMetrics(id: string, metrics: Partial<SocialPost['metrics']>): Promise<SocialPost>;
}

// ============================================================================
// Brand Monitoring Repository
// ============================================================================

export interface BrandMonitoringRepository
  extends Repository<BrandMention>,
    PaginatedRepository<BrandMention> {
  getByOrganization(organizationId: string): Promise<BrandMention[]>;
  getBySentiment(sentiment: BrandMention['sentiment']): Promise<BrandMention[]>;
  getBySource(source: BrandMention['source']): Promise<BrandMention[]>;
  getRecentMentions(organizationId: string, limit?: number): Promise<BrandMention[]>;
}

// ============================================================================
// Report Repository
// ============================================================================

export interface ReportRepository
  extends CrudRepository<Report>,
    PaginatedRepository<Report> {
  getByWorkspace(workspaceId: string): Promise<Report[]>;
  getByType(type: Report['type']): Promise<Report[]>;
  getScheduledReports(): Promise<Report[]>;
  updateLastGenerated(id: string): Promise<Report>;
}

// ============================================================================
// Notification Repository
// ============================================================================

export interface NotificationRepository
  extends Repository<Notification>,
    PaginatedRepository<Notification> {
  getByUser(userId: string): Promise<Notification[]>;
  getUnreadByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  deleteOldNotifications(before: string): Promise<number>;
}

// ============================================================================
// AI Repository
// ============================================================================

export interface AIRepository
  extends CrudRepository<AIConversation>,
    PaginatedRepository<AIConversation> {
  getByUser(userId: string): Promise<AIConversation[]>;
  getByOrganization(organizationId: string): Promise<AIConversation[]>;
  addMessage(conversationId: string, message: AIConversation['messages'][0]): Promise<AIConversation>;
  getRecentConversations(userId: string, limit?: number): Promise<AIConversation[]>;
}

// ============================================================================
// Integration Repository
// ============================================================================

export interface IntegrationRepository
  extends CrudRepository<Integration>,
    PaginatedRepository<Integration> {
  getByOrganization(organizationId: string): Promise<Integration[]>;
  getByProvider(provider: Integration['provider']): Promise<Integration[]>;
  getByStatus(status: Integration['status']): Promise<Integration[]>;
  updateStatus(id: string, status: Integration['status']): Promise<Integration>;
  updateLastSync(id: string): Promise<Integration>;
}

// ============================================================================
// Task Repository
// ============================================================================

export interface TaskRepository
  extends CrudRepository<Task>,
    PaginatedRepository<Task> {
  getByWorkspace(workspaceId: string): Promise<Task[]>;
  getByAssignee(assigneeId: string): Promise<Task[]>;
  getByStatus(status: Task['status']): Promise<Task[]>;
  getByPriority(priority: Task['priority']): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  updateStatus(id: string, status: Task['status']): Promise<Task>;
}