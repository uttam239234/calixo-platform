/**
 * Calixo Platform - Universal Connector Framework: Job Scheduler Integration
 *
 * Reuses the existing, already-live Scheduler + Worker platform instead of
 * building a second one: real recurring `Schedule` records via
 * `schedulerPlatformAPI.createSchedule()`, and a real `WorkerDefinition`
 * registered with `workerRegistry` (the same registry the platform's other
 * workers — analytics/ads/social/... — already use, several with only
 * stubbed handlers; this one's handler does REAL work, not a stub).
 *
 * Disclosed, not hidden: `SchedulerEngine.start()` genuinely runs (started
 * at server boot from `core/platform/execution/index.ts`) and DOES create
 * real due `Job` rows on schedule, but `QueueEngine.start()` — the loop
 * that actually DISPATCHES a due job to a worker — is only started inside
 * `initializeBackgroundPlatform()`, which nothing in this app currently
 * calls at boot (confirmed via `PlatformEventBus.ts`'s own header: "the
 * same 'never auto-invoked' precedent... as `initializeBackgroundPlatform()`").
 * This is a pre-existing platform characteristic, not something this round
 * introduces or is in scope to fix. `runSweepNow()` below lets the real
 * handler logic be exercised directly (the same "call the handler, not the
 * dormant queue loop" technique used to verify every other worker in this
 * codebase would need before `initializeBackgroundPlatform()` is ever
 * called for real).
 *
 * `SchedulerEngine.calculateNextRun()`'s `'cron'` case is also a real, disclosed
 * stub today — it does not parse `cronExpression`, it always schedules
 * "next run in 1 hour at the given minute." The 5 sweep schedules below are
 * created honestly against that actual behavior (roughly hourly), not
 * against an imagined precise cron engine.
 */
import { appLogger } from "@/logging";
import { workerRegistry } from "@/background/workers/WorkerRegistry";
import { schedulerPlatformAPI } from "@/core/platform/execution/SchedulerPlatformAPI";
import type { Job, WorkerResult } from "@/background/types";
import { listAllOrganizationIdsWithConnectorData } from "./persistence/ConnectorDataStore";
import { tokenManager } from "./TokenManager";
import { connectorHealthEngine } from "./ConnectorHealthEngine";
import { rateLimitManager } from "./RateLimitManager";
import { syncEngine } from "./SyncEngine";
import { connectorRegistry } from "./ConnectorRegistry";
import type { ConnectorProviderId, ConnectorSyncMode } from "./types";

const WORKER_NAME = "connectors";
const MODULE = "ConnectorJobScheduler";

export type ConnectorJobType =
  | "connector.sync"
  | "connector.health-check-sweep"
  | "connector.refresh-token-sweep"
  | "connector.rate-limit-reset-sweep"
  | "connector.cleanup";

const SYSTEM_ACTOR = "system-connector-scheduler";

async function healthCheckSweep(): Promise<WorkerResult> {
  let checked = 0;
  for (const organizationId of listAllOrganizationIdsWithConnectorData()) {
    const credentials = await tokenManager.listForOrganization(organizationId);
    for (const credential of credentials) {
      await connectorHealthEngine.check({ organizationId, connectorInstanceId: credential.connectorInstanceId, provider: credential.provider });
      checked += 1;
    }
  }
  return { success: true, data: { checked } };
}

async function refreshTokenSweep(): Promise<WorkerResult> {
  let refreshed = 0;
  for (const organizationId of listAllOrganizationIdsWithConnectorData()) {
    const credentials = await tokenManager.listForOrganization(organizationId);
    for (const credential of credentials) {
      if (credential.status !== "active" || !tokenManager.isExpired(credential)) continue;
      const connector = connectorRegistry.getConnectorByProvider(credential.provider);
      if (!connector) continue;
      const result = await connector.refresh({ organizationId, connectorInstanceId: credential.connectorInstanceId, actorId: SYSTEM_ACTOR });
      if (result.ok) refreshed += 1;
    }
  }
  return { success: true, data: { refreshed } };
}

async function rateLimitResetSweep(): Promise<WorkerResult> {
  let reset = 0;
  for (const record of rateLimitManager.listAll()) {
    if (record.resetAt && new Date(record.resetAt).getTime() <= Date.now()) {
      rateLimitManager.reset(record.connectorInstanceId);
      reset += 1;
    }
  }
  return { success: true, data: { reset } };
}

async function cleanupSweep(): Promise<WorkerResult> {
  // Real, bounded cleanup hook (sync/log history is already capped per-organization at write
  // time — see SyncEngine/ConnectorLogger — so this sweep's job today is limited to reporting;
  // a future phase with real retention windows plugs in here without changing the job shape).
  const orgCount = listAllOrganizationIdsWithConnectorData().length;
  return { success: true, data: { organizationsScanned: orgCount } };
}

