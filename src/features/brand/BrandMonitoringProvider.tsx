"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import {
  ALERT_RULES_SEED,
  BRAND_REPORTS_SEED,
  REPUTATION_ORGANIZATION_ID,
  REPUTATION_SETTINGS_SEED,
  SHARE_OF_VOICE_TIMELINE_SEED,
  TRENDING_TOPICS_SEED,
  canUseReputationFeature,
  initializeReputationFoundation,
  logReputationError,
  recordReputationUsage,
  reputationPlatformAPI,
  syncReputationSourcesFromConnectors,
  trackReputationAction,
  trackReputationTiming,
} from "@/core/reputation";
import type { AlertRule, BrandMention, BrandReport, ReputationSettings } from "@/core/reputation";
import { workflowPlatformAPI } from "@/core/workflow";
import { generateId } from "@/shared/utils/string";
import { useUser } from "@clerk/nextjs";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { ModuleEmptyState } from "@/components/enterprise/module";

/**
 * The brief's `brand.alert.read`/`brand.competitor.read`/`brand.sentiment.read` don't each map to
 * a distinct string in the platform's closed 15-verb `ActionType` vocabulary — consolidated the
 * same way Social's dotted actions were: alert.read/competitor.read/sentiment.read→read,
 * report.create→create, keyword.manage/alert.manage→manage. `connector.manage` reuses the
 * existing `connector` resource type. `"brand"` is already a real `ResourceType` (part of the
 * `organization → workspace → brand` tenant hierarchy) — no type-system edits needed.
 */
const BRAND_ACTION_PERMISSIONS = {
  read: permissionName("brand", "read"),
  create: permissionName("brand", "create"),
  update: permissionName("brand", "update"),
  delete: permissionName("brand", "delete"),
  export: permissionName("brand", "export"),
  approve: permissionName("brand", "approve"),
  assign: permissionName("brand", "assign"),
  manage: permissionName("brand", "manage"),
  connectorManage: permissionName("connector", "manage"),
} as const;

interface ReputationTenantContext {
  organizationId: string;
  userId: string;
}

