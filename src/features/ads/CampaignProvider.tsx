"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle2, Lock } from "lucide-react";
import { adsPlatformAPI, canUseAdsFeature, initializeAdsFoundation, logAdsError, recordAdsUsage, syncAdsPlatformsFromConnectors, trackAdsAction, trackAdsTiming, ADS_ORGANIZATION_ID } from "@/core/ads";
import type { AdsActionCenterItem, AdsBudget, AdsHealthScore, AdsPerformanceSummary, AdsPlatform, AdsRecommendation, Campaign, CampaignAction } from "@/core/ads";
import { useUser } from "@clerk/nextjs";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { EmptyState } from "@/components/ui/EmptyState";

const ADS_ACTION_PERMISSIONS = {
  read: permissionName("campaign", "read"),
  create: permissionName("campaign", "create"),
  update: permissionName("campaign", "update"),
  archive: permissionName("campaign", "archive"),
  delete: permissionName("campaign", "delete"),
  export: permissionName("campaign", "export"),
} as const;

interface AdsTenantContext {
  organizationId: string;
  userId: string;
}

const CampaignContext = createContext<{
  campaigns: Campaign[];
  hydrated: boolean;
  platforms: AdsPlatform[];
  budget: AdsBudget;
  performance: AdsPerformanceSummary;
  recommendations: AdsRecommendation[];
  healthScore: AdsHealthScore;
  actionCenterItems: AdsActionCenterItem[];
  roasInsight: string;
  tenantContext: AdsTenantContext;
  currentUserName: string;
  canCreate: boolean;
  canUpdate: boolean;
  canArchive: boolean;
  canDelete: boolean;
  canExport: boolean;
  recordExport: (quantity: number) => boolean;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: ((campaign: Campaign) => void) & ((id: string, partial: Partial<Campaign>) => void);
  actOnCampaigns: (ids: string[], action: CampaignAction) => void;
  applyRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  showToast: (message: string) => void;
} | undefined>(undefined);

/**
 * `campaigns` mirrors the `adsEngine` singleton (via `adsPlatformAPI`) — every mutation calls
 * through the platform API first, then re-syncs local state from `listCampaigns()` so the
 * derived `platforms`/`budget`/`performance`/`recommendations` views (computed live from the
 * same source) recompute in step. No localStorage persistence, matching every other module's
 * in-memory-singleton pattern in this codebase.
 *
 * Also the single tenant/permission boundary for every Ads route (mounted once in
 * `dashboard/ads/layout.tsx`) — mirrors the `tenantContext`/effective-permissions pattern in
 * `AnalyticsPage.tsx`, just hoisted to the shared layout instead of one big page component
 * since Ads Manager's routes are split across several thin `page.tsx` files.
 */
