/**
 * Calixo Platform - Observability Platform API
 *
 * The top-level umbrella facade — one call for a combined health +
 * operations + diagnostics view, for callers who don't need the individual
 * Platform APIs.
 */
import { healthEngine } from "./HealthEngine";
import { operationsEngine } from "./OperationsEngine";
import { diagnosticsEngine } from "./DiagnosticsEngine";
import type { DiagnosticsReport, OperationsSnapshot, UnifiedHealthSnapshot } from "./types";

export interface ObservabilityOverview {
  health: UnifiedHealthSnapshot;
  operations: OperationsSnapshot;
  diagnostics: DiagnosticsReport;
}

export class ObservabilityPlatformAPI {
  async getOverview(): Promise<ObservabilityOverview> {
    const [health, operations, diagnostics] = await Promise.all([
      healthEngine.getSnapshot(),
      operationsEngine.getSnapshot(),
      diagnosticsEngine.run(),
    ]);
    return { health, operations, diagnostics };
  }
}

export const observabilityPlatformAPI = new ObservabilityPlatformAPI();