interface BrandMonitoringContextValue {
  mentions: BrandMention[];
  hydrated: boolean;
  kpis: ReturnType<typeof reputationPlatformAPI.getKpis>;
  platformDistribution: ReturnType<typeof reputationPlatformAPI.getPlatformDistribution>;
  countryDistribution: ReturnType<typeof reputationPlatformAPI.getCountryDistribution>;
  sentimentTimeline: ReturnType<typeof reputationPlatformAPI.getSentimentTimeline>;
  keywordCloud: ReturnType<typeof reputationPlatformAPI.getKeywordCloud>;
  topicSentimentBreakdown: ReturnType<typeof reputationPlatformAPI.getTopicSentimentBreakdown>;
  sentimentDrivers: ReturnType<typeof reputationPlatformAPI.getTopSentimentDrivers>;
  competitors: ReturnType<typeof reputationPlatformAPI.getCompetitorLandscape>;
  shareOfVoiceTimeline: typeof SHARE_OF_VOICE_TIMELINE_SEED;
  trendingTopics: typeof TRENDING_TOPICS_SEED;
  crisisAlerts: ReturnType<typeof reputationPlatformAPI.getCrisisAlerts>;
  alertRules: AlertRule[];
  reports: BrandReport[];
  settings: ReputationSettings;
  insights: ReturnType<typeof reputationPlatformAPI.getInsights>;
  sentimentForecast: ReturnType<typeof reputationPlatformAPI.forecastReputationTrend>;
  healthScore: ReturnType<typeof reputationPlatformAPI.getHealthScore>;
  actionCenterItems: ReturnType<typeof reputationPlatformAPI.getActionCenterItems>;
  tenantContext: ReputationTenantContext;
  currentUserName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canApprove: boolean;
  canAssign: boolean;
  canManage: boolean;
  canManageConnectors: boolean;
  resolveMention: (id: string) => void;
  unresolveMention: (id: string) => void;
  flagMention: (id: string) => void;
  unflagMention: (id: string) => void;
  escalateMention: (id: string) => void;
  exportMentions: () => boolean;
  resolveCrisisAlert: (id: string) => void;
  reopenCrisisAlert: (id: string) => void;
  createAlertRule: (input: Omit<AlertRule, "id" | "createdAt">) => void;
  toggleAlertRule: (id: string, enabled: boolean) => void;
  deleteAlertRule: (id: string) => void;
  generateReport: (id: string) => void;
  previewReport: (id: string) => void;
  downloadReport: (id: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  addCompetitor: (name: string) => void;
  removeCompetitor: (name: string) => void;
  saveThresholds: (thresholds: ReputationSettings["alertThresholds"]) => void;
  refreshAll: () => void;
  showToast: (message: string) => void;
}

const BrandMonitoringContext = createContext<BrandMonitoringContextValue | undefined>(undefined);

/**
 * The single Context for Brand Monitoring — unlike Social Media (5 pre-existing providers) or
 * Ads (1 pre-existing provider), Brand Monitoring had NO provider architecture at all before this
 * certification pass; all 10 components imported directly from a static fixture. Introducing one
 * provider here (mirrors `CampaignProvider.tsx` exactly) fills a gap rather than replacing working
 * architecture. Mounted once in `dashboard/brand/layout.tsx`.
 */
export function BrandMonitoringProvider({ children }: { children: ReactNode }) {
  const [mentions, setMentions] = useState<BrandMention[]>(() => reputationPlatformAPI.listMentions());
  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => [...ALERT_RULES_SEED]);
  const [reports, setReports] = useState<BrandReport[]>(() => [...BRAND_REPORTS_SEED]);
  const [settings, setSettings] = useState<ReputationSettings>(() => ({ ...REPUTATION_SETTINGS_SEED }));
  const [crisisVersion, setCrisisVersion] = useState(0);
  const [connectorSyncVersion, setConnectorSyncVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [permissions, setPermissions] = useState<string[] | null>(null);

  const { identity } = useCalixoIdentity();
  const { user: clerkUser } = useUser();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo<ReputationTenantContext>(
    () => ({ organizationId: organizationId ?? REPUTATION_ORGANIZATION_ID, userId: identity?.userId ?? "" }),
    [organizationId, identity?.userId]
  );
  const currentUserName = clerkUser?.fullName ?? clerkUser?.firstName ?? "";

  useEffect(() => {
    initializeReputationFoundation();
  }, []);

  useEffect(() => {
    (async () => {
      await syncReputationSourcesFromConnectors(tenantContext.organizationId);
      setConnectorSyncVersion(v => v + 1);
    })();
  }, [tenantContext.organizationId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const viewRecorded = useRef(false);
  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;
    recordReputationUsage(tenantContext, "reputation.dashboardView");
  }, [tenantContext]);

  /** `null` while identity resolution is still in flight — `middleware.ts` already blocks unauthenticated requests before this component ever renders. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!identity) {
        if (!cancelled) setPermissions(null);
        return;
      }
      await initializePlatformFoundation();
      const effective = await authorizationPlatformAPI.getEffectivePermissions(identity.userId, organizationId ?? undefined);
      if (!cancelled) setPermissions(effective);
    })();
    return () => {
      cancelled = true;
    };
  }, [identity, organizationId]);

  const hasPermission = useCallback((permission: string) => !permissions || permissions.includes(permission), [permissions]);
  const canRead = hasPermission(BRAND_ACTION_PERMISSIONS.read);
  const canCreate = hasPermission(BRAND_ACTION_PERMISSIONS.create);
  const canUpdate = hasPermission(BRAND_ACTION_PERMISSIONS.update);
  const canDelete = hasPermission(BRAND_ACTION_PERMISSIONS.delete);
  const canExport = hasPermission(BRAND_ACTION_PERMISSIONS.export);
  const canApprove = hasPermission(BRAND_ACTION_PERMISSIONS.approve);
  const canAssign = hasPermission(BRAND_ACTION_PERMISSIONS.assign);
  const canManage = hasPermission(BRAND_ACTION_PERMISSIONS.manage);
  const canManageConnectors = hasPermission(BRAND_ACTION_PERMISSIONS.connectorManage);

  const showToast = useCallback((message: string) => setToast(message), []);

  const resolveMention = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      reputationPlatformAPI.resolveMention(id);
      setMentions(reputationPlatformAPI.listMentions());
      recordReputationUsage(tenantContext, "reputation.mentionResolved");
      trackReputationAction("resolve");
    },
    [canUpdate, tenantContext]
  );

  const unresolveMention = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      reputationPlatformAPI.unresolveMention(id);
      setMentions(reputationPlatformAPI.listMentions());
      trackReputationAction("unresolve");
    },
    [canUpdate]
  );

  const flagMention = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      reputationPlatformAPI.flagMention(id);
      setMentions(reputationPlatformAPI.listMentions());
      trackReputationAction("flag");
    },
    [canUpdate]
  );

  const unflagMention = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      reputationPlatformAPI.unflagMention(id);
      setMentions(reputationPlatformAPI.listMentions());
      trackReputationAction("unflag");
    },
    [canUpdate]
  );

  const escalateMention = useCallback(
    (id: string) => {
      if (!canAssign) return;
      const mention = reputationPlatformAPI.getMention(id);
      if (!mention) return;
      try {
        const entry = workflowPlatformAPI.createWorkflow({
          title: `Escalation: ${mention.author} on ${mention.platform}`,
          description: mention.content,
          assetId: mention.id,
          assetName: `${mention.platform} mention from ${mention.author}`,
          priority: mention.isFlagged ? "high" : "medium",
          submittedBy: currentUserName,
        });
        reputationPlatformAPI.updateMention(id, { workflowEntryId: entry.id });
        setMentions(reputationPlatformAPI.listMentions());
        trackReputationAction("escalate");
        showToast("Escalated to the response team.");
      } catch (error) {
        logReputationError(`Failed to escalate mention ${id}`, error);
      }
    },
    [canAssign, currentUserName, showToast]
  );

  /** Combines the `brand:export` permission with the real Entitlement Platform check, then records the usage. */
  const exportMentions = useCallback(() => {
    if (!canExport || !canUseReputationFeature(tenantContext, "reputation.export")) return false;
    recordReputationUsage(tenantContext, "reputation.export");
    trackReputationAction("export");
    showToast("Mentions exported.");
    return true;
  }, [canExport, tenantContext, showToast]);

  const resolveCrisisAlert = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      reputationPlatformAPI.resolveCrisisAlert(id);
      setCrisisVersion(v => v + 1);
      trackReputationAction("crisisResolved");
    },
    [canUpdate]
  );

  const reopenCrisisAlert = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      reputationPlatformAPI.reopenCrisisAlert(id);
      setCrisisVersion(v => v + 1);
    },
    [canUpdate]
  );

  const createAlertRule = useCallback(
    (input: Omit<AlertRule, "id" | "createdAt">) => {
      if (!canManage) return;
      const rule: AlertRule = { ...input, id: generateId(8), createdAt: new Date().toISOString().slice(0, 10) };
      setAlertRules(prev => [rule, ...prev]);
      trackReputationAction("alertRuleCreated");
      showToast(`Alert rule "${rule.name}" created.`);
    },
    [canManage, showToast]
  );

  const toggleAlertRule = useCallback(
    (id: string, enabled: boolean) => {
      if (!canManage) return;
      setAlertRules(prev => prev.map(rule => (rule.id === id ? { ...rule, enabled } : rule)));
      trackReputationAction("alertRuleToggled");
    },
    [canManage]
  );

  const deleteAlertRule = useCallback(
    (id: string) => {
      if (!canManage) return;
      setAlertRules(prev => prev.filter(rule => rule.id !== id));
      trackReputationAction("alertRuleDeleted");
    },
    [canManage]
  );

  const generateReport = useCallback(
    (id: string) => {
      if (!canCreate) return;
      const startedAt = Date.now();
      setReports(prev => prev.map(report => (report.id === id ? { ...report, status: "generating" } : report)));
      recordReputationUsage(tenantContext, "reputation.reportGenerated");
      trackReputationAction("reportGenerated");
      setTimeout(() => {
        setReports(prev => prev.map(report => (report.id === id ? { ...report, status: "ready", lastGenerated: new Date().toISOString().slice(0, 10) } : report)));
        trackReputationTiming("reportGenerate", Date.now() - startedAt);
        showToast("Report generated.");
      }, 900);
    },
    [canCreate, tenantContext, showToast]
  );

  const previewReport = useCallback(
    (id: string) => {
      if (!canRead) return;
      const report = reports.find(r => r.id === id);
      trackReputationAction("reportPreviewed");
      if (report) showToast(`Previewing "${report.name}"…`);
    },
    [canRead, reports, showToast]
  );

  const downloadReport = useCallback(
    (id: string) => {
      if (!canExport || !canUseReputationFeature(tenantContext, "reputation.export")) return;
      const report = reports.find(r => r.id === id);
      if (!report) return;
      recordReputationUsage(tenantContext, "reputation.export");
      trackReputationAction("reportDownloaded");
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.name.replace(/\s+/g, "_")}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded "${report.name}".`);
    },
    [canExport, tenantContext, reports, showToast]
  );

  const addKeyword = useCallback(
    (keyword: string) => {
      if (!canManage || !keyword.trim()) return;
      const trimmed = keyword.trim();
      setSettings(prev => (prev.trackedKeywords.includes(trimmed) ? prev : { ...prev, trackedKeywords: [...prev.trackedKeywords, trimmed] }));
      recordReputationUsage(tenantContext, "reputation.keywordMonitored");
    },
    [canManage, tenantContext]
  );

  const removeKeyword = useCallback(
    (keyword: string) => {
      if (!canManage) return;
      setSettings(prev => ({ ...prev, trackedKeywords: prev.trackedKeywords.filter(k => k !== keyword) }));
    },
    [canManage]
  );

  const addCompetitor = useCallback(
    (name: string) => {
      if (!canManage || !name.trim()) return;
      const trimmed = name.trim();
      setSettings(prev => (prev.trackedCompetitors.includes(trimmed) ? prev : { ...prev, trackedCompetitors: [...prev.trackedCompetitors, trimmed] }));
      recordReputationUsage(tenantContext, "reputation.competitorMonitored");
    },
    [canManage, tenantContext]
  );

  const removeCompetitor = useCallback(
    (name: string) => {
      if (!canManage) return;
      setSettings(prev => ({ ...prev, trackedCompetitors: prev.trackedCompetitors.filter(c => c !== name) }));
    },
    [canManage]
  );

  const saveThresholds = useCallback(
    (thresholds: ReputationSettings["alertThresholds"]) => {
      if (!canManage) return;
      setSettings(prev => ({ ...prev, alertThresholds: thresholds }));
      showToast("Alert thresholds saved.");
    },
    [canManage, showToast]
  );

  const refreshAll = useCallback(() => {
    setMentions(reputationPlatformAPI.listMentions());
    setCrisisVersion(v => v + 1);
    trackReputationAction("refresh");
    showToast("Brand Monitoring data refreshed.");
  }, [showToast]);

  const kpis = useMemo(() => reputationPlatformAPI.getKpis(mentions), [mentions]);
  const platformDistribution = useMemo(() => reputationPlatformAPI.getPlatformDistribution(mentions), [mentions]);
  const countryDistribution = useMemo(() => reputationPlatformAPI.getCountryDistribution(mentions), [mentions]);
  const sentimentTimeline = useMemo(() => reputationPlatformAPI.getSentimentTimeline(mentions), [mentions]);
  const keywordCloud = useMemo(() => reputationPlatformAPI.getKeywordCloud(mentions), [mentions]);
  const topicSentimentBreakdown = useMemo(() => reputationPlatformAPI.getTopicSentimentBreakdown(mentions), [mentions]);
  const sentimentDrivers = useMemo(() => reputationPlatformAPI.getTopSentimentDrivers(mentions), [mentions]);
  const competitors = useMemo(() => reputationPlatformAPI.getCompetitorLandscape(mentions), [mentions]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- crisisVersion is a manual re-trigger: resolve/reopen mutate the registry's resolved-id set, which `mentions` doesn't reflect
  const crisisAlerts = useMemo(() => reputationPlatformAPI.getCrisisAlerts(mentions), [mentions, crisisVersion]);
  const insights = useMemo(() => reputationPlatformAPI.getInsights(mentions), [mentions]);
  const sentimentForecast = useMemo(() => reputationPlatformAPI.forecastReputationTrend(sentimentTimeline.map(p => p.positive), 3), [sentimentTimeline]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- crisisVersion/connectorSyncVersion are manual re-triggers for state the health score reads but `mentions` doesn't reflect
  const healthScore = useMemo(() => reputationPlatformAPI.getHealthScore(mentions), [mentions, crisisVersion, connectorSyncVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- crisisVersion is a manual re-trigger for state the action center reads but `mentions` doesn't reflect
  const actionCenterItems = useMemo(() => reputationPlatformAPI.getActionCenterItems(mentions, undefined, tenantContext.organizationId), [mentions, crisisVersion, tenantContext.organizationId]);

  const value = useMemo<BrandMonitoringContextValue>(
    () => ({
      mentions,
      hydrated,
      kpis,
      platformDistribution,
      countryDistribution,
      sentimentTimeline,
      keywordCloud,
      topicSentimentBreakdown,
      sentimentDrivers,
      competitors,
      shareOfVoiceTimeline: SHARE_OF_VOICE_TIMELINE_SEED,
      trendingTopics: TRENDING_TOPICS_SEED,
      crisisAlerts,
      alertRules,
      reports,
      settings,
      insights,
      sentimentForecast,
      healthScore,
      actionCenterItems,
      tenantContext,
      currentUserName,
      canRead,
      canCreate,
      canUpdate,
      canDelete,
      canExport,
      canApprove,
      canAssign,
      canManage,
      canManageConnectors,
      resolveMention,
      unresolveMention,
      flagMention,
      unflagMention,
      escalateMention,
      exportMentions,
      resolveCrisisAlert,
      reopenCrisisAlert,
      createAlertRule,
      toggleAlertRule,
      deleteAlertRule,
      generateReport,
      previewReport,
      downloadReport,
      addKeyword,
      removeKeyword,
      addCompetitor,
      removeCompetitor,
      saveThresholds,
      refreshAll,
      showToast,
    }),
    [
      mentions,
      hydrated,
      kpis,
      platformDistribution,
      countryDistribution,
      sentimentTimeline,
      keywordCloud,
      topicSentimentBreakdown,
      sentimentDrivers,
      competitors,
      crisisAlerts,
      alertRules,
      reports,
      settings,
      insights,
      sentimentForecast,
      healthScore,
      actionCenterItems,
      tenantContext,
      currentUserName,
      canRead,
      canCreate,
      canUpdate,
      canDelete,
      canExport,
      canApprove,
      canAssign,
      canManage,
      canManageConnectors,
      resolveMention,
      unresolveMention,
      flagMention,
      unflagMention,
      escalateMention,
      exportMentions,
      resolveCrisisAlert,
      reopenCrisisAlert,
      createAlertRule,
      toggleAlertRule,
      deleteAlertRule,
      generateReport,
      previewReport,
      downloadReport,
      addKeyword,
      removeKeyword,
      addCompetitor,
      removeCompetitor,
      saveThresholds,
      refreshAll,
      showToast,
    ]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Brand Monitoring" description="Ask a workspace admin to grant the brand:read permission." />
      </div>
    );
  }

  return (
    <BrandMonitoringContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-success/20 bg-card px-4 py-3 text-sm text-foreground shadow-2xl">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </BrandMonitoringContext.Provider>
  );
}

export function useBrandMonitoring() {
  const context = useContext(BrandMonitoringContext);
  if (!context) throw new Error("useBrandMonitoring must be used within BrandMonitoringProvider");
  return context;
}
