"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import {
  initializeCopilotFoundation,
  copilotPlatformAPI,
  recordCopilotUsage,
  trackCopilotAction,
  trackCopilotTiming,
  trackClarificationCount,
  estimateTokens,
  logCopilotError,
  COPILOT_ORGANIZATION_ID,
  COPILOT_CURRENT_USER_ID,
  COPILOT_WORKSPACE_ID,
} from "@/core/copilot";
import type { ExecutionStep, OrganizationPreferences, SendMessageOutcome } from "@/core/copilot";
import { useUser } from "@/identity/hooks/useAuth";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { ModuleEmptyState } from "@/components/enterprise/module";

import { registerAnalyticsSkills } from "@/core/analytics";
import { registerReportSkills } from "@/core/reports";
import { registerDashboardSkills } from "@/core/dashboard";
import { registerUsersSkills } from "@/core/users";
import { registerSettingsSkills } from "@/core/settings";
import { registerAdsSkills } from "@/core/ads";
import { registerSocialSkills } from "@/core/social";
import { registerBrandSkills } from "@/core/brand";
import { registerReputationSkills } from "@/core/reputation";
import { registerContentSkills } from "@/core/content";
import { registerWorkflowSkills } from "@/core/workflow";

/**
 * The brief's dotted permission names (ai.read/ai.execute/...) consolidate onto the platform's
 * 15-verb vocabulary, same as every other module this session. `"ai"` is already a real
 * `ResourceType`, tied into `AuthorizationPlatformAPI`'s real AI-credit subscription gate.
 */
const COPILOT_ACTION_PERMISSIONS = {
  read: permissionName("ai", "read"),
  execute: permissionName("ai", "execute"),
  approve: permissionName("ai", "approve"),
  manage: permissionName("ai", "manage"),
} as const;

export type CopilotMode = "beginner" | "power-user";

interface CopilotTenantContext {
  organizationId: string;
  workspaceId: string;
  userId: string;
}

interface CopilotContextValue {
  hydrated: boolean;
  mode: CopilotMode;
  toggleMode: () => void;
  tenantContext: CopilotTenantContext;
  currentUserName: string;
  canRead: boolean;
  canExecute: boolean;
  canApprove: boolean;
  canManage: boolean;
  orgPreferences: OrganizationPreferences;
  updateOrgPreferences: (patch: Partial<OrganizationPreferences>) => Promise<void>;
  recordMessageOutcome: (requestText: string, outcome: SendMessageOutcome, elapsedMs: number) => void;
  approveStep: (step: ExecutionStep) => Promise<{ responseText: string } | undefined>;
  rejectStep: (step: ExecutionStep) => { responseText: string } | undefined;
  showToast: (message: string) => void;
}

const CopilotContext = createContext<CopilotContextValue | undefined>(undefined);

/**
 * The single Context for AI Copilot — this module had no provider before this rebuild (state
 * lived in 4 standalone hooks with a hardcoded demo workspace/user). Mirrors
 * `ContentStudioProvider.tsx`'s shape: real tenant context, permission-gated actions,
 * `ModuleEmptyState` on denied read access. On mount, proactively registers every module's AI
 * skills (not just the one whose page happens to have been visited this session) so Copilot can
 * route to any of the 7 specialist agents immediately, from a cold session.
 */
