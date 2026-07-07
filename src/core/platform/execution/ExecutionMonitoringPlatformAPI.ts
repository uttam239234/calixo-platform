/**
 * Calixo Platform - Execution Monitoring Platform API
 */
import { executionMonitoring } from "./ExecutionMonitoring";
import type { ExecutionMonitoringSnapshot } from "./types";

export class ExecutionMonitoringPlatformAPI {
  getSnapshot(): Promise<ExecutionMonitoringSnapshot> {
    return executionMonitoring.getSnapshot();
  }
}

export const executionMonitoringPlatformAPI = new ExecutionMonitoringPlatformAPI();
