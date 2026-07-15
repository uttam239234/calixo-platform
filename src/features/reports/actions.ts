"use server";

/**
 * Calixo Platform - Reports: Server Actions
 *
 * Real backend enforcement boundary — `reportsPlatformAPI.generateFromTemplate()`
 * used to be called directly from `"use client"` code (`ReportsProvider.tsx`)
 * with only a client-side RBAC permission check and no report-count limit or
 * AI-credit check at all (the AI Report Assistant's generation is credited
 * the same as AI Copilot's). Resolves identity server-side and runs
 * validate -> reserve -> execute -> deduct -> log for real.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { reportsPlatformAPI } from "@/core/reports";
import type { DeliveryMethod, ExportFormat, ReportDataset, ReportDefinition, ReportRecipient, ReportSchedule, ReportSourceId, ScheduleFrequency } from "@/core/reports";

/** No real LLM call backs "AI-generated" report templates in this codebase (same disclosed-simulation standard as `seedOrganizationBilling.ts`'s synthetic usage) — a fixed, modest credit cost, smaller than a full Copilot conversation turn. */
const REPORT_GENERATION_CREDIT_COST = 10;

export interface GenerateReportActionResult {
  ok: boolean;
  report?: ReportDefinition;
  dataset?: ReportDataset;
  error?: string;
  upgradeTarget?: string;
}

export async function generateReportFromTemplateAction(sourceId: ReportSourceId, owner: string): Promise<GenerateReportActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "reports");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Reports isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const countCheck = await entitlementService.canGenerateReport(actor);
  if (!countCheck.allowed) return { ok: false, error: countCheck.message ?? "You've reached this plan's report limit.", upgradeTarget: countCheck.upgradeTarget };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, REPORT_GENERATION_CREDIT_COST, "AI report generation");
  if (!result.allowed || !reservationId) {
    return { ok: false, error: result.message ?? "Out of AI credits. Purchase additional credits or upgrade your plan.", upgradeTarget: result.upgradeTarget };
  }

  try {
    const outcome = await reportsPlatformAPI.generateFromTemplate(sourceId, owner);
    await entitlementService.commitAiCredits(actor, reservationId, REPORT_GENERATION_CREDIT_COST, "AI report generation");
    return { ok: true, report: outcome.report, dataset: outcome.dataset };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong generating that report." };
  }
}

export interface CreateScheduleActionResult {
  ok: boolean;
  schedule?: ReportSchedule;
  error?: string;
  upgradeTarget?: string;
}

/** The real enforcement boundary for `scheduledReports` — stamps a real, verified `organizationId` onto the schedule (so the live scheduler tick, `registerReportSchedulerTick`, can re-check entitlements on every future run, not just at creation time), rather than trusting whatever the client-side form happened to have in scope. */
export async function createReportScheduleAction(params: {
  reportId: string;
  frequency: ScheduleFrequency;
  recipients: ReportRecipient[];
  deliveryMethod?: DeliveryMethod;
  exportFormat?: ExportFormat;
}): Promise<CreateScheduleActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "reports");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Reports isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const limitCheck = await entitlementService.canScheduleReport(actor);
  if (!limitCheck.allowed) return { ok: false, error: limitCheck.message ?? "You've reached this plan's scheduled report limit.", upgradeTarget: limitCheck.upgradeTarget };

  const schedule = reportsPlatformAPI.createSchedule({ ...params, organizationId: actor.organizationId });
  return { ok: true, schedule };
}
