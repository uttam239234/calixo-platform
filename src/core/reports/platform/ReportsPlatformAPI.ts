/**
 * Calixo Platform - Reports Platform API
 *
 * The sanctioned entry point for the Reports UI — the AI Report Assistant,
 * template generation, execution, export, and scheduling all route
 * through here rather than a component/hook importing an engine directly.
 * Report/session CRUD (`useReports`, `useReportBuilder`, etc.) already
 * followed a real "hooks-only-call-engines" discipline before this round
 * and is left as-is; this facade covers what's genuinely new: AI
 * orchestration, Execution Platform-routed generation, and Notification
 * Platform-routed delivery.
 */
import { reportRegistry } from "../registry/ReportRegistry";
import { reportEngine } from "../engine/ReportEngine";
import { reportAssistantEngine } from "../engine/ReportAssistantEngine";
import { buildSourceReport, SOURCE_TEMPLATE_LIST } from "../templates/sourceTemplates";
import { exportEngine } from "../export/ExportEngine";
import { reportScheduler } from "../scheduler/ReportScheduler";
import { executionPlatformAPI } from "@/core/platform/execution/ExecutionPlatformAPI";
import { notificationsPlatformAPI } from "@/communication/platform/NotificationsPlatformAPI";
import { teamRegistry, usersPlatformAPI } from "@/core/users";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type {
  AssistantQuestionId,
  AssistantSession,
  ExportFormat,
  ExportRecord,
  ReportCategory,
  ReportDataset,
  ReportDefinition,
  ReportExecutionRecord,
  ReportSchedule,
  ReportSourceId,
} from "../types";
import type { ReportSummary } from "@/core/platform/contracts";
import type { ExecutionRecord } from "@/core/platform/execution/types";

export interface ReportsTenantContext {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
}

export class ReportsPlatformAPI {
  listReportSummaries(params: { module?: ModuleCategory; category?: ReportCategory } = {}): ReportSummary[] {
    return reportRegistry.list(params).map(r => ({ id: r.id, name: r.name, category: r.category, lastRunAt: undefined }));
  }

  listSourceTemplates(): { sourceId: ReportSourceId; name: string; description: string }[] {
    return SOURCE_TEMPLATE_LIST;
  }

  /** One-click Beginner Mode generation — builds via the real `ReportBuilder`, registers, and runs it. */
  async generateFromTemplate(sourceId: ReportSourceId, owner: string): Promise<{ report: ReportDefinition; dataset?: ReportDataset }> {
    const report = buildSourceReport(sourceId, owner);
    reportRegistry.register(report);
    const { dataset } = await reportEngine.execute(report.id);
    return { report, dataset };
  }

  // --- AI Report Assistant ---

  createAssistantSession(message: string): AssistantSession {
    return reportAssistantEngine.createSession(message);
  }

  nextAssistantQuestion(session: AssistantSession) {
    return reportAssistantEngine.nextQuestion(session);
  }

  answerAssistantQuestion(session: AssistantSession, questionId: AssistantQuestionId, optionId: string, optionLabel: string): AssistantSession {
    return reportAssistantEngine.answer(session, questionId, optionId, optionLabel);
  }

  async resolveAssistantSession(session: AssistantSession, owner: string) {
    return reportAssistantEngine.resolve(session, owner);
  }

  // --- Execution ---

  /** Runs a report inline — used for the "Live Reporting" re-execute-on-open path where a result is needed immediately. */
  async runReport(reportId: string, filters?: Parameters<typeof reportEngine.execute>[1]): Promise<{ record: ReportExecutionRecord; dataset?: ReportDataset }> {
    return reportEngine.execute(reportId, filters);
  }

  /** Routes report generation through the sanctioned Execution Platform — "never create internal schedulers." Used for the Report Builder's "Generate" action, which doesn't need the result back synchronously. */
  async submitGeneration(reportId: string, tenant: ReportsTenantContext): Promise<ExecutionRecord> {
    return executionPlatformAPI.submit({
      name: `Generate report ${reportId}`,
      worker: "report-generation",
      payload: { reportId },
      kind: "immediate",
      organizationId: tenant.organizationId,
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
    });
  }

  // --- Export ---

  requestExport(reportId: string, format: ExportFormat, requestedBy: string): ExportRecord {
    return exportEngine.requestExport({ reportId, format, requestedBy });
  }

  // --- Scheduling ---

  createSchedule(params: Parameters<typeof reportScheduler.create>[0]): ReportSchedule {
    return reportScheduler.create(params);
  }

  /** Real users/teams for the schedule recipient picker — routed through the sanctioned Users facade rather than a page reaching into `teamRegistry`/`userRegistry` directly. */
  listRecipientOptions(workspaceId?: string): { users: { id: string; label: string }[]; teams: { id: string; label: string }[] } {
    return {
      users: usersPlatformAPI.listUserSummaries(workspaceId).map(u => ({ id: u.id, label: u.displayName })),
      teams: teamRegistry.list(workspaceId ? { workspaceId } : {}).map(t => ({ id: t.id, label: t.name })),
    };
  }

  /**
   * Delivers a scheduled report via the real Notification Platform. Real,
   * in-app notification + audit entry for every "user"/"team" recipient
   * (teams expand to their real member list). "email" (external)
   * recipients have no real system user to notify — honestly counted as
   * "would be emailed" rather than a fabricated send, since real outbound
   * email is a platform-wide, pre-existing architecture-only gap
   * (`DeliveryEngine.sendEmail` is an explicit framework placeholder).
   */
  async sendScheduledDelivery(schedule: ReportSchedule, tenant: ReportsTenantContext): Promise<{ notified: number; externalPending: number }> {
    const report = reportRegistry.lookup(schedule.reportId);
    const title = `Report ready: ${report?.name ?? schedule.reportId}`;
    const body = `Your ${schedule.frequency} report is ready to view.`;

    let notified = 0;
    let externalPending = 0;

    for (const recipient of schedule.recipients) {
      if (recipient.type === "user") {
        await notificationsPlatformAPI.send({ userId: recipient.id, organizationId: tenant.organizationId, title, body, category: "info", priority: "normal", channel: schedule.deliveryMethod === "email" ? "email" : "in_app", source: "reports" });
        notified += 1;
      } else if (recipient.type === "team") {
        const team = teamRegistry.lookup(recipient.id);
        for (const memberId of team?.memberIds ?? []) {
          await notificationsPlatformAPI.send({ userId: memberId, organizationId: tenant.organizationId, title, body, category: "info", priority: "normal", channel: schedule.deliveryMethod === "email" ? "email" : "in_app", source: "reports" });
          notified += 1;
        }
      } else {
        externalPending += 1;
      }
    }

    return { notified, externalPending };
  }
}

export const reportsPlatformAPI = new ReportsPlatformAPI();
