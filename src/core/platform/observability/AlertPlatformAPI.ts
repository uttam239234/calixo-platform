/**
 * Calixo Platform - Alert Platform API
 */
import { alertEngine } from "./AlertEngine";
import type { AlertInstance, AlertRuleDefinition } from "./types";

export class AlertPlatformAPI {
  registerRule(rule: AlertRuleDefinition): AlertRuleDefinition {
    return alertEngine.registerRule(rule);
  }

  removeRule(id: string): void {
    alertEngine.removeRule(id);
  }

  listRules(): AlertRuleDefinition[] {
    return alertEngine.listRules();
  }

  evaluateAll(): AlertInstance[] {
    return alertEngine.evaluateAll();
  }

  listActive(): AlertInstance[] {
    return alertEngine.listActive();
  }

  listHistory(limit?: number): AlertInstance[] {
    return alertEngine.listHistory(limit);
  }
}

export const alertPlatformAPI = new AlertPlatformAPI();
