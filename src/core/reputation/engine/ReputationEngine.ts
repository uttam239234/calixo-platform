import { generateBrandMentions, REPUTATION_PLATFORM_COLOR } from "../mock/generateReputationMockData";
import { REPUTATION_ORGANIZATION_ID } from "../tenant/ReputationTenantDefaults";
import type { BrandMention, CountryDistribution, KeywordCloudItem, MentionSentiment, PlatformDistribution, ReputationOverviewSummary, ReputationPlatform, SentimentTimelinePoint } from "../types";

const COUNTRY_FLAG: Record<string, string> = {
  "United States": "🇺🇸",
  India: "🇮🇳",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Brazil: "🇧🇷",
  France: "🇫🇷",
  Japan: "🇯🇵",
  Nigeria: "🇳🇬",
  Spain: "🇪🇸",
  "South Korea": "🇰🇷",
  Singapore: "🇸🇬",
  "United Arab Emirates": "🇦🇪",
  Mexico: "🇲🇽",
};

/**
 * Pure functions of a mention array — exported standalone (not just engine methods) so React
 * callers can recompute from whatever mention snapshot they hold locally, with that array as a
 * real, honest `useMemo` dependency. Same pattern as `computeSocialOverview` in `core/social`.
 * This is the reconciliation fix for the audit's central finding: the legacy `brandKpis` claimed
 * 48,392 total mentions with a per-platform breakdown, while the real mention list had 15 records
 * and no relationship to those numbers at all. Every aggregate below is now derived from the real
 * mention array — one source of truth, shown identically on the Dashboard KPI grid, the Mentions
 * page, and everywhere else.
 */
export function computePlatformDistribution(mentions: BrandMention[]): PlatformDistribution[] {
  const total = mentions.length;
  const counts = new Map<string, number>();
  for (const mention of mentions) counts.set(mention.platform, (counts.get(mention.platform) ?? 0) + 1);
  return [...counts.entries()]
    .map(([platform, count]) => ({
      platform,
      mentions: count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      color: REPUTATION_PLATFORM_COLOR[platform as ReputationPlatform] ?? "#6C757D",
    }))
    .sort((a, b) => b.mentions - a.mentions);
}

export function computeCountryDistribution(mentions: BrandMention[]): CountryDistribution[] {
  const total = mentions.length;
  const counts = new Map<string, number>();
  for (const mention of mentions) counts.set(mention.country, (counts.get(mention.country) ?? 0) + 1);
  return [...counts.entries()]
    .map(([country, count]) => ({
      country,
      flag: COUNTRY_FLAG[country] ?? "🌍",
      mentions: count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);
}

/** Buckets mentions by a fixed window (real `detectedAt` dates, not a fabricated cadence) relative to the earliest mention in the array — fully deterministic regardless of when this runs. */
export function computeSentimentTimeline(mentions: BrandMention[], bucketDays = 4): SentimentTimelinePoint[] {
  if (mentions.length === 0) return [];
  const sorted = [...mentions].sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
  const earliestMs = new Date(sorted[0].detectedAt).getTime();
  const bucketMs = bucketDays * 24 * 60 * 60 * 1000;

  const buckets = new Map<number, BrandMention[]>();
  for (const mention of sorted) {
    const key = Math.floor((new Date(mention.detectedAt).getTime() - earliestMs) / bucketMs);
    const list = buckets.get(key) ?? [];
    list.push(mention);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, bucketMentions]) => {
      const total = bucketMentions.length;
      const positive = bucketMentions.filter(m => m.sentiment === "positive").length;
      const neutral = bucketMentions.filter(m => m.sentiment === "neutral").length;
      const negative = total - positive - neutral;
      const bucketDate = new Date(earliestMs + key * bucketMs);
      return {
        date: bucketDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100),
      };
    });
}

