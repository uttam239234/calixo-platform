"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import {
  initializeReportsFoundation,
  reportRegistry,
  seedReportsPlatformMockData,
  registerReportSkills,
  recordReportsUsage,
  trackReportsAction,
  trackReportsTiming,
  logReportsError,
  REPORTS_ORGANIZATION_ID,
  REPORTS_WORKSPACE_ID,
} from "@/core/reports";
import type { ReportDataset, ReportDefinition, ReportSourceId } from "@/core/reports";
import { useUser } from "@clerk/nextjs";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { ModuleEmptyState } from "@/components/enterprise/module";
import { generateReportFromTemplateAction } from "./actions";

/**
 * The brief's dotted permission names (report.view/create/export/manage) consolidate onto the
 * platform's 15-verb vocabulary, same as every other module this session. `"report"` (singular)
 * is already a real `ResourceType`, already referenced in `PermissionTemplateRegistry.ts` for
 * existing role templates — no type-system edits needed.
 */
const REPORT_ACTION_PERMISSIONS = {
  read: permissionName("report", "read"),
  create: permissionName("report", "create"),
  export: permissionName("report", "export"),
  manage: permissionName("report", "manage"),
} as const;

export type ReportsMode = "beginner" | "advanced";

interface ReportsTenantContext {
  organizationId: string;
  workspaceId: string;
  userId: string;
}

interface ReportsContextValue {
  hydrated: boolean;
  mode: ReportsMode;
  toggleMode: () => void;
  tenantContext: ReportsTenantContext;
  currentUserName: string;
  canRead: boolean;
  canCreate: boolean;
  canExport: boolean;
  canManage: boolean;
  generateFromTemplate: (sourceId: ReportSourceId) => Promise<{ report: ReportDefinition; dataset?: ReportDataset; aiSummary?: string } | undefined>;
  recordExport: () => void;
  recordSchedule: () => void;
  recordAiGenerated: () => void;
  recordReportCreated: () => void;
  showToast: (message: string) => void;
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

/**
 * The single Context for Reports — this module previously had no provider
 * (the bootstrap ran inline in `page.tsx`, hooks called engines with no
 * tenant/permission context). Mirrors `ContentStudioProvider.tsx`/
 * `CopilotProvider.tsx`. Mounted once in `dashboard/reports/layout.tsx`.
 */
export function ReportsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ReportsMode>("beginner");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [permissions, setPermissions] = useState<string[] | null>(null);

  const { identity } = useCalixoIdentity();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo<ReportsTenantContext>(
    () => ({ organizationId: organizationId ?? REPORTS_ORGANIZATION_ID, workspaceId: REPORTS_WORKSPACE_ID, userId: identity?.userId ?? "" }),
    [organizationId, identity?.userId]
  );
  const { user: clerkUser } = useUser();
  const currentUserName = clerkUser?.fullName ?? clerkUser?.firstName ?? "";

  useEffect(() => {
    if (reportRegistry.count() === 0) {
      initializeReportsFoundation();
      seedReportsPlatformMockData();
    }
    registerReportSkills();
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

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3000);
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
  const canRead = hasPermission(REPORT_ACTION_PERMISSIONS.read);
  const canCreate = hasPermission(REPORT_ACTION_PERMISSIONS.create);
  const canExport = hasPermission(REPORT_ACTION_PERMISSIONS.export);
  const canManage = hasPermission(REPORT_ACTION_PERMISSIONS.manage);

  const showToast = useCallback((message: string) => setToast(message), []);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === "beginner" ? "advanced" : "beginner"));
  }, []);

  const generateFromTemplate = useCallback(
    async (sourceId: ReportSourceId) => {
      if (!canCreate) {
        showToast("You don't have permission to create reports.");
        return undefined;
      }
      const startedAt = Date.now();
      try {
        // Real backend enforcement boundary — see `generateReportFromTemplateAction`'s
        // doc comment. Never calls `reportsPlatformAPI.generateFromTemplate()` directly.
        const actionResult = await generateReportFromTemplateAction(sourceId, currentUserName);
        if (!actionResult.ok || !actionResult.report) {
          showToast(actionResult.error ?? "Something went wrong generating that report.");
          return undefined;
        }
        const result = { report: actionResult.report, dataset: actionResult.dataset, aiSummary: actionResult.aiSummary };
        recordReportsUsage(tenantContext, "reports.reportCreated");
        recordReportsUsage(tenantContext, "reports.aiGenerated");
        trackReportsAction("generateFromTemplate");
        trackReportsTiming("generation", Date.now() - startedAt);
        showToast(`${result.report.name} generated.`);
        return result;
      } catch (error) {
        logReportsError("Failed to generate report from template", error);
        showToast("Something went wrong generating that report.");
        return undefined;
      }
    },
    [canCreate, currentUserName, tenantContext, showToast]
  );

  const recordExport = useCallback(() => {
    recordReportsUsage(tenantContext, "reports.export");
    trackReportsAction("export");
  }, [tenantContext]);

  const recordSchedule = useCallback(() => {
    recordReportsUsage(tenantContext, "reports.schedule");
    trackReportsAction("createSchedule");
  }, [tenantContext]);

  const recordAiGenerated = useCallback(() => {
    recordReportsUsage(tenantContext, "reports.aiGenerated");
    trackReportsAction("aiAssistantGenerate");
  }, [tenantContext]);

  const recordReportCreated = useCallback(() => {
    recordReportsUsage(tenantContext, "reports.reportCreated");
    trackReportsAction("reportCreated");
  }, [tenantContext]);

  const value = useMemo<ReportsContextValue>(
    () => ({
      hydrated,
      mode,
      toggleMode,
      tenantContext,
      currentUserName,
      canRead,
      canCreate,
      canExport,
      canManage,
      generateFromTemplate,
      recordExport,
      recordSchedule,
      recordAiGenerated,
      recordReportCreated,
      showToast,
    }),
    [
      hydrated,
      mode,
      toggleMode,
      tenantContext,
      currentUserName,
      canRead,
      canCreate,
      canExport,
      canManage,
      generateFromTemplate,
      recordExport,
      recordSchedule,
      recordAiGenerated,
      recordReportCreated,
      showToast,
    ]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Reports" description="Ask a workspace admin to grant the report:read permission." />
      </div>
    );
  }

  return (
    <ReportsContext.Provider value={value}>
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
    </ReportsContext.Provider>
  );
}

export function useReportsContext() {
  const context = useContext(ReportsContext);
  if (!context) throw new Error("useReportsContext must be used within ReportsProvider");
  return context;
}
