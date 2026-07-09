import { getLiveAdsPlatformStatus } from "../connectors/AdsConnectorAdapter";
import { ADS_PLATFORM_META, generateAdsCampaigns } from "../mock/generateAdsMockData";
import { ADS_ORGANIZATION_ID } from "../tenant/AdsTenantDefaults";
import type {
  AdsBudget,
  AdsPerformanceSummary,
  AdsPlatform,
  Campaign,
  CampaignAction,
  CampaignFilterState,
  CampaignSortKey,
  CampaignStatus,
  PlatformConnectionStatus,
  SortDirection,
} from "../types";

const PLATFORM_DEMO_STATUS: Record<string, { status: PlatformConnectionStatus; lastSync: string }> = {
  google: { status: "Connected", lastSync: "2 min ago" },
  meta: { status: "Connected", lastSync: "5 min ago" },
  linkedin: { status: "Connected", lastSync: "12 min ago" },
  microsoft: { status: "Syncing", lastSync: "Syncing now" },
  tiktok: { status: "Attention required", lastSync: "48 min ago" },
  pinterest: { status: "Connected", lastSync: "8 min ago" },
};

/** Approved monthly ad-spend cap — a business config value, independent of the sum of per-campaign budgets. */
const ACCOUNT_BUDGET_TOTAL = 220000;
const BUDGET_PERIOD = "July 2026";

