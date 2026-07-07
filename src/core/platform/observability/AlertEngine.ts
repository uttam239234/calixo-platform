/**
 * Calixo Platform - Alert Platform
 *
 * Threshold rules evaluated against `MetricsEngine` snapshots. Evaluation
 * itself runs on a real recurring schedule registered through Phase 7's
 * Execution Platform (`schedulerPlatformAPI`/`workerPlatformAPI`) — no new
 * `setInterval` poller, per this phase's own "never duplicate a scheduler"
 * continuation of Phase 7's rule.
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import { metricsEngine } from "./MetricsEngine";
import type { AlertCondition, AlertInstance, AlertRuleDefinition } from "./types";

const MAX_HISTORY = 1000;

function evaluateCondition(value: number, condition: AlertCondition, threshold: number): boolean {
  switch (condition) {
    case "gt": return value > threshold;
    case "gte": return value >= threshold;
    case "lt": return value < threshold;
    case "lte": return value <= threshold;
    case "eq": return value === threshold;
  }
}

export class AlertEngine {
  private rules = new Map<string, AlertRuleDefinition>();
  private activeAlerts = new Map<string, AlertInstance>();
  private history: AlertInstance[] = [];

  registerRule(rule: AlertRuleDefinition): AlertRuleDefinition {
    this.rules.set(rule.id, rule);
    return rule;
  }

  removeRule(id: string): void {
    this.rules.delete(id);
  }

  getRule(id: string): AlertRuleDefinition | undefined {
    return this.rules.get(id);
  }

  listRules(): AlertRuleDefinition[] {
    return Array.from(this.rules.values());
  }

  /** Evaluates every active rule against current metric snapshots, firing new alerts and resolving ones whose condition no longer holds. Returns the alerts newly fired this pass. */
  evaluateAll(): AlertInstance[] {
    const fired: AlertInstance[] = [];
    for (const rule of this.rules.values()) {
      if (!rule.isActive) continue;

      const snapshot = metricsEngine.snapshot(rule.metricName);
      const value = snapshot ? (snapshot.value ?? snapshot.histogram?.mean ?? 0) : 0;
      const breached = evaluateCondition(value, rule.condition, rule.threshold);
      const existing = this.activeAlerts.get(rule.id);

      if (breached && !existing) {
        const alert: AlertInstance = {
          id: generateId(14),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          status: "firing",
          message: `${rule.name}: ${rule.metricName} is ${value} (threshold ${rule.condition} ${rule.threshold})`,
          value,
          threshold: rule.threshold,
          organizationId: rule.scopeId,
          firedAt: new Date().toISOString(),
        };
        this.activeAlerts.set(rule.id, alert);
        this.history.push(alert);
        if (this.history.length > MAX_HISTORY) this.history.shift();
        fired.push(alert);
      } else if (!breached && existing) {
        existing.status = "resolved";
        existing.resolvedAt = new Date().toISOString();
        this.activeAlerts.delete(rule.id);
        void platformEventBus.publish({ type: "AlertResolved", organizationId: existing.organizationId, payload: { alertId: existing.id, ruleId: rule.id, ruleName: rule.name } });
      }
    }
    return fired;
  }

  listActive(): AlertInstance[] {
    return Array.from(this.activeAlerts.values());
  }

  listHistory(limit = 100): AlertInstance[] {
    return this.history.slice(-limit).reverse();
  }

  count(): number {
    return this.rules.size;
  }
}

export const alertEngine = new AlertEngine();