export function CopilotProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CopilotMode>("beginner");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [orgPreferences, setOrgPreferences] = useState<OrganizationPreferences>({});

  const sessionUser = useUser();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo<CopilotTenantContext>(
    () => ({ organizationId: organizationId ?? COPILOT_ORGANIZATION_ID, workspaceId: COPILOT_WORKSPACE_ID, userId: sessionUser?.id ?? COPILOT_CURRENT_USER_ID }),
    [organizationId, sessionUser?.id]
  );
  const currentUserName = sessionUser?.name ?? "Aarav Mehta";

  useEffect(() => {
    initializeCopilotFoundation();
    registerAnalyticsSkills();
    registerReportSkills();
    registerDashboardSkills();
    registerUsersSkills();
    registerSettingsSkills();
    registerAdsSkills();
    registerSocialSkills();
    registerBrandSkills();
    registerReputationSkills();
    registerContentSkills();
    registerWorkflowSkills();
  }, []);

  useEffect(() => {
    let active = true;
    copilotPlatformAPI.getOrgPreferences(tenantContext.organizationId).then(prefs => {
      if (active) setOrgPreferences(prefs);
    });
    return () => {
      active = false;
    };
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

  /** `null` = no gating (unauthenticated demo default, unchanged behavior). */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sessionUser) {
        if (!cancelled) setPermissions(null);
        return;
      }
      await initializePlatformFoundation();
      const effective = await authorizationPlatformAPI.getEffectivePermissions(sessionUser.id, organizationId ?? undefined);
      if (!cancelled) setPermissions(effective);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionUser, organizationId]);

  const hasPermission = useCallback((permission: string) => !permissions || permissions.includes(permission), [permissions]);
  const canRead = hasPermission(COPILOT_ACTION_PERMISSIONS.read);
  const canExecute = hasPermission(COPILOT_ACTION_PERMISSIONS.execute);
  const canApprove = hasPermission(COPILOT_ACTION_PERMISSIONS.approve);
  const canManage = hasPermission(COPILOT_ACTION_PERMISSIONS.manage);

  const showToast = useCallback((message: string) => setToast(message), []);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === "beginner" ? "power-user" : "beginner"));
  }, []);

  const updateOrgPreferences = useCallback(
    async (patch: Partial<OrganizationPreferences>) => {
      if (!canManage) return;
      const next = await copilotPlatformAPI.updateOrgPreferences(tenantContext.organizationId, patch);
      setOrgPreferences(next);
    },
    [canManage, tenantContext.organizationId]
  );

  const recordMessageOutcome = useCallback(
    (requestText: string, outcome: SendMessageOutcome, elapsedMs: number) => {
      recordCopilotUsage(tenantContext, "copilot.aiRequest");
      recordCopilotUsage(tenantContext, "copilot.tokensEstimated", estimateTokens(requestText) + estimateTokens(outcome.responseText));
      if (outcome.tasks.length > 0) recordCopilotUsage(tenantContext, "copilot.actionExecuted", outcome.tasks.length);
      trackCopilotAction("sendMessage");
      trackCopilotTiming("response", elapsedMs);
      trackClarificationCount(outcome.awaitingClarification ? 1 : 0);
    },
    [tenantContext]
  );

  const approveStep = useCallback(
    async (step: ExecutionStep) => {
      if (!canApprove) {
        showToast("You don't have permission to approve this action.");
        return undefined;
      }
      const startedAt = Date.now();
      try {
        const { responseText } = await copilotPlatformAPI.approveStep(step, currentUserName);
        recordCopilotUsage(tenantContext, "copilot.actionExecuted");
        trackCopilotAction("approveStep");
        trackCopilotTiming("approval", Date.now() - startedAt);
        return { responseText };
      } catch (error) {
        logCopilotError("Failed to approve step", error);
        showToast("Something went wrong approving that.");
        return undefined;
      }
    },
    [canApprove, currentUserName, tenantContext, showToast]
  );

  const rejectStep = useCallback(
    (step: ExecutionStep) => {
      if (!canApprove) {
        showToast("You don't have permission to reject this action.");
        return undefined;
      }
      trackCopilotAction("rejectStep");
      return copilotPlatformAPI.rejectStep(step);
    },
    [canApprove, showToast]
  );

  const value = useMemo<CopilotContextValue>(
    () => ({
      hydrated,
      mode,
      toggleMode,
      tenantContext,
      currentUserName,
      canRead,
      canExecute,
      canApprove,
      canManage,
      orgPreferences,
      updateOrgPreferences,
      recordMessageOutcome,
      approveStep,
      rejectStep,
      showToast,
    }),
    [hydrated, mode, toggleMode, tenantContext, currentUserName, canRead, canExecute, canApprove, canManage, orgPreferences, updateOrgPreferences, recordMessageOutcome, approveStep, rejectStep, showToast]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to AI Copilot" description="Ask a workspace admin to grant the ai:read permission." />
      </div>
    );
  }

  return (
    <CopilotContext.Provider value={value}>
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
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  const context = useContext(CopilotContext);
  if (!context) throw new Error("useCopilot must be used within CopilotProvider");
  return context;
}
