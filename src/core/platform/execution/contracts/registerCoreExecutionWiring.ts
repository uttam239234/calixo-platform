/**
 * Calixo Platform - Core Execution Wiring
 *
 * The one file allowed to import multiple modules purely to register real
 * workers against them (mirrors Phase 6's `registerCoreContracts.ts`
 * convention). Fixes three concrete, previously-dormant pipelines found by
 * the Enterprise Execution Audit:
 *
 * 1. `background`'s default 'workflow' worker was a stub that only logged —
 *    it never called the real `workflowEngine.executeWorkflow()`.
 * 2. `ReportScheduler` stored `nextRunAt` but nothing ever checked it — "it
 *    never actually triggers a report run or delivery" (its own header
 *    comment). This registers a real recurring tick that does.
 * 3. Communication's `DeliveryEngine.deliver()` enqueued a 'notification'
 *    job but nothing was ever registered to process it — `processDelivery`
 *    was dead code reachable only from tests.
 *
 * Also registers two genuinely real Execution Types (workflow, report tick,
 * AI embedding) and several honestly-declared readiness-only ones (asset
 * processing) — see `isReal` on each definition.
 */
import { workerRegistry } from "@/background/workers/WorkerRegistry";
import { eventBus } from "@/background/events/EventBus";
import type { WorkerHandler } from "@/background/types";
import { workflowEngine as backgroundWorkflowEngine } from "@/background/workflow/WorkflowEngine";
import { deliveryEngine } from "@/communication";
import { reportScheduler, reportEngine, exportEngine } from "@/core/reports";
import { knowledgeEngine } from "@/aios";
import { executionRegistry } from "../ExecutionRegistry";
import { schedulerPlatformAPI } from "../SchedulerPlatformAPI";
import type { ExecutionTypeDefinition } from "../types";

let registered = false;

export function registerCoreExecutionWiring(): void {
  if (registered) return;
  registered = true;

  registerWorkflowWorker();
  registerNotificationWorker();
  registerReportSchedulerTick();
  registerAiEmbeddingWorker();
  registerReadinessOnlyTypes();
}

function registerWorkflowWorker(): void {
  const handler: WorkerHandler = async job => {
    const { workflowId, input } = job.payload as { workflowId: string; input?: Record<string, unknown> };
    if (!workflowId) return { success: false, error: { message: "workflowId is required", category: "validation", timestamp: new Date().toISOString() } };

    const execution = await backgroundWorkflowEngine.executeWorkflow(workflowId, input ?? {}, {
      organizationId: job.organizationId,
      workspaceId: job.workspaceId,
      userId: job.userId,
    });
    return execution.status === "failed"
      ? { success: false, error: execution.error }
      : { success: true, data: { executionId: execution.id, output: execution.output } };
  };
  workerRegistry.register(
    { name: "workflow", description: "Executes a background Workflow (triggers/conditions/actions) via the real WorkflowEngine.", module: "workflow", version: "1.0.0", concurrency: 5, maxRetries: 3, timeout: 60_000, handles: ["immediate", "scheduled"], isActive: true },
    handler
  );
  executionRegistry.register({ id: "workflow.execute", name: "Execute Workflow", description: "Runs a Workflow's conditions/actions to completion.", kind: "queued", worker: "workflow", defaultPriority: "medium", defaultTimeoutMs: 60_000, defaultMaxRetries: 3, tags: ["workflow", "automation"], owner: "platform-team", isReal: true });
}

function registerNotificationWorker(): void {
  const handler: WorkerHandler = async job => {
    const { notificationId, deliveryId, channel } = job.payload as { notificationId: string; deliveryId: string; channel: import("@/communication").NotificationChannel };
    const success = await deliveryEngine.processDelivery(notificationId, deliveryId, channel);
    return success ? { success: true, data: { deliveryId } } : { success: false, error: { message: "Channel delivery returned false", category: "transient", timestamp: new Date().toISOString() } };
  };
  workerRegistry.register(
    { name: "notification", description: "Delivers a queued notification to its channel via the real DeliveryEngine.", module: "communication", version: "1.0.0", concurrency: 10, maxRetries: 3, timeout: 30_000, handles: ["immediate"], isActive: true },
    handler
  );
  executionRegistry.register({ id: "notification.deliver", name: "Deliver Notification", description: "Sends a notification to its configured channel.", kind: "immediate", worker: "notification", defaultPriority: "high", defaultTimeoutMs: 30_000, defaultMaxRetries: 3, tags: ["notification"], owner: "platform-team", isReal: true });
}

