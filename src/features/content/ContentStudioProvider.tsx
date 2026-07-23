"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Lock, X } from "lucide-react";
import {
  CONTENT_ORGANIZATION_ID,
  canUseContentFeature,
  contentPlatformAPI,
  generateSeedHistory,
  initializeContentFoundation,
  logContentError,
  recordContentUsage,
  trackContentAction,
  trackContentTiming,
} from "@/core/content";
import type {
  ContentAction,
  ContentBrief,
  ContentOutputKind,
  CreativeOutputKind,
  GenerationHistoryEntry,
} from "@/core/content";
import { useUser } from "@clerk/nextjs";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { ModuleEmptyState } from "@/components/enterprise/module";
import { editCreativeVariationAction, generateContentAction, generateCreativeAction } from "./actions";

/**
 * The brief's dotted permission names (content.read/content.create/...) consolidate onto the
 * platform's 15-verb vocabulary, same as every other module this session. `"content"` is already
 * a real `ResourceType`, and `permissionName("content", "read"/"create"/"update"/"publish"/
 * "approve")` is already referenced today in `PermissionTemplateRegistry.ts` for existing role
 * templates — no type-system edits needed anywhere this round.
 */
const CONTENT_ACTION_PERMISSIONS = {
  read: permissionName("content", "read"),
  create: permissionName("content", "create"),
  update: permissionName("content", "update"),
  export: permissionName("content", "export"),
  approve: permissionName("content", "approve"),
  publish: permissionName("content", "publish"),
  manage: permissionName("content", "manage"),
} as const;

interface ContentTenantContext {
  organizationId: string;
  userId: string;
}

interface ContentStudioContextValue {
  hydrated: boolean;
  history: GenerationHistoryEntry[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  brandStyleDefaults: ReturnType<typeof contentPlatformAPI.getBrandStyleDefaults>;
  creativeCatalog: ReturnType<typeof contentPlatformAPI.listCreativeCatalog>;
  contentCatalog: ReturnType<typeof contentPlatformAPI.listContentCatalog>;
  tenantContext: ContentTenantContext;
  currentUserName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canApprove: boolean;
  canManage: boolean;
  generateCreative: (brief: ContentBrief, outputId: CreativeOutputKind, variationCount?: number) => Promise<GenerationHistoryEntry | undefined>;
  generateContent: (brief: ContentBrief, outputId: ContentOutputKind) => Promise<GenerationHistoryEntry | undefined>;
  editCreativeVariation: (entryId: string, variationIndex: number, instruction: string) => Promise<GenerationHistoryEntry | undefined>;
  applyAction: (entryId: string, action: ContentAction) => Promise<GenerationHistoryEntry | undefined>;
  localize: (entryId: string, language: string) => GenerationHistoryEntry | undefined;
  saveToAssets: (entryId: string) => boolean;
  submitForApproval: (entryId: string) => boolean;
  refreshHistory: () => void;
  showToast: (message: string, tone?: "success" | "error") => void;
}

const ContentStudioContext = createContext<ContentStudioContextValue | undefined>(undefined);

/**
 * The single Context for Content Studio — no provider architecture existed for this module before
 * this rebuild (every route imported its own mock data or engine directly). Mirrors
 * `BrandMonitoringProvider.tsx` exactly. Mounted once in `dashboard/content/layout.tsx`.
 */
export function ContentStudioProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("brand-calixo");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [permissions, setPermissions] = useState<string[] | null>(null);

  const { identity } = useCalixoIdentity();
  const { user: clerkUser } = useUser();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo<ContentTenantContext>(
    () => ({ organizationId: organizationId ?? CONTENT_ORGANIZATION_ID, userId: identity?.userId ?? "" }),
    [organizationId, identity?.userId]
  );
  const currentUserName = clerkUser?.fullName ?? clerkUser?.firstName ?? "";

  useEffect(() => {
    initializeContentFoundation();
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(contentPlatformAPI.listHistory(tenantContext.organizationId));
  }, [tenantContext.organizationId]);

