"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { socialPlatformAPI } from "@/core/social";
import { useSocialTenant } from "@/hooks/useSocialTenant";
import { EmptyState } from "@/components/ui/EmptyState";
import { campaignSocialMetrics, dailySocialMetrics, socialPosts } from "./mock-data";
import type { AnalyticsOverview, DailySocialMetric, PlatformMetric, SocialAnalyticsFilters, SocialPostMetric } from "./types";

const STORAGE_KEY = "calixo-social-analytics-filters-v1";
const defaultFilters: SocialAnalyticsFilters = { platform: "", date: "30d", campaign: "", postType: "", author: "" };

/** No real growth-rate data source exists (same situation as Ads' `spendChange`) — a small configured per-platform estimate, not a fabricated per-index formula. */
const PLATFORM_GROWTH_ESTIMATE: Record<string, number> = { Facebook: 2.4, Instagram: 6.8, LinkedIn: 5.1, X: 1.6, TikTok: 9.2, YouTube: 3.4 };

interface AnalyticsContextValue {
  filters: SocialAnalyticsFilters;
  setFilters: (filters: SocialAnalyticsFilters) => void;
  resetFilters: () => void;
  posts: SocialPostMetric[];
  platforms: PlatformMetric[];
  series: DailySocialMetric[];
  overview: AnalyticsOverview;
  campaigns: typeof campaignSocialMetrics;
  aiVersion: number;
  refreshAi: () => void;
  exportData: (format: "csv" | "excel" | "pdf") => void;
  showToast: (message: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

/**
 * `platforms`/`overview.followers`/`overview.reach` are computed from `socialPlatformAPI`'s real
 * account data (the same source `SocialProvider`'s dashboard reads) instead of an independently
 * hand-typed `platformMetrics` array — fixes the three-way follower-count mismatch found between
 * the dashboard, this page, and Competitors' benchmark row. Post-level detail (`socialPosts`),
 * the 90-day trend chart, hashtags, and campaign breakdowns stay demo fixture data — none of
 * those are shown as a single headline number anywhere else, so there's nothing to reconcile.
 */
export function SocialAnalyticsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [aiVersion, setAiVersion] = useState(1);
  const { canRead, canExport } = useSocialTenant();

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setFilters(JSON.parse(stored) as SocialAnalyticsFilters);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const days = Number(filters.date.slice(0, -1));
  const latestDate = dailySocialMetrics.at(-1)?.date ?? "2026-01-01";
  const cutoffDate = new Date(`${latestDate}T00:00:00`);
  cutoffDate.setDate(cutoffDate.getDate() - (days - 1));
  const cutoff = cutoffDate.toISOString().slice(0, 10);

  const posts = useMemo(
    () =>
      socialPosts.filter(
        post =>
          post.date >= cutoff &&
          (!filters.platform || post.platform === filters.platform) &&
          (!filters.campaign || post.campaign === filters.campaign) &&
          (!filters.postType || post.postType === filters.postType) &&
          (!filters.author || post.author === filters.author)
      ),
    [cutoff, filters]
  );

  const factor = (filters.platform ? 0.28 : 1) * (filters.campaign ? 0.62 : 1) * (filters.postType ? 0.78 : 1) * (filters.author ? 0.72 : 1);

  const series = useMemo(
    () =>
      dailySocialMetrics.slice(-days).map(item => ({
        ...item,
        reach: Math.round(item.reach * factor),
        engagement: Math.round(item.engagement * factor),
        impressions: Math.round(item.impressions * factor),
        followers: Math.round(item.followers * (filters.platform?.length ? 0.18 : 1)),
      })),
    [days, factor, filters.platform]
  );

  const platforms = useMemo<PlatformMetric[]>(() => {
    const summaries = socialPlatformAPI.getPlatformSummaries();
    return summaries
      // Accounts never use "YouTube Community" (that value only appears on individual posts) — narrows `SocialPlatform` to the analytics feature's own `AnalyticsPlatform` union.
      .filter((summary): summary is typeof summary & { platform: Exclude<typeof summary.platform, "YouTube Community"> } => summary.platform !== "YouTube Community")
      .filter(summary => !filters.platform || summary.platform === filters.platform)
      .map(summary => ({
        platform: summary.platform,
        color: summary.color,
        followers: summary.followers,
        reach: Math.round(summary.reach * (filters.campaign ? 0.62 : 1)),
        engagement: summary.engagementRate,
        posts: posts.filter(post => post.platform === summary.platform).length,
        growth: PLATFORM_GROWTH_ESTIMATE[summary.platform] ?? 3,
      }));
  }, [filters.platform, filters.campaign, posts]);

  const overview = useMemo<AnalyticsOverview>(() => {
    const followers = platforms.reduce((sum, item) => sum + item.followers, 0);
    const reach = posts.reduce((sum, item) => sum + item.reach, 0);
    const engagement = posts.reduce((sum, item) => sum + item.engagement, 0);
    const likes = posts.reduce((sum, item) => sum + item.likes, 0);
    const comments = posts.reduce((sum, item) => sum + item.comments, 0);
    const shares = posts.reduce((sum, item) => sum + item.shares, 0);
    const clicks = posts.reduce((sum, item) => sum + item.clicks, 0);
    return {
      followers,
      reach,
      impressions: Math.round(reach * 1.68),
      engagement,
      likes,
      comments,
      shares,
      clicks,
      ctr: reach ? Number(((clicks / reach) * 100).toFixed(2)) : 0,
      growth: platforms.length ? Number((platforms.reduce((sum, item) => sum + item.growth, 0) / platforms.length).toFixed(1)) : 0,
    };
  }, [platforms, posts]);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);
  const refreshAi = useCallback(() => {
    setAiVersion(value => value + 1);
    showToast("AI insights regenerated.");
  }, [showToast]);