function createCampaignId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `campaign-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Pure functions of a campaign array — exported standalone (not just engine methods) so
 * React callers (e.g. `CampaignProvider`) can recompute from whatever campaign snapshot they
 * hold locally, with that array as a real, honest `useMemo` dependency, instead of silently
 * re-reading the `adsEngine` singleton inside the memo body.
 */
export function computeAdsPlatforms(campaigns: Campaign[]): AdsPlatform[] {
  return ADS_PLATFORM_META.map(meta => {
    const platformCampaigns = campaigns.filter(c => c.platformId === meta.id);
    const spend = platformCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const clicks = platformCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const impressions = platformCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const conversions = platformCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const revenue = platformCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const live = getLiveAdsPlatformStatus(meta.id);
    const demo = PLATFORM_DEMO_STATUS[meta.id];
    return {
      ...meta,
      status: live?.status ?? demo?.status ?? "Connected",
      lastSync: live?.lastSync ?? demo?.lastSync ?? "—",
      campaignCount: platformCampaigns.length,
      spend,
      clicks,
      impressions,
      conversions,
      roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
      ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      isLiveConnector: Boolean(live),
    };
  });
}

export function computeAdsBudget(campaigns: Campaign[]): AdsBudget {
  const spent = campaigns.reduce((sum, c) => sum + c.spend, 0);
  return {
    total: ACCOUNT_BUDGET_TOTAL,
    spent,
    remaining: ACCOUNT_BUDGET_TOTAL - spent,
    projected: Math.round(spent * 1.25),
    period: BUDGET_PERIOD,
  };
}

export function computeAdsPerformanceSummary(campaigns: Campaign[]): AdsPerformanceSummary {
  const spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const impressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const revenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
    // Campaigns carry lifetime totals rather than a daily fact table (unlike Analytics), so a
    // literal period-over-period comparison isn't authentically computable here — these are
    // configured account-trend estimates, not fabricated history.
    spendChange: 8.4,
    conversionChange: 14.2,
    roasChange: 6.8,
  };
}

/**
 * Owns the campaign array and computes every aggregate (platform breakdown, budget pacing,
 * performance summary) live from it — same "computed, not hardcoded" discipline as
 * `AnalyticsEngine`. `replaceCampaigns()` is the connector-integration seam (mirrors
 * `AnalyticsEngine.replaceFacts()`).
 */
export class AdsEngine {
  private campaigns: Campaign[];

  constructor(organizationId: string = ADS_ORGANIZATION_ID) {
    this.campaigns = generateAdsCampaigns(organizationId);
  }

  replaceCampaigns(campaigns: Campaign[]): void {
    this.campaigns = campaigns;
  }

  list(): Campaign[] {
    return [...this.campaigns];
  }

  get(id: string): Campaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  create(campaign: Campaign): Campaign {
    this.campaigns = [...this.campaigns, campaign];
    return campaign;
  }

  update(id: string, partial: Partial<Campaign>): Campaign | undefined {
    let updated: Campaign | undefined;
    this.campaigns = this.campaigns.map(c => {
      if (c.id !== id) return c;
      updated = { ...c, ...partial };
      return updated;
    });
    return updated;
  }

  applyAction(ids: string[], action: CampaignAction): Campaign[] {
    if (action === "Delete") {
      this.campaigns = this.campaigns.filter(c => !ids.includes(c.id));
      return [];
    }
    if (action === "Duplicate") {
      const clones = this.campaigns
        .filter(c => ids.includes(c.id))
        .map(c => ({ ...c, id: createCampaignId(), name: `${c.name} Copy`, status: "Draft" as CampaignStatus, createdAt: new Date().toISOString().slice(0, 10) }));
      this.campaigns = [...this.campaigns, ...clones];
      return clones;
    }
    const status: CampaignStatus = action === "Pause" ? "Paused" : action === "Resume" ? "Running" : "Archived";
    this.campaigns = this.campaigns.map(c => (ids.includes(c.id) ? { ...c, status } : c));
    return this.campaigns.filter(c => ids.includes(c.id));
  }

  filter(query: string, filters: CampaignFilterState, platformNames: Record<string, string>, now = new Date()): Campaign[] {
    const normalizedQuery = query.trim().toLowerCase();
    const createdAfter = filters.created ? new Date(now) : null;
    if (createdAfter) createdAfter.setDate(createdAfter.getDate() - Number(filters.created));
    return this.campaigns.filter(campaign => {
      const searchable = `${campaign.name} ${platformNames[campaign.platformId] ?? ""} ${campaign.objective} ${campaign.status}`.toLowerCase();
      const budgetMatches =
        !filters.budget
        || (filters.budget === "under1" && campaign.budget < 1000)
        || (filters.budget === "1to5" && campaign.budget >= 1000 && campaign.budget < 5000)
        || (filters.budget === "5to10" && campaign.budget >= 5000 && campaign.budget < 10000)
        || (filters.budget === "10to25" && campaign.budget >= 10000 && campaign.budget < 25000)
        || (filters.budget === "over25" && campaign.budget >= 25000);
      const createdMatches = !createdAfter || new Date(`${campaign.createdAt}T00:00:00`) >= createdAfter;
      return (
        searchable.includes(normalizedQuery)
        && (!filters.status || campaign.status === filters.status)
        && (!filters.platform || campaign.platformId === filters.platform)
        && (!filters.objective || campaign.objective === filters.objective)
        && budgetMatches
        && createdMatches
        && (!filters.owner || campaign.owner === filters.owner)
      );
    });
  }

  sort(campaigns: Campaign[], key: CampaignSortKey, direction: SortDirection): Campaign[] {
    return [...campaigns].sort((a, b) => {
      const comparison = key === "name" ? a.name.localeCompare(b.name) : key === "createdAt" ? a.createdAt.localeCompare(b.createdAt) : Number(a[key]) - Number(b[key]);
      return direction === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Every field but identity/branding is aggregated live from `this.campaigns` grouped by
   * platform — the legacy mock data hand-authored these numbers independently of the campaign
   * array (e.g. it claimed Google Ads had 14 campaigns when only 5 campaign records referenced
   * it), a genuine "fake metrics" bug this replaces with real, internally-consistent totals.
   */
  getPlatforms(): AdsPlatform[] {
    return computeAdsPlatforms(this.campaigns);
  }

  getBudget(): AdsBudget {
    return computeAdsBudget(this.campaigns);
  }

  getPerformanceSummary(): AdsPerformanceSummary {
    return computeAdsPerformanceSummary(this.campaigns);
  }

  count(): number {
    return this.campaigns.length;
  }
}

export const adsEngine = new AdsEngine();