  useEffect(() => {
    let active = true;
    (async () => {
      contentPlatformAPI.seedHistory(generateSeedHistory(tenantContext.organizationId));
      if (active) refreshHistory();
    })();
    return () => {
      active = false;
    };
  }, [tenantContext.organizationId, refreshHistory]);

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
      // Errors stay up considerably longer than success confirmations — a 3s auto-dismiss on a
      // real failure (e.g. "Out of AI credits") reads as "nothing happened" if the user glances
      // away for even a moment, which is exactly the reported symptom this duration split fixes.
      const id = setTimeout(() => setToast(null), toast.tone === "error" ? 8000 : 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

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
  const canRead = hasPermission(CONTENT_ACTION_PERMISSIONS.read);
  const canCreate = hasPermission(CONTENT_ACTION_PERMISSIONS.create);
  const canUpdate = hasPermission(CONTENT_ACTION_PERMISSIONS.update);
  const canExport = hasPermission(CONTENT_ACTION_PERMISSIONS.export);
  const canApprove = hasPermission(CONTENT_ACTION_PERMISSIONS.approve);
  const canManage = hasPermission(CONTENT_ACTION_PERMISSIONS.manage);

  const showToast = useCallback((message: string, tone: "success" | "error" = "success") => setToast({ message, tone }), []);

  const generateCreative = useCallback(
    async (brief: ContentBrief, outputId: CreativeOutputKind, variationCount?: number) => {
      if (!canCreate) return undefined;
      const startedAt = Date.now();
      try {
        // Real backend enforcement boundary — see `generateCreativeAction`'s doc comment.
        const actionResult = await generateCreativeAction({ ...brief, brandStyleId: brief.brandStyleId ?? selectedBrandId }, outputId, variationCount);
        if (!actionResult.ok || !actionResult.entry) {
          showToast(actionResult.error ?? "Something went wrong generating that creative.", "error");
          return undefined;
        }
        const entry = actionResult.entry;
        recordContentUsage(tenantContext, "content.creativeGeneration");
        if ((entry.variantImageUrls?.length ?? 0) > 0) recordContentUsage(tenantContext, "content.variant");
        trackContentAction("generateCreative");
        trackContentTiming("generation", Date.now() - startedAt);
        refreshHistory();
        showToast(`${entry.outputLabel} generated.`);
        return entry;
      } catch (error) {
        logContentError("Failed to generate creative", error);
        showToast("Something went wrong generating that creative.", "error");
        return undefined;
      }
    },
    [canCreate, selectedBrandId, tenantContext, refreshHistory, showToast]
  );

  const editCreativeVariation = useCallback(
    async (entryId: string, variationIndex: number, instruction: string) => {
      if (!canUpdate) return undefined;
      try {
        const actionResult = await editCreativeVariationAction(entryId, variationIndex, instruction);
        if (!actionResult.ok || !actionResult.entry) {
          showToast(actionResult.error ?? "Something went wrong applying that change.", "error");
          return undefined;
        }
        trackContentAction("editCreativeVariation");
        refreshHistory();
        return actionResult.entry;
      } catch (error) {
        logContentError("Failed to edit creative variation", error);
        showToast("Something went wrong applying that change.", "error");
        return undefined;
      }
    },
    [canUpdate, refreshHistory, showToast]
  );

  const generateContent = useCallback(
    async (brief: ContentBrief, outputId: ContentOutputKind) => {
      if (!canCreate) return undefined;
      const startedAt = Date.now();
      try {
        // Real backend enforcement boundary — see `generateContentAction`'s doc comment.
        const actionResult = await generateContentAction({ ...brief, brandStyleId: brief.brandStyleId ?? selectedBrandId }, outputId);
        if (!actionResult.ok || !actionResult.entry) {
          showToast(actionResult.error ?? "Something went wrong generating that content.", "error");
          return undefined;
        }
        const entry = actionResult.entry;
        recordContentUsage(tenantContext, "content.contentGeneration");
        if ((entry.textVariants?.length ?? 0) > 0) recordContentUsage(tenantContext, "content.variant");
        trackContentAction("generateContent");
        trackContentTiming("generation", Date.now() - startedAt);
        refreshHistory();
        showToast(`${entry.outputLabel} generated.`);
        return entry;
      } catch (error) {
        logContentError("Failed to generate content", error);
        showToast("Something went wrong generating that content.", "error");
        return undefined;
      }
    },
    [canCreate, selectedBrandId, tenantContext, refreshHistory, showToast]
  );

  const applyAction = useCallback(
    async (entryId: string, action: ContentAction) => {
      if (!canUpdate) return undefined;
      try {
        const entry = await contentPlatformAPI.applyContentAction(entryId, action);
        if (action === "translate") recordContentUsage(tenantContext, "content.translation");
        trackContentAction(`action.${action}`);
        refreshHistory();
        return entry;
      } catch (error) {
        logContentError(`Failed to apply action ${action}`, error);
        return undefined;
      }
    },
    [canUpdate, tenantContext, refreshHistory]
  );

  const localize = useCallback(
    (entryId: string, language: string) => {
      if (!canUpdate) return undefined;
      const entry = contentPlatformAPI.localizeEntry(entryId, language);
      recordContentUsage(tenantContext, "content.translation");
      trackContentAction("localize");
      refreshHistory();
      return entry;
    },
    [canUpdate, tenantContext, refreshHistory]
  );

  const saveToAssets = useCallback(
    (entryId: string) => {
      if (!canExport || !canUseContentFeature(tenantContext, "content.export")) return false;
      const startedAt = Date.now();
      const assetId = contentPlatformAPI.saveToAssets(entryId, tenantContext.organizationId, currentUserName);
      if (!assetId) return false;
      recordContentUsage(tenantContext, "content.export");
      trackContentAction("saveToAssets");
      trackContentTiming("export", Date.now() - startedAt);
      refreshHistory();
      showToast("Saved to Assets.");
      return true;
    },
    [canExport, tenantContext, currentUserName, refreshHistory, showToast]
  );

  const submitForApproval = useCallback(
    (entryId: string) => {
      if (!canApprove) return false;
      const startedAt = Date.now();
      const workflowId = contentPlatformAPI.submitForApproval(entryId, currentUserName);
      if (!workflowId) return false;
      trackContentAction("submitForApproval");
      trackContentTiming("approval", Date.now() - startedAt);
      refreshHistory();
      showToast("Submitted for approval.");
      return true;
    },
    [canApprove, currentUserName, refreshHistory, showToast]
  );

  const creativeCatalog = useMemo(() => contentPlatformAPI.listCreativeCatalog(), []);
  const contentCatalog = useMemo(() => contentPlatformAPI.listContentCatalog(), []);
  const brandStyleDefaults = useMemo(() => contentPlatformAPI.getBrandStyleDefaults(selectedBrandId), [selectedBrandId]);

  const value = useMemo<ContentStudioContextValue>(
    () => ({
      hydrated,
      history,
      selectedBrandId,
      setSelectedBrandId,
      brandStyleDefaults,
      creativeCatalog,
      contentCatalog,
      tenantContext,
      currentUserName,
      canRead,
      canCreate,
      canUpdate,
      canExport,
      canApprove,
      canManage,
      generateCreative,
      generateContent,
      editCreativeVariation,
      applyAction,
      localize,
      saveToAssets,
      submitForApproval,
      refreshHistory,
      showToast,
    }),
    [
      hydrated,
      history,
      selectedBrandId,
      brandStyleDefaults,
      creativeCatalog,
      contentCatalog,
      tenantContext,
      currentUserName,
      canRead,
      canCreate,
      canUpdate,
      canExport,
      canApprove,
      canManage,
      generateCreative,
      generateContent,
      editCreativeVariation,
      applyAction,
      localize,
      saveToAssets,
      submitForApproval,
      refreshHistory,
      showToast,
    ]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Content Studio" description="Ask a workspace admin to grant the content:read permission." />
      </div>
    );
  }

  return (
    <ContentStudioContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role={toast.tone === "error" ? "alert" : "status"}
          className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-foreground shadow-2xl ${
            toast.tone === "error" ? "border-destructive/30 bg-destructive/5" : "border-success/20 bg-card"
          }`}
        >
          {toast.tone === "error" ? <AlertTriangle size={18} className="text-destructive shrink-0" /> : <CheckCircle2 size={18} className="text-success shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 shrink-0 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </ContentStudioContext.Provider>
  );
}

export function useContentStudio() {
  const context = useContext(ContentStudioContext);
  if (!context) throw new Error("useContentStudio must be used within ContentStudioProvider");
  return context;
}
