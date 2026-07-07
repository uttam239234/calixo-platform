/**
 * Calixo Platform - Usage Metering Platform
 *
 * Phase 1's `SubscriptionEngine.recordUsage()` only understands a fixed
 * 6-key union (`seatsUsed`/`aiCreditsUsed`/...). This generalizes the same
 * "count something against an organization" idea into an open registry —
 * "Future modules can register additional usage types" (mandate section 5)
 * — without touching that fixed system, which stays exactly as Phase 1
 * built it for the 6 dimensions it already covers.
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { UsagePeriod, UsageRecord, UsageSummary, UsageTypeDefinition } from "./types";

const MAX_RECORDS = 50_000;

function periodStart(period: UsagePeriod, from: Date = new Date()): string {
  const d = new Date(from);
  switch (period) {
    case "daily":
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    case "weekly": {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case "monthly":
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    case "annual":
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    case "lifetime":
      return new Date(0).toISOString();
  }
}

export class UsageMeteringEngine {
  private types = new Map<string, UsageTypeDefinition>();
  private records: UsageRecord[] = [];

  registerType(definition: UsageTypeDefinition): UsageTypeDefinition {
    this.types.set(definition.id, definition);
    return definition;
  }

  getType(id: string): UsageTypeDefinition | undefined {
    return this.types.get(id);
  }

  listTypes(): UsageTypeDefinition[] {
    return Array.from(this.types.values());
  }

  record(input: Omit<UsageRecord, "id" | "recordedAt">): UsageRecord {
    if (!this.types.has(input.usageTypeId)) throw new Error(`Unknown usage type: ${input.usageTypeId}. Register it first via CommercialDeveloperSDK.registerUsageType().`);
    const record: UsageRecord = { id: generateId(16), recordedAt: new Date().toISOString(), ...input };
    this.records.push(record);
    if (this.records.length > MAX_RECORDS) this.records.shift();
    void platformEventBus.publish({ type: "UsageRecorded", organizationId: input.organizationId, workspaceId: input.workspaceId, userId: input.userId, payload: { usageTypeId: input.usageTypeId, quantity: input.quantity } });
    return record;
  }

  getTotal(usageTypeId: string, organizationId: string, period: UsagePeriod, workspaceId?: string, userId?: string): number {
    const start = periodStart(period);
    return this.records
      .filter(r => r.usageTypeId === usageTypeId && r.organizationId === organizationId && r.recordedAt >= start)
      .filter(r => !workspaceId || r.workspaceId === workspaceId)
      .filter(r => !userId || r.userId === userId)
      .reduce((sum, r) => sum + r.quantity, 0);
  }

  getSummary(usageTypeId: string, organizationId: string, period: UsagePeriod): UsageSummary {
    return { usageTypeId, organizationId, period, periodStart: periodStart(period), total: this.getTotal(usageTypeId, organizationId, period) };
  }

  getBreakdown(organizationId: string, period: UsagePeriod): UsageSummary[] {
    return this.listTypes().map(t => this.getSummary(t.id, organizationId, period));
  }

  count(): number {
    return this.records.length;
  }
}

export const usageMeteringEngine = new UsageMeteringEngine();
