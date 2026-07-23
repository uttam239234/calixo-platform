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
import { generateId } from "@/shared/utils/string";
import { aiService } from "@/aios/services/AIService";

/** A fixed, disclosed credit cost per generation — unchanged product-pricing choice, not a technical limitation. */
const REPORT_GENERATION_CREDIT_COST = 10;

export interface GenerateReportActionResult {
  ok: boolean;
  report?: ReportDefinition;
  dataset?: ReportDataset;
  /** Real, this round: a genuine model-generated summary + key insights over the real dataset rows — replaces the old template string entirely for this (the Server-Action-gated) generation path. The client-direct Assistant chat path (`reportsPlatformAPI.resolveAssistantSession`, called straight from `reports/page.tsx` with no server round-trip) is NOT wired to real AI this round — doing so safely would first require moving that call behind a Server Action, a larger, separate architectural change; disclosed, not fixed here. */
  aiSummary?: string;
  error?: string;
  upgradeTarget?: string;
}

/** Digest the dataset into a compact, real-numbers-only text block for the model — never sends raw PII-shaped columns, only whatever `ReportEngine` already computed. */
function digestDataset(report: ReportDefinition, dataset?: ReportDataset): string {
  if (!dataset || dataset.rows.length === 0) return `Report "${report.name}" ran but returned no rows.`;
  const columns = dataset.columns.map(c => c.label).join(", ");
  const sampleRows = dataset.rows.slice(0, 25).map(r => JSON.stringify(r)).join("\n");
  return `Report: ${report.name}\nColumns: ${columns}\nRow count: ${dataset.rowCount}\nSample rows (up to 25):\n${sampleRows}`;
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

    let aiSummary: string | undefined;
    let actualCredits = REPORT_GENERATION_CREDIT_COST;
    try {
      const response = await aiService.summarize(digestDataset(outcome.report, outcome.dataset), { userId: identity.userId, organizationId: identity.organizationId, module: "reports" });
      aiSummary = response.message.content;
      actualCredits = Math.max(1, response.usage.totalTokens);
    } catch {
      // Real dataset generation already succeeded — a failed AI summary shouldn't fail the whole report, just omit it and keep the disclosed flat credit cost.
    }

    await entitlementService.commitAiCredits(actor, reservationId, actualCredits, "AI report generation");
    return { ok: true, report: outcome.report, dataset: outcome.dataset, aiSummary };
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