/** Recurring tick (5-minute default cadence — `custom` frequency) that finally makes `ReportScheduler`'s stored `nextRunAt` real: generates due reports, requests their export, advances the schedule, and fires the already-defined-but-never-published `report.generated` event that Communication's `report_notifier` handler has been waiting on since it was registered. */
function registerReportSchedulerTick(): void {
  const handler: WorkerHandler = async () => {
    const now = new Date().toISOString();
    const due = reportScheduler.list({ active: true }).filter(s => s.nextRunAt && s.nextRunAt <= now);

    for (const schedule of due) {
      const { record } = await reportEngine.execute(schedule.reportId);
      if (record.status === "completed") {
        exportEngine.requestExport({ reportId: schedule.reportId, format: schedule.exportFormat, requestedBy: "system:report-scheduler" });
        await eventBus.publish({ type: "report.generated", source: "reports", data: { reportId: schedule.reportId, scheduleId: schedule.id }, status: "pending" });
      }
      // Re-passing the same frequency recomputes nextRunAt via ReportScheduler's own update() — no new method needed.
      reportScheduler.update(schedule.id, { frequency: schedule.frequency });
    }

    return { success: true, data: { checked: due.length } };
  };

  workerRegistry.register(
    { name: "report-scheduler-tick", description: "Checks ReportScheduler for due schedules and runs them.", module: "reports", version: "1.0.0", concurrency: 1, maxRetries: 1, timeout: 60_000, handles: ["scheduled"], isActive: true },
    handler
  );
  executionRegistry.register({ id: "report.scheduled-run", name: "Scheduled Report Run", description: "Generates and exports a due scheduled report.", kind: "recurring", worker: "report-scheduler-tick", defaultPriority: "low", defaultTimeoutMs: 60_000, defaultMaxRetries: 1, tags: ["reports", "automation"], owner: "platform-team", isReal: true });

  void schedulerPlatformAPI.createSchedule({
    name: "report-scheduler-tick",
    frequency: "custom",
    worker: "report-scheduler-tick",
    payload: {},
    isActive: true,
  });
}

/** Real — calls AIOS's `knowledgeEngine.generateEmbedding()` (a real `aiGateway.embed()` call with a hash-based fallback), queued rather than run inline so a large embedding batch doesn't block a request. */
function registerAiEmbeddingWorker(): void {
  const handler: WorkerHandler = async job => {
    const { text } = job.payload as { text: string };
    if (!text) return { success: false, error: { message: "text is required", category: "validation", timestamp: new Date().toISOString() } };
    const embedding = await knowledgeEngine.generateEmbedding(text);
    return { success: true, data: { dimensions: embedding.length } };
  };
  workerRegistry.register(
    { name: "ai-embedding", description: "Generates a text embedding via AIOS's KnowledgeEngine.", module: "aios", version: "1.0.0", concurrency: 3, maxRetries: 2, timeout: 30_000, handles: ["immediate", "batch"], isActive: true },
    handler
  );
  executionRegistry.register({ id: "ai.embedding.generate", name: "Generate Embedding", description: "Generates a vector embedding for a text chunk.", kind: "queued", worker: "ai-embedding", defaultPriority: "medium", defaultTimeoutMs: 30_000, defaultMaxRetries: 2, tags: ["ai"], owner: "platform-team", isReal: true });
}

/** Declared, not implemented — no real image/video/transcoding pipeline exists anywhere in this codebase yet (Phase 5's media providers are single-call mock/OpenAI wrappers, not queued processing). Registered so Documentation/Monitoring can list them honestly instead of silently omitting them. */
function registerReadinessOnlyTypes(): void {
  const readiness: ExecutionTypeDefinition[] = [
    { id: "asset.image.process", name: "Process Image", description: "Resize/compress/optimize an uploaded image. Readiness only — no processing pipeline exists yet.", kind: "queued", worker: "asset", defaultPriority: "low", defaultTimeoutMs: 60_000, defaultMaxRetries: 2, tags: ["asset"], owner: "platform-team", isReal: false },
    { id: "asset.video.transcode", name: "Transcode Video", description: "Transcode an uploaded video. Readiness only.", kind: "long_running", worker: "asset", defaultPriority: "low", defaultTimeoutMs: 600_000, defaultMaxRetries: 1, tags: ["asset"], owner: "platform-team", isReal: false },
    { id: "asset.thumbnail.generate", name: "Generate Thumbnail", description: "Generate a thumbnail for an asset. Readiness only.", kind: "queued", worker: "asset", defaultPriority: "low", defaultTimeoutMs: 30_000, defaultMaxRetries: 2, tags: ["asset"], owner: "platform-team", isReal: false },
    { id: "asset.ocr.extract", name: "OCR Extract", description: "Extract text from an image asset. Readiness only.", kind: "queued", worker: "asset", defaultPriority: "low", defaultTimeoutMs: 60_000, defaultMaxRetries: 2, tags: ["asset"], owner: "platform-team", isReal: false },
  ];
  for (const definition of readiness) executionRegistry.register(definition);
}
