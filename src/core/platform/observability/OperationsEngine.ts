/**
 * Calixo Platform - Operations Command Center
 *
 * The single unified snapshot mandate section 15 asks for — assembled
 * entirely from already-real engines (`HealthEngine`, `AlertEngine`,
 * `ErrorIntelligenceEngine`, AIOS's `aiAnalytics`), nothing new computed
 * here.
 */
import { aiAnalytics } from "@/aios/analytics/AIAnalytics";
import { healthEngine } from "./HealthEngine";
import { alertEngine } from "./AlertEngine";
import { errorIntelligenceEngine } from "./ErrorIntelligenceEngine";
import type { OperationsSnapshot } from "./types";

export class OperationsEngine {
  async getSnapshot(): Promise<OperationsSnapshot> {
    const health = await healthEngine.getSnapshot();
    const ai = await aiAnalytics.getSummary();
    return {
      overallHealth: health.overall,
      health,
      activeAlerts: alertEngine.listActive(),
      recentErrors: errorIntelligenceEngine.listRecent(20),
      topFailures: errorIntelligenceEngine.getRecurringFailures(2).slice(0, 10),
      ai,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const operationsEngine = new OperationsEngine();