export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => adsPlatformAPI.listCampaigns());
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [recommendationVersion, setRecommendationVersion] = useState(0);
  const [connectorSyncVersion, setConnectorSyncVersion] = useState(0);
  const [permissions, setPermissions] = useState<string[] | null>(null);

  const { identity } = useCalixoIdentity();
  const { user: clerkUser } = useUser();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo<AdsTenantContext>(
    () => ({ organizationId: organizationId ?? ADS_ORGANIZATION_ID, userId: identity?.userId ?? "" }),
    [organizationId, identity?.userId]
  );
  const currentUserName = clerkUser?.fullName ?? clerkUser?.firstName ?? "";

  useEffect(() => {
    initializeAdsFoundation();
  }, []);

  /** The Connector Platform's real hookup point — upgrades platform status/health to real connector data where one exists, then forces `platforms` to recompute. */
  useEffect(() => {
    (async () => {
      await syncAdsPlatformsFromConnectors(tenantContext.organizationId);
      setConnectorSyncVersion(v => v + 1);
    })();
  }, [tenantContext.organizationId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
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
    recordAdsUsage(tenantContext, "ads.campaignView");
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
  const canRead = hasPermission(ADS_ACTION_PERMISSIONS.read);
  const canCreate = hasPermission(ADS_ACTION_PERMISSIONS.create);
  const canUpdate = hasPermission(ADS_ACTION_PERMISSIONS.update);
  const canArchive = hasPermission(ADS_ACTION_PERMISSIONS.archive);
  const canDelete = hasPermission(ADS_ACTION_PERMISSIONS.delete);
  const canExport = hasPermission(ADS_ACTION_PERMISSIONS.export);

  const addCampaign = useCallback(
    (campaign: Campaign) => {
      if (!canCreate) return;
      const startedAt = Date.now();
      try {
        adsPlatformAPI.createCampaign(campaign);
        setCampaigns(adsPlatformAPI.listCampaigns());
        recordAdsUsage(tenantContext, "ads.campaignCreated");
        trackAdsAction("publish");
        trackAdsTiming("campaignPublish", Date.now() - startedAt);
      } catch (error) {
        logAdsError(`Failed to create campaign "${campaign.name}"`, error);
        throw error;
      }
    },
    [canCreate, tenantContext]
  );

  const updateCampaign = useCallback(
    (idOrCampaign: string | Campaign, partial?: Partial<Campaign>) => {
      if (!canUpdate) return;
      if (typeof idOrCampaign === "string" && partial) {
        adsPlatformAPI.updateCampaign(idOrCampaign, partial);
      } else if (typeof idOrCampaign === "object") {
        adsPlatformAPI.updateCampaign(idOrCampaign.id, idOrCampaign);
      }
      setCampaigns(adsPlatformAPI.listCampaigns());
    },
    [canUpdate]
  );

  const actOnCampaigns = useCallback(
    (ids: string[], action: CampaignAction) => {
      const gate = action === "Delete" ? canDelete : action === "Archive" ? canArchive : action === "Duplicate" ? canCreate : canUpdate;
      if (!gate) return;
      try {
        adsPlatformAPI.applyCampaignAction(ids, action);
        setCampaigns(adsPlatformAPI.listCampaigns());
        recordAdsUsage(tenantContext, "ads.campaignAction", ids.length);
        trackAdsAction(action.toLowerCase());
      } catch (error) {
        logAdsError(`Failed to apply action "${action}" to ${ids.length} campaign(s)`, error);
        throw error;
      }
    },
    [canDelete, canArchive, canCreate, canUpdate, tenantContext]
  );

  const applyRecommendation = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      adsPlatformAPI.applyRecommendation(id);
      setRecommendationVersion(v => v + 1);
      recordAdsUsage(tenantContext, "ads.recommendationApplied");
    },
    [canUpdate, tenantContext]
  );

  const dismissRecommendation = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      adsPlatformAPI.dismissRecommendation(id);
      setRecommendationVersion(v => v + 1);
      recordAdsUsage(tenantContext, "ads.recommendationApplied");
    },
    [canUpdate, tenantContext]
  );

  /** Combines the `campaign:export` permission with the real Entitlement Platform check, then records the usage — the single gate every export call site should go through instead of checking `canExport` alone. */
  const recordExport = useCallback(
    (quantity: number) => {
      if (!canExport || !canUseAdsFeature(tenantContext, "ads.export")) return false;
      recordAdsUsage(tenantContext, "ads.export", quantity);
      trackAdsAction("export");
      return true;
    },
    [canExport, tenantContext]
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- connectorSyncVersion is a manual re-trigger: connector sync mutates the adapter's live-status cache that computeAdsPlatforms() reads, not the campaigns array
  const platforms = useMemo(() => adsPlatformAPI.getPlatforms(campaigns), [campaigns, connectorSyncVersion]);
  const budget = useMemo(() => adsPlatformAPI.getBudget(campaigns), [campaigns]);
  const performance = useMemo(() => adsPlatformAPI.getPerformanceSummary(campaigns), [campaigns]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recommendationVersion is a manual re-trigger for apply/dismiss, which mutate registry state the campaigns array itself doesn't reflect
  const recommendations = useMemo(() => adsPlatformAPI.getRecommendations(campaigns), [campaigns, recommendationVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recommendationVersion/connectorSyncVersion are manual re-triggers for state the health score reads but campaigns doesn't reflect
  const healthScore = useMemo(() => adsPlatformAPI.getHealthScore(campaigns), [campaigns, recommendationVersion, connectorSyncVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recommendationVersion/connectorSyncVersion are manual re-triggers for state the action center reads but campaigns doesn't reflect
  const actionCenterItems = useMemo(() => adsPlatformAPI.getActionCenterItems(campaigns, "30d", tenantContext.organizationId), [campaigns, recommendationVersion, connectorSyncVersion, tenantContext.organizationId]);
  const roasInsight = useMemo(() => adsPlatformAPI.explainRoas(campaigns), [campaigns]);

  const value = useMemo(
    () => ({
      campaigns,
      hydrated,
      platforms,
      budget,
      performance,
      recommendations,
      healthScore,
      actionCenterItems,
      roasInsight,
      tenantContext,
      currentUserName,
      canCreate,
      canUpdate,
      canArchive,
      canDelete,
      canExport,
      recordExport,
      addCampaign,
      updateCampaign,
      actOnCampaigns,
      applyRecommendation,
      dismissRecommendation,
      showToast,
    }),
    [
      campaigns,
      hydrated,
      platforms,
      budget,
      performance,
      recommendations,
      healthScore,
      actionCenterItems,
      roasInsight,
      tenantContext,
      currentUserName,
      canCreate,
      canUpdate,
      canArchive,
      canDelete,
      canExport,
      recordExport,
      addCampaign,
      updateCampaign,
      actOnCampaigns,
      applyRecommendation,
      dismissRecommendation,
      showToast,
    ]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <EmptyState icon={<Lock size={32} />} title="You don't have access to Ads Manager" description="Ask a workspace admin to grant the campaign:read permission." />
      </div>
    );
  }

  return (
    <CampaignContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-success/20 bg-card px-4 py-3 text-sm text-foreground shadow-modal">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) throw new Error("useCampaigns must be used within CampaignProvider");
  return context;
}
