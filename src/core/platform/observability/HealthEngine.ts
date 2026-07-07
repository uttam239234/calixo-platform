/**
 * Calixo Platform - Health Platform
 *
 * Aggregates six already-real, independently-built health/analytics
 * services into one snapshot — reused verbatim, nothing recomputed:
 * `platformHealthService` (Phase 1, registry counts), `background`'s
 * `healthMonitor` (queue/worker/scheduler/event-bus — genuinely wired by
 * Phase 7), `apiMonitoring` (Phase 6, Gateway health), `executionMonitoring`
 * (Phase 7, execution aggregates), and `aiAnalytics` (AIOS, real token/
 * latency/success-rate data). Storage/Search are "Database Readiness"/
 * "Storage Health" in the mandate's own words, not deep connectivity checks
 * — Phase 4's persistence layer is in-memory only, so registry presence is
 * the honest signal, matching Phase 1's own `PlatformHealthService`
 * precedent (`count > 0 ? "healthy" : "degraded"`).
 */
import { platformHealthService } from "@/core/platform/registry/PlatformHealthService";
import { healthMonitor as backgroundHealthMonitor } from "@/background/health/HealthMonitor";
import { apiMonitoring } from "@/core/platform/api/ApiMonitoring";
import { executionMonitoring } from "@/core/platform/execution/ExecutionMonitoring";
import { aiAnalytics } from "@/aios/analytics/AIAnalytics";
import { cacheEngine } from "@/core/platform/data/CacheEngine";
import { searchRegistry } from "@/core/platform/data/SearchEngine";
import { storageProviderRegistry } from "@/core/platform/data/storage/StorageProviderRegistry";
import type { ComponentHealth, HealthState, UnifiedHealthSnapshot } from "./types";

function worst(states: HealthState[]): HealthState {
  if (states.includes("unhealthy")) return "unhealthy";
  if (states.includes("degraded")) return "degraded";
  if (states.includes("unknown")) return "unknown";
  return "healthy";
}

export type CustomHealthCheck = () => Promise<ComponentHealth> | ComponentHealth;

export class HealthEngine {
  private customChecks = new Map<string, CustomHealthCheck>();

  /** Developer SDK entry point — a module contributes its own health check into the unified snapshot without modifying this engine. */
  registerCustomCheck(name: string, check: CustomHealthCheck): void {
    this.customChecks.set(name, check);
  }

  async getSnapshot(): Promise<UnifiedHealthSnapshot> {
    const checkedAt = new Date().toISOString();
    const components: ComponentHealth[] = [];

    const platform = platformHealthService.getSnapshot();
    components.push({ name: "platform", state: platform.status === "healthy" ? "healthy" : "degraded", detail: `${Object.keys(platform.registries).length} registries`, checkedAt });

    const background = await backgroundHealthMonitor.getHealth();
    components.push({ name: "queue", state: background.isHealthy ? "healthy" : "degraded", metadata: { queues: background.queues.length }, checkedAt });
    components.push({ name: "workers", state: background.workers.every(w => w.isActive) ? "healthy" : "degraded", metadata: { workerCount: background.workers.length }, checkedAt });
    components.push({ name: "scheduler", state: "healthy", metadata: { activeSchedules: background.scheduler.activeSchedules }, checkedAt });
    components.push({ name: "eventBus", state: background.eventBus.failedEvents > 100 ? "degraded" : "healthy", metadata: { subscribers: background.eventBus.subscribers }, checkedAt });

    const api = apiMonitoring.getHealth();
    components.push({ name: "api", state: api.status === "healthy" ? "healthy" : "degraded", detail: `${api.registeredEndpoints} endpoints, ${api.errorRate}% error rate`, checkedAt });

    const execution = await executionMonitoring.getSnapshot();
    components.push({ name: "execution", state: execution.isHealthy ? "healthy" : "degraded", detail: `${execution.executions.successRatePercent}% success rate`, checkedAt });

    const aiSummary = await aiAnalytics.getSummary();
    const aiState: HealthState = aiSummary.totalRequests === 0 ? "unknown" : aiSummary.successRate >= 95 ? "healthy" : aiSummary.successRate >= 80 ? "degraded" : "unhealthy";
    components.push({ name: "ai", state: aiState, detail: `${aiSummary.totalRequests} requests, ${Math.round(aiSummary.successRate)}% success`, checkedAt });

    components.push({ name: "cache", state: "healthy", metadata: { namedCaches: cacheEngine.count() }, checkedAt });
    components.push({ name: "search", state: searchRegistry.count() > 0 ? "healthy" : "unknown", detail: "Database/Storage Readiness — registry presence, not a live connectivity probe (in-memory persistence).", checkedAt });
    components.push({ name: "storage", state: storageProviderRegistry.count() > 0 ? "healthy" : "unknown", checkedAt });

    for (const [name, check] of this.customChecks) {
      try {
        components.push(await check());
      } catch (error) {
        components.push({ name, state: "unhealthy", detail: (error as Error).message, checkedAt });
      }
    }

    return { overall: worst(components.map(c => c.state)), components, checkedAt };
  }
}

export const healthEngine = new HealthEngine();