/** Groups real mentions by their `tags` — replaces the legacy `keywordCloud`, which was a fixture entirely disconnected from any mention. `value` is a frequency+sentiment-weighted display-size score (not a raw count, but not a fabricated metric either — every input is real). `trend` compares the older vs. more recent half of the array. */
export function computeKeywordCloud(mentions: BrandMention[]): KeywordCloudItem[] {
  if (mentions.length === 0) return [];
  const sorted = [...mentions].sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
  const midpoint = Math.floor(sorted.length / 2);
  const recentIds = new Set(sorted.slice(midpoint).map(m => m.id));

  const stats = new Map<string, { count: number; scoreSum: number; recentCount: number; olderCount: number }>();
  for (const mention of sorted) {
    for (const tag of mention.tags) {
      const stat = stats.get(tag) ?? { count: 0, scoreSum: 0, recentCount: 0, olderCount: 0 };
      stat.count += 1;
      stat.scoreSum += mention.sentimentScore;
      if (recentIds.has(mention.id)) stat.recentCount += 1;
      else stat.olderCount += 1;
      stats.set(tag, stat);
    }
  }

  return [...stats.entries()]
    .map(([text, stat]) => {
      const avgScore = stat.scoreSum / stat.count;
      const sentiment: MentionSentiment = avgScore >= 0.6 ? "positive" : avgScore >= 0.4 ? "neutral" : "negative";
      const trend: "up" | "down" | "stable" = stat.recentCount > stat.olderCount ? "up" : stat.recentCount < stat.olderCount ? "down" : "stable";
      return { text, value: Math.min(100, 20 + stat.count * 15), sentiment, trend };
    })
    .sort((a, b) => b.value - a.value);
}

/** The single source of truth for "our own mention" totals — every other view (KPI grid, Competitors' Calixo row) reads from this instead of inventing its own independent numbers. */
export function computeOverview(mentions: BrandMention[]): ReputationOverviewSummary {
  const total = mentions.length;
  const positiveCount = mentions.filter(m => m.sentiment === "positive").length;
  const neutralCount = mentions.filter(m => m.sentiment === "neutral").length;
  const negativeCount = total - positiveCount - neutralCount;
  const totalReach = mentions.reduce((sum, m) => sum + m.reach, 0);
  const avgSentimentScore = total > 0 ? mentions.reduce((sum, m) => sum + m.sentimentScore, 0) / total : 0;
  return {
    totalMentions: total,
    totalReach,
    avgSentimentScore: Math.round(avgSentimentScore * 100),
    positivePct: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
    neutralPct: total > 0 ? Math.round((neutralCount / total) * 100) : 0,
    negativePct: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
    positiveCount,
    neutralCount,
    negativeCount,
    flaggedCount: mentions.filter(m => m.isFlagged).length,
    unresolvedCount: mentions.filter(m => !m.isResolved).length,
  };
}

/** Owns the mention array; computes every aggregate live from it — same "computed, not hardcoded" discipline as `SocialEngine`. */
export class ReputationEngine {
  private mentions: BrandMention[];

  constructor(organizationId: string = REPUTATION_ORGANIZATION_ID) {
    this.mentions = generateBrandMentions(organizationId);
  }

  replaceMentions(mentions: BrandMention[]): void {
    this.mentions = mentions;
  }

  listMentions(): BrandMention[] {
    return [...this.mentions];
  }

  getMention(id: string): BrandMention | undefined {
    return this.mentions.find(m => m.id === id);
  }

  updateMention(id: string, partial: Partial<BrandMention>): BrandMention | undefined {
    let updated: BrandMention | undefined;
    this.mentions = this.mentions.map(m => {
      if (m.id !== id) return m;
      updated = { ...m, ...partial };
      return updated;
    });
    return updated;
  }

  resolveMention(id: string): BrandMention | undefined {
    return this.updateMention(id, { isResolved: true });
  }

  unresolveMention(id: string): BrandMention | undefined {
    return this.updateMention(id, { isResolved: false });
  }

  flagMention(id: string): BrandMention | undefined {
    return this.updateMention(id, { isFlagged: true });
  }

  unflagMention(id: string): BrandMention | undefined {
    return this.updateMention(id, { isFlagged: false });
  }

  getPlatformDistribution(): PlatformDistribution[] {
    return computePlatformDistribution(this.mentions);
  }

  getCountryDistribution(): CountryDistribution[] {
    return computeCountryDistribution(this.mentions);
  }

  getSentimentTimeline(): SentimentTimelinePoint[] {
    return computeSentimentTimeline(this.mentions);
  }

  getKeywordCloud(): KeywordCloudItem[] {
    return computeKeywordCloud(this.mentions);
  }

  getOverview(): ReputationOverviewSummary {
    return computeOverview(this.mentions);
  }
}

export const reputationEngine = new ReputationEngine();