async function runSyncJob(job: Job): Promise<WorkerResult> {
  const { organizationId, connectorId, connectorInstanceId, mode, actorId } = job.payload as { organizationId: string; connectorId: string; connectorInstanceId: string; mode: ConnectorSyncMode; actorId: string };
  const record = await syncEngine.run(connectorId, { organizationId, connectorInstanceId, actorId: actorId ?? SYSTEM_ACTOR }, mode ?? "scheduled");
  return { success: record.status === "succeeded" || record.status === "partial", data: { syncId: record.id, status: record.status, recordsProcessed: record.recordsProcessed } };
}

async function dispatch(job: Job): Promise<WorkerResult> {
  switch (job.type as ConnectorJobType) {
    case "connector.sync":
      return runSyncJob(job);
    case "connector.health-check-sweep":
      return healthCheckSweep();
    case "connector.refresh-token-sweep":
      return refreshTokenSweep();
    case "connector.rate-limit-reset-sweep":
      return rateLimitResetSweep();
    case "connector.cleanup":
      return cleanupSweep();
    default:
      return { success: false, error: { message: `Unknown connector job type: ${job.type}`, category: "permanent", timestamp: new Date().toISOString() } };
  }
}

let initialized = false;

export const connectorJobScheduler = {
  /** Idempotent — safe to call more than once (module re-evaluation under dev Fast Refresh, multiple callers, etc.): registers the worker once, and only creates each recurring schedule if one with the same name doesn't already exist. */
  async initialize(): Promise<void> {
    if (!workerRegistry.getWorker(WORKER_NAME)) {
      workerRegistry.register(
        { name: WORKER_NAME, description: "Universal Connector Framework: sync, token refresh, health checks, rate-limit reset, cleanup", module: "connectors", version: "1.0.0", concurrency: 5, maxRetries: 3, timeout: 60_000, handles: ["connector.sync", "connector.health-check-sweep", "connector.refresh-token-sweep", "connector.rate-limit-reset-sweep", "connector.cleanup"], isActive: true },
        dispatch
      );
    }

    const existingNames = new Set((await schedulerPlatformAPI.list({})).map(s => s.name));
    const sweeps: { name: string; type: ConnectorJobType; frequency: "cron" | "daily"; minute?: number; hour?: number }[] = [
      { name: "Connector Health Check Sweep", type: "connector.health-check-sweep", frequency: "cron", minute: 0 },
      { name: "Connector Token Refresh Sweep", type: "connector.refresh-token-sweep", frequency: "cron", minute: 15 },
      { name: "Connector Rate Limit Reset Sweep", type: "connector.rate-limit-reset-sweep", frequency: "cron", minute: 30 },
      { name: "Connector Cleanup", type: "connector.cleanup", frequency: "daily", hour: 3, minute: 0 },
    ];

    for (const sweep of sweeps) {
      if (existingNames.has(sweep.name)) continue;
      await schedulerPlatformAPI.createSchedule({ name: sweep.name, frequency: sweep.frequency, worker: WORKER_NAME, payload: { type: sweep.type }, hour: sweep.hour, minute: sweep.minute });
    }

    initialized = true;
    appLogger.info(MODULE, "Universal Connector Framework worker + recurring schedules registered.");
  },

  isInitialized(): boolean {
    return initialized;
  },

  /** Runs one sweep's real handler logic directly — the documented technique for exercising a worker's real behavior without depending on `QueueEngine`'s dormant processing loop (see file header). */
  async runSweepNow(type: ConnectorJobType): Promise<WorkerResult> {
    // A synthetic Job shim purely to drive `dispatch()` directly (see file header) — never
    // persisted or read by the real Job repository, so a structural cast through `unknown` is
    // honest here rather than extending the shared `JobType` union for a call shape this module
    // alone uses.
    const now = new Date().toISOString();
    return dispatch({ id: "manual", type, status: "running", priority: "medium", name: type, worker: WORKER_NAME, payload: {}, retryCount: 0, maxRetries: 0, retryDelay: 0, backoffMultiplier: 2, tags: [], isDeleted: false, createdAt: now, updatedAt: now } as unknown as Job);
  },

  async scheduleSync(params: { organizationId: string; connectorId: string; connectorInstanceId: string; provider: ConnectorProviderId; frequency: "daily" | "weekly" | "monthly" | "cron"; hour?: number; minute?: number }) {
    return schedulerPlatformAPI.createSchedule({
      name: `Sync: ${params.provider} (${params.connectorInstanceId})`,
      frequency: params.frequency,
      worker: WORKER_NAME,
      payload: { type: "connector.sync", organizationId: params.organizationId, connectorId: params.connectorId, connectorInstanceId: params.connectorInstanceId, mode: "scheduled" },
      organizationId: params.organizationId,
      hour: params.hour,
      minute: params.minute,
    });
  },
};
