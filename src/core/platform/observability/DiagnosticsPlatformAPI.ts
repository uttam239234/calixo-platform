/**
 * Calixo Platform - Diagnostics Platform API
 */
import { diagnosticsEngine } from "./DiagnosticsEngine";
import { errorIntelligenceEngine } from "./ErrorIntelligenceEngine";
import type { DiagnosticsReport, ErrorRecord, RecurringFailureGroup } from "./types";

export class DiagnosticsPlatformAPI {
  run(): Promise<DiagnosticsReport> {
    return diagnosticsEngine.run();
  }

  getRecentErrors(limit?: number): ErrorRecord[] {
    return errorIntelligenceEngine.listRecent(limit);
  }

  getRecurringFailures(minCount?: number): RecurringFailureGroup[] {
    return errorIntelligenceEngine.getRecurringFailures(minCount);
  }
}

export const diagnosticsPlatformAPI = new DiagnosticsPlatformAPI();
