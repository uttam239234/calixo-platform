"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { socialPlatformAPI, createPostId, getLiveSocialAccountStatus, initializeSocialFoundation, logSocialError, recordSocialUsage, syncSocialAccountsFromConnectors, trackSocialAction, trackSocialTiming } from "@/core/social";
import type { SocialAccount, SocialActionCenterItem, SocialHealthScore, SocialPlatform, SocialPost, SocialRecommendation } from "@/core/social";
import { useSocialTenant, type SocialTenantContext } from "@/hooks/useSocialTenant";
import { EmptyState } from "@/components/ui/EmptyState";

interface SocialContextRecommendation extends SocialRecommendation {
  /** Derived from `status === "applied"` — kept for backward compatibility with existing consumers (`AiRecommendations.tsx`) that render a boolean, not the richer registry status. */
  applied: boolean;
}

interface SocialContextValue {
  accounts: SocialAccount[];
  posts: SocialPost[];
  recommendations: SocialContextRecommendation[];
  healthScore: SocialHealthScore;
  actionCenterItems: SocialActionCenterItem[];
  engagementInsight: string;
  hydrated: boolean;
  tenantContext: SocialTenantContext;
  currentUserName: string;
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canExport: boolean;
  refreshAll: () => void;
  exportReport: () => void;
  toggleAccount: (id: string) => void;
  syncAccount: (id: string) => void;
  createDraft: () => void;
  schedulePost: () => void;
  generateAiPost: () => void;
  publishComposedPost: (platforms: SocialPlatform[], content: string, status: SocialPost["status"], publishedAt: string) => void;
  updatePostStatus: (id: string, status: SocialPost["status"]) => void;
  deletePost: (id: string) => void;
  applyRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  showToast: (message: string) => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

/**
 * `accounts`/`posts` mirror the `socialEngine` singleton (via `socialPlatformAPI`) — every
 * mutation calls through the platform API first, then re-syncs local state from
 * `listAccounts()`/`listPosts()` so derived views recompute in step — same pattern as Ads'
 * `CampaignProvider`.
 */
export function SocialProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => socialPlatformAPI.listAccounts());
  const [posts, setPosts] = useState<SocialPost[]>(() => socialPlatformAPI.listPosts());
  const [recommendationVersion, setRecommendationVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const { tenantContext, currentUserName, canRead, canCreate, canUpdate, canPublish, canDelete, canExport, canManageConnectors } = useSocialTenant();

  useEffect(() => {
    initializeSocialFoundation();
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  /** The Connector Platform's real hookup point — upgrades an account's status/health to real connector data where one exists (Instagram only — see `SocialConnectorAdapter.ts`'s header comment), then re-syncs the raw account record so every consumer (not just computed summaries) sees it. */
  useEffect(() => {
    (async () => {
      await syncSocialAccountsFromConnectors();
      for (const account of socialPlatformAPI.listAccounts()) {
        const live = getLiveSocialAccountStatus(account.id);
        if (live) socialPlatformAPI.updateAccount(account.id, { status: live.status, lastSync: live.lastSync, isLiveConnector: true });
      }
      setAccounts(socialPlatformAPI.listAccounts());
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const viewRecorded = useRef(false);
  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;
    recordSocialUsage(tenantContext, "social.dashboardView");
  }, [tenantContext]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const refreshAll = useCallback(() => {
    for (const account of socialPlatformAPI.listAccounts()) socialPlatformAPI.updateAccount(account.id, { lastSync: "Just now" });
    setAccounts(socialPlatformAPI.listAccounts());
    showToast("All social accounts refreshed.");
  }, [showToast]);

  const exportReport = useCallback(() => {
    if (!canExport) return;
    const rows = posts.map(post => [post.platform, post.status, post.content, post.likes, post.comments, post.shares, post.reach]);
    const csv = [["Platform", "Status", "Content", "Likes", "Comments", "Shares", "Reach"], ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "calixo-social-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    recordSocialUsage(tenantContext, "social.export");
    showToast("Social report exported.");
  }, [posts, showToast, canExport, tenantContext]);

  const toggleAccount = useCallback(
    (id: string) => {
      if (!canManageConnectors) return;
      const account = socialPlatformAPI.getAccount(id);
      if (!account) return;
      const nextStatus = account.status === "Connected" ? "Disconnected" : "Connected";
      socialPlatformAPI.updateAccount(id, { status: nextStatus, lastSync: nextStatus === "Connected" ? "Just now" : account.lastSync });
      setAccounts(socialPlatformAPI.listAccounts());
      recordSocialUsage(tenantContext, "social.accountConnected");
      showToast("Account connection updated.");
    },
    [showToast, canManageConnectors, tenantContext]
  );

  const syncAccount = useCallback(
    (id: string) => {
      if (!canManageConnectors) return;
      socialPlatformAPI.updateAccount(id, { lastSync: "Just now", status: "Connected" });
      setAccounts(socialPlatformAPI.listAccounts());
      showToast("Account synchronized.");
    },
    [showToast, canManageConnectors]
  );

  const addPost = useCallback(
    (status: SocialPost["status"], content: string) => {
      if (!canCreate) return;
      socialPlatformAPI.createPost({
        id: createPostId(),
        platform: "Instagram",
        accountId: "instagram",
        content,
        status,
        publishedAt: status === "Scheduled" ? "Tomorrow, 10:00 AM" : "Not scheduled",
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        organizationId: tenantContext.organizationId,
      });
      setPosts(socialPlatformAPI.listPosts());
    },
    [canCreate, tenantContext]
  );

  const createDraft = useCallback(() => {
    addPost("Draft", "New social campaign draft — ready for your message.");
    showToast("Draft created.");
  }, [addPost, showToast]);

  const schedulePost = useCallback(() => {
    addPost("Scheduled", "Scheduled update from the Calixo social workspace.");
    showToast("Post scheduled for tomorrow.");
  }, [addPost, showToast]);

  const generateAiPost = useCallback(() => {
    addPost("Draft", "AI-powered teams move faster when insight, content, and execution share one workspace.");
    showToast("AI post generated.");
  }, [addPost, showToast]);

  const publishComposedPost = useCallback(
    (platforms: SocialPlatform[], content: string, status: SocialPost["status"], publishedAt: string) => {
      if (!canPublish) return;
      const startedAt = Date.now();
      try {
        const currentAccounts = socialPlatformAPI.listAccounts();
        const newPosts: SocialPost[] = platforms.map(platform => {
          const accountPlatform = platform === "YouTube Community" ? "YouTube" : platform;
          const account = currentAccounts.find(item => item.platform === accountPlatform);
          return {
            id: createPostId(),
            platform,
            accountId: account?.id ?? platform.toLowerCase().replaceAll(" ", "-"),
            content,
            status,
            publishedAt,
            likes: 0,
            comments: 0,
            shares: 0,
            reach: 0,
            organizationId: tenantContext.organizationId,
          };
        });
        socialPlatformAPI.createPosts(newPosts);
        setPosts(socialPlatformAPI.listPosts());
        recordSocialUsage(tenantContext, "social.postPublished", platforms.length);
        trackSocialAction(status === "Scheduled" ? "schedule" : "publish");
        trackSocialTiming("postPublish", Date.now() - startedAt);
      } catch (error) {
        logSocialError(`Failed to ${status === "Scheduled" ? "schedule" : "publish"} post across ${platforms.length} platform(s)`, error);
        throw error;
      }
    },
    [canPublish, tenantContext]
  );

  const updatePostStatus = useCallback(
    (id: string, status: SocialPost["status"]) => {
      if (!canUpdate) return;
      socialPlatformAPI.updatePostStatus(id, status);
      setPosts(socialPlatformAPI.listPosts());
      trackSocialAction("statusChange");
      showToast(`Post marked ${status.toLowerCase()}.`);
    },
    [showToast, canUpdate]
  );

  const deletePost = useCallback(
    (id: string) => {
      if (!canDelete) return;
      socialPlatformAPI.deletePost(id);
      setPosts(socialPlatformAPI.listPosts());
      trackSocialAction("delete");
      showToast("Post deleted.");
    },
    [showToast, canDelete]
  );

  const applyRecommendation = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      socialPlatformAPI.applyRecommendation(id);
      setRecommendationVersion(v => v + 1);
      showToast("Recommendation applied.");
    },
    [showToast, canUpdate]
  );

  const dismissRecommendation = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      socialPlatformAPI.dismissRecommendation(id);
      setRecommendationVersion(v => v + 1);
      showToast("Recommendation dismissed.");
    },
    [showToast, canUpdate]
  );

  const recommendations = useMemo<SocialContextRecommendation[]>(
    () =>
      socialPlatformAPI
        .getRecommendations(accounts, posts)
        .filter(r => r.status !== "dismissed")
        .map(r => ({ ...r, applied: r.status === "applied" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recommendationVersion is a manual re-trigger for apply/dismiss, which mutate registry state the accounts/posts arrays don't reflect
    [accounts, posts, recommendationVersion]
  );

  const healthScore = useMemo(
    () => socialPlatformAPI.getHealthScore(accounts, posts),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recommendationVersion is a manual re-trigger: recommendations feed the health score's queue signal indirectly via posts, but approvals/workflow state isn't reflected in accounts/posts
    [accounts, posts, recommendationVersion]
  );

  const actionCenterItems = useMemo(
    () => socialPlatformAPI.getActionCenterItems(accounts, posts, "30d", tenantContext.organizationId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recommendationVersion is a manual re-trigger for apply/dismiss, which mutate registry state the accounts/posts arrays don't reflect
    [accounts, posts, recommendationVersion, tenantContext.organizationId]
  );

  const engagementInsight = useMemo(() => socialPlatformAPI.explainEngagement(accounts), [accounts]);

  const value = useMemo(
    () => ({
      accounts,
      posts,
      recommendations,
      healthScore,
      actionCenterItems,
      engagementInsight,
      hydrated,
      tenantContext,
      currentUserName,
      canCreate,
      canUpdate,
      canPublish,
      canDelete,
      canExport,
      refreshAll,
      exportReport,
      toggleAccount,
      syncAccount,
      createDraft,
      schedulePost,
      generateAiPost,
      publishComposedPost,
      updatePostStatus,
      deletePost,
      applyRecommendation,
      dismissRecommendation,
      showToast,
    }),
    [
      accounts,
      posts,
      recommendations,
      healthScore,
      actionCenterItems,
      engagementInsight,
      hydrated,
      tenantContext,
      currentUserName,
      canCreate,
      canUpdate,
      canPublish,
      canDelete,
      canExport,
      refreshAll,
      exportReport,
      toggleAccount,
      syncAccount,
      createDraft,
      schedulePost,
      generateAiPost,
      publishComposedPost,
      updatePostStatus,
      deletePost,
      applyRecommendation,
      dismissRecommendation,
      showToast,
    ]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <EmptyState icon={<Lock size={32} />} title="You don't have access to Social Media" description="Ask a workspace admin to grant the social:read permission." />
      </div>
    );
  }

  return (
    <SocialContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-success/30 bg-card px-4 py-3 text-sm text-foreground shadow-2xl">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) throw new Error("useSocial must be used within SocialProvider");
  return context;
}
