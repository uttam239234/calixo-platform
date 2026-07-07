/**
 * Calixo Platform - AI Observability
 *
 * Wraps AIOS's real `aiAnalytics` (already recording token/cost/latency/
 * success-rate on every `AIOrchestrator` call) — no second AI telemetry
 * store.
 */
import { aiAnalytics } from "@/aios/analytics/AIAnalytics";
import type { AIModel } from "@/aios/types";
import type { AiObservabilitySummary } from "./types";

export class AiObservability {
  async getSummary(organizationId?: string, periodStart?: string, periodEnd?: string): Promise<AiObservabilitySummary> {
    const summary = await aiAnalytics.getSummary(organizationId, periodStart, periodEnd);
    return {
      totalTokens: summary.totalTokens,
      totalCost: summary.totalCost,
      totalRequests: summary.totalRequests,
      successRate: summary.successRate,
      averageLatency: summary.averageLatency,
      topModels: summary.topModels,
    };
  }

  getRecords(params: { organizationId?: string; model?: AIModel; module?: string; page?: number; limit?: number } = {}) {
    return aiAnalytics.getRecords(params);
  }
}

export const aiObservability = new AiObservability();