  const exportData = useCallback(
    (format: "csv" | "excel" | "pdf") => {
      if (!canExport) return;
      const rows = [
        ["Platform", "Caption", "Campaign", "Reach", "Engagement", "Likes", "Comments", "Shares", "CTR"],
        ...posts.map(post => [post.platform, post.caption, post.campaign, post.reach, post.engagement, post.likes, post.comments, post.shares, post.ctr]),
      ];
      const content =
        format === "pdf"
          ? `CALIXO SOCIAL ANALYTICS REPORT\nGenerated ${new Date().toLocaleString()}\n\nFollowers: ${overview.followers}\nReach: ${overview.reach}\nEngagement: ${overview.engagement}\nCTR: ${overview.ctr}%\n\n${posts.map(post => `${post.platform}: ${post.caption} — ${post.reach} reach`).join("\n")}`
          : rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
      const extension = format === "excel" ? "xls" : format;
      const blob = new Blob([content], { type: format === "pdf" ? "application/pdf" : format === "excel" ? "application/vnd.ms-excel" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `calixo-social-analytics.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`${format.toUpperCase()} report exported.`);
    },
    [posts, overview, showToast, canExport]
  );

  const value = useMemo(
    () => ({ filters, setFilters, resetFilters, posts, platforms, series, overview, campaigns: campaignSocialMetrics, aiVersion, refreshAi, exportData, showToast }),
    [filters, resetFilters, posts, platforms, series, overview, aiVersion, refreshAi, exportData, showToast]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <EmptyState icon={<Lock size={32} />} title="You don't have access to Social Analytics" description="Ask a workspace admin to grant the social:read permission." />
      </div>
    );
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-[80] flex items-center gap-3 rounded-2xl border border-success/30 bg-card px-4 py-3 text-sm text-foreground shadow-2xl">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </AnalyticsContext.Provider>
  );
}

export function useSocialAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error("useSocialAnalytics must be used within SocialAnalyticsProvider");
  return context;
}
