/**
 * Calixo Platform - Usage Platform API
 */
import { usageMeteringEngine } from "./UsageMeteringEngine";
import type { UsagePeriod, UsageRecord, UsageSummary, UsageTypeDefinition } from "./types";

export class UsagePlatformAPI {
  registerType(definition: UsageTypeDefinition): UsageTypeDefinition {
    return usageMeteringEngine.registerType(definition);
  }

  listTypes(): UsageTypeDefinition[] {
    return usageMeteringEngine.listTypes();
  }

  record(input: Omit<UsageRecord, "id" | "recordedAt">): UsageRecord {
    return usageMeteringEngine.record(input);
  }

  getTotal(usageTypeId: string, organizationId: string, period: UsagePeriod, workspaceId?: string, userId?: string): number {
    return usageMeteringEngine.getTotal(usageTypeId, organizationId, period, workspaceId, userId);
  }

  getSummary(usageTypeId: string, organizationId: string, period: UsagePeriod): UsageSummary {
    return usageMeteringEngine.getSummary(usageTypeId, organizationId, period);
  }

  getBreakdown(organizationId: string, period: UsagePeriod): UsageSummary[] {
    return usageMeteringEngine.getBreakdown(organizationId, period);
  }
}

export const usagePlatformAPI = new UsagePlatformAPI();
