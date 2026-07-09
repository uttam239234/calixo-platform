import { getLiveSocialAccountStatus } from "../connectors/SocialConnectorAdapter";
import { generateSocialAccounts, generateSocialPosts, createPostId } from "../mock/generateSocialMockData";
import { SOCIAL_ORGANIZATION_ID } from "../tenant/SocialTenantDefaults";
import type { SocialAccount, SocialOverviewSummary, SocialPlatformSummary, SocialPost, SocialPostStatus } from "../types";

/**
 * Pure functions of an account array — exported standalone (not just engine methods) so React
 * callers (e.g. `SocialProvider`/`SocialAnalyticsProvider`/`CompetitorProvider`) can recompute
 * from whatever account snapshot they hold locally, with that array as a real, honest `useMemo`
 * dependency, instead of silently re-reading the `socialEngine` singleton inside the memo body —
 * same pattern as `computeAdsPlatforms` in `core/ads`.
 */
export function computeSocialPlatformSummaries(accounts: SocialAccount[]): SocialPlatformSummary[] {
  return accounts.map(account => {
    const live = getLiveSocialAccountStatus(account.id);
    return {
      platform: account.platform,
      accountId: account.id,
      color: account.color,
      shortName: account.shortName,
      status: live?.status ?? account.status,
      followers: account.followers,
      reach: account.reach,
      engagementRate: account.engagementRate,
      posts: account.posts,
      lastSync: live?.lastSync ?? account.lastSync,
      isLiveConnector: Boolean(live),
    };
  });
}

/**
 * The single source of truth for "our brand" totals — every other view (Analytics' platform
 * metrics, Competitors' "Your Brand" benchmark row) reads from this instead of inventing its own
 * independent numbers, fixing the three-way follower mismatch found in the audit.
 */
export function computeSocialOverview(accounts: SocialAccount[]): SocialOverviewSummary {
  const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
  const totalReach = accounts.reduce((sum, a) => sum + a.reach, 0);
  const totalPosts = accounts.reduce((sum, a) => sum + a.posts, 0);
  const avgEngagementRate = accounts.length > 0 ? Number((accounts.reduce((sum, a) => sum + a.engagementRate, 0) / accounts.length).toFixed(2)) : 0;
  const connectedAccounts = accounts.filter(a => a.status === "Connected").length;
  return { totalFollowers, totalReach, avgEngagementRate, totalPosts, connectedAccounts, totalAccounts: accounts.length };
}

function nextStatusPublishedAt(status: SocialPostStatus): string {
  return status === "Published" ? "Just now" : status === "Scheduled" ? "Tomorrow, 10:00 AM" : "Not scheduled";
}

/**
 * Owns the account and post arrays; computes every aggregate (platform summaries, overview
 * totals) live from them — same "computed, not hardcoded" discipline as `AdsEngine`.
 * `replaceAccounts()`/`replacePosts()` are the connector/analytics-sync integration seams.
 */
export class SocialEngine {
  private accounts: SocialAccount[];
  private posts: SocialPost[];

  constructor(organizationId: string = SOCIAL_ORGANIZATION_ID) {
    this.accounts = generateSocialAccounts(organizationId);
    this.posts = generateSocialPosts(organizationId);
  }

  replaceAccounts(accounts: SocialAccount[]): void {
    this.accounts = accounts;
  }

  replacePosts(posts: SocialPost[]): void {
    this.posts = posts;
  }

  listAccounts(): SocialAccount[] {
    return [...this.accounts];
  }

  getAccount(id: string): SocialAccount | undefined {
    return this.accounts.find(a => a.id === id);
  }

  updateAccount(id: string, partial: Partial<SocialAccount>): SocialAccount | undefined {
    let updated: SocialAccount | undefined;
    this.accounts = this.accounts.map(a => {
      if (a.id !== id) return a;
      updated = { ...a, ...partial };
      return updated;
    });
    return updated;
  }

  listPosts(): SocialPost[] {
    return [...this.posts];
  }

  getPost(id: string): SocialPost | undefined {
    return this.posts.find(p => p.id === id);
  }

  createPost(post: SocialPost): SocialPost {
    this.posts = [post, ...this.posts];
    return post;
  }

  createPosts(posts: SocialPost[]): SocialPost[] {
    this.posts = [...posts, ...this.posts];
    return posts;
  }

  updatePost(id: string, partial: Partial<SocialPost>): SocialPost | undefined {
    let updated: SocialPost | undefined;
    this.posts = this.posts.map(p => {
      if (p.id !== id) return p;
      updated = { ...p, ...partial };
      return updated;
    });
    return updated;
  }

  duplicatePost(id: string): SocialPost | undefined {
    const original = this.getPost(id);
    if (!original) return undefined;
    const clone: SocialPost = { ...original, id: createPostId(), status: "Draft", publishedAt: "Not scheduled", workflowEntryId: undefined };
    this.posts = [clone, ...this.posts];
    return clone;
  }

  deletePost(id: string): void {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  deletePosts(ids: string[]): void {
    this.posts = this.posts.filter(p => !ids.includes(p.id));
  }

  updatePostStatus(id: string, status: SocialPostStatus): SocialPost | undefined {
    return this.updatePost(id, { status, publishedAt: nextStatusPublishedAt(status) });
  }

  bulkUpdateStatus(ids: string[], status: SocialPostStatus): SocialPost[] {
    const publishedAt = nextStatusPublishedAt(status);
    this.posts = this.posts.map(p => (ids.includes(p.id) ? { ...p, status, publishedAt } : p));
    return this.posts.filter(p => ids.includes(p.id));
  }

  getPlatformSummaries(): SocialPlatformSummary[] {
    return computeSocialPlatformSummaries(this.accounts);
  }

  getOverview(): SocialOverviewSummary {
    return computeSocialOverview(this.accounts);
  }
}

export const socialEngine = new SocialEngine();
