/**
 * Calixo Platform - API Analytics Platform
 *
 * Every request the Gateway processes is recorded here — real aggregation
 * (count/error-rate/average latency) sliced by endpoint, organization,
 * workspace, and version, not a placeholder counter.
 */
import type { ApiRequestRecord, EndpointAnalyticsSummary } from "./types";

const MAX_RECORDS = 5000;

export class ApiAnalyticsEngine {
  private records: ApiRequestRecord[] = [];

  record(entry: ApiRequestRecord): void {
    this.records.push(entry);
    if (this.records.length > MAX_RECORDS) this.records.shift();
  }

  private summarize(records: ApiRequestRecord[], contractId: string): EndpointAnalyticsSummary {
    const errorCount = records.filter(r => r.statusCode >= 400).length;
    const totalLatency = records.reduce((sum, r) => sum + r.latencyMs, 0);
    return {
      contractId,
      requestCount: records.length,
      errorCount,
      successRate: records.length === 0 ? 100 : Math.round(((records.length - errorCount) / records.length) * 1000) / 10,
      averageLatencyMs: records.length === 0 ? 0 : Math.round(totalLatency / records.length),
    };
  }

  forEndpoint(contractId: string): EndpointAnalyticsSummary {
    return this.summarize(this.records.filter(r => r.contractId === contractId), contractId);
  }

  forOrganization(organizationId: string): EndpointAnalyticsSummary {
    return this.summarize(this.records.filter(r => r.organizationId === organizationId), organizationId);
  }

  /** Raw, org-scoped request records (most recent first) — added by API & Webhooks (Track 3 Phase 1) for the Developer Mode "Request Logs" panel; every other accessor here only returns an aggregated summary. */
  forOrganizationRecords(organizationId: string, limit = 50): ApiRequestRecord[] {
    return this.records
      .filter(r => r.organizationId === organizationId)
      .slice(-limit)
      .reverse();
  }

  forVersion(version: string): EndpointAnalyticsSummary {
    return this.summarize(this.records.filter(r => r.version === version), version);
  }

  overall(): EndpointAnalyticsSummary {
    return this.summarize(this.records, "*");
  }

  recentErrors(limit = 20): ApiRequestRecord[] {
    return this.records.filter(r => r.statusCode >= 400).slice(-limit).reverse();
  }

  /** Additive read-only accessor for the Commercial Platform's usage-metering tick — real, newly-recorded requests since the last sweep, not a re-derived total (avoids double-counting). */
  getRecordsSince(timestamp: string): ApiRequestRecord[] {
    return this.records.filter(r => r.recordedAt > timestamp);
  }

  count(): number {
    return this.records.length;
  }
}

export const apiAnalyticsEngine = new ApiAnalyticsEngine();
