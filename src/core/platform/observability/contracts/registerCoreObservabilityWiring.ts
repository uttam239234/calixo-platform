/**
 * Calixo Platform - Core Observability Wiring
 *
 * The one file allowed to import multiple modules (mirrors Phase 6/7's
 * `registerCoreContracts.ts`/`registerCoreExecutionWiring.ts` convention).
 * Wires three things:
 *
 * 1. `ErrorIntelligenceEngine`'s event subscriptions (listens to the real
 *    *Failed events every phase already publishes).
 * 2. A recurring "observability-tick" job — registered through Phase 7's
 *    Execution Platform (`schedulerPlatformAPI`/`workerPlatformAPI`), not a
 *    new `setInterval` poller — that feeds live domain summaries (AI/API/
 *    Execution success rates) into `MetricsEngine` as gauges and then
 *    evaluates alert rules against them.
 * 3. Three default alert rules or real, already-flowing data.
 */
import { schedulerPlatformAPI } from "@/core/platform/execution/SchedulerPlatformAPI";
import { workerPlatformAPI } from "@/core/platform/execution/WorkerPlatformAPI";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { WorkerHandler } from "@/background/types";
import { metricsEngine } from "../MetricsEngine";
import { alertEngine } from "../AlertEngine";
import { errorIntelligenceEngine } from "../ErrorIntelligenceEngine";
import { aiObservability } from "../AiObservability";
import { apiObservability } from "../ApiObservability";
import { executionObservability } from "../ExecutionObservability";

let registered = false;

export function registerCoreObservabilityWiring(): void {
  if (registered) return;
  registered = true;

  errorIntelligenceEngine.registerEventSubscriptions();
  registerDefaultAlertRules();
  registerObservabilityTick();
}

function registerDefaultAlertRules(): void {
  alertEngine.registerRule({ id: "low-execution-success-rate", name: "Low Execution Success Rate", description: "Execution success rate dropped below 90%.", metricName: "execution.success_rate", condition: "lt", threshold: 90, severity: "warning", scope: "global", isActive: true });
  alertEngine.registerRule({ id: "low-api-success-rate", name: "Low API Success Rate", description: "Gateway success rate dropped below 95%.", metricName: "api.success_rate", condition: "lt", threshold: 95, severity: "warning", scope: "global", isActive: true });
  alertEngine.registerRule({ id: "low-ai-success-rate", name: "Low AI Success Rate", description: "AI request success rate dropped below 90%.", metricName: "ai.success_rate", condition: "lt", threshold: 90, severity: "warning", scope: "global", isActive: true });
  alertEngine.registerRule({ id: "dead-letter-backlog", name: "Dead Letter Backlog", description: "More than 10 jobs sitting in the dead-letter queue.", metricName: "execution.dead_letter_count", condition: "gt", threshold: 10, severity: "critical", scope: "global", isActive: true });
}

function registerObservabilityTick(): void {
  const handler: WorkerHandler = async () => {
    const execution = await executionObservability.getSnapshot();
    metricsEngine.gauge("execution.success_rate", execution.executions.successRatePercent);
    metricsEngine.gauge("execution.dead_letter_count", execution.executions.deadLettered);

    const api = apiObservability.getOverall();
    metricsEngine.gauge("api.success_rate", api.successRate);

    const ai = await aiObservability.getSummary();
    if (ai.totalRequests > 0) metricsEngine.gauge("ai.success_rate", ai.successRate);

    const fired = alertEngine.evaluateAll();
    for (const alert of fired) {
      void platformEventBus.publish({ type: "AlertFired", organizationId: alert.organizationId, payload: { alertId: alert.id, ruleName: alert.ruleName, severity: alert.severity, message: alert.message } });
    }

    return { success: true, data: { alertsFired: fired.length } };
  };

  workerPlatformAPI.register(
    { name: "observability-tick", description: "Feeds live domain summaries into MetricsEngine and evaluates alert rules.", module: "observability", version: "1.0.0", concurrency: 1, maxRetries: 1, timeout: 30_000, handles: ["scheduled"], isActive: true },
    handler
  );

  void schedulerPlatformAPI.createSchedule({
    name: "observability-tick",
    frequency: "custom",
    worker: "observability-tick",
    payload: {},
    isActive: true,
  });
}
