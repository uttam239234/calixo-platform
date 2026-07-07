/**
 * Calixo Platform - Error Intelligence Platform
 *
 * Rather than requiring every module to double-report failures into a new
 * error store, this subscribes to the *Failed/*Error/RateLimitExceeded
 * events every phase already publishes onto the real `background` EventBus
 * (via `platformEventBus`) — Phase 6's Gateway, Phase 7's ExecutionEngine,
 * Phase 5's SynchronizationPlatformAPI all already emit these; nothing here
 * duplicates that reporting, it just listens.
 */
import { generateId } from "@/shared/utils/string";
import { eventBus } from "@/background/events/EventBus";
import type { Event as BackgroundEvent } from "@/background/types";
import { executionHistoryEngine } from "@/core/platform/execution/ExecutionHistoryEngine";
import type { ErrorRecord, RecurringFailureGroup } from "./types";

const MAX_ERRORS = 2000;

const ERROR_EVENT_TYPES = [
  "ExecutionFailed",
  "ExecutionRetried",
  "ConnectorSyncFailed",
  "RateLimitExceeded",
  "AuthorizationFailed",
  "SecurityAlert",
  "PermissionRevoked",
];

const SUGGESTIONS: Record<string, string> = {
  transient: "Likely a temporary failure — the platform retries this automatically per its configured retry policy.",
  rate_limit: "The caller exceeded a configured rate limit — check QueuePlatformAPI/RateLimiter quotas before retrying.",
  validation: "Failed schema/business validation — check the request payload against the contract's requestSchema.",
  timeout: "Exceeded its configured timeout — consider raising the ExecutionPolicy timeoutMs or investigating a slow dependency.",
  permanent: "Marked permanent — retrying is unlikely to help without a code/config change.",
  unknown: "No classified category available yet — check the source module's own logs for detail.",
};

function sourceFor(eventType: string): string {
  if (eventType.startsWith("Execution")) return "execution";
  if (eventType.startsWith("Connector")) return "connector";
  if (eventType.includes("RateLimit")) return "api";
  if (eventType.includes("Authorization") || eventType.includes("Security") || eventType.includes("Permission")) return "access";
  return "platform";
}

function messageFor(event: BackgroundEvent): string {
  if (event.type === "ExecutionFailed" || event.type === "ExecutionRetried") {
    return (event.data.error as string) ?? `${event.type} for worker ${event.data.worker}`;
  }
  if (event.type === "ConnectorSyncFailed") {
    return `Sync failed for connector ${event.data.connectionId}: ${event.data.recordsFailed ?? "unknown"} records failed`;
  }
  return (event.data.message as string) ?? (event.data.error as string) ?? event.type;
}

function categoryFor(event: BackgroundEvent): string {
  if (event.type === "ExecutionFailed" || event.type === "ExecutionRetried") {
    const executionId = event.data.executionId as string | undefined;
    const category = executionId ? executionHistoryEngine.getTimeline(executionId)?.error?.category : undefined;
    if (category) return category;
  }
  if (event.type === "RateLimitExceeded") return "rate_limit";
  return "unknown";
}

export class ErrorIntelligenceEngine {
  private errors: ErrorRecord[] = [];
  private subscribed = false;

  registerEventSubscriptions(): void {
    if (this.subscribed) return;
    this.subscribed = true;

    eventBus.registerHandler("error-intelligence", async (event: BackgroundEvent) => {
      if (!ERROR_EVENT_TYPES.includes(event.type)) return;
      this.record({
        source: sourceFor(event.type),
        category: categoryFor(event),
        message: messageFor(event),
        organizationId: event.organizationId,
        workspaceId: event.workspaceId,
        correlationId: event.correlationId,
        metadata: event.data,
      });
    });

    for (const type of ERROR_EVENT_TYPES) {
      void eventBus.subscribe(type, "error-intelligence", `Error Intelligence: ${type}`);
    }
  }

  record(input: Omit<ErrorRecord, "id" | "occurredAt">): ErrorRecord {
    const record: ErrorRecord = { id: generateId(14), occurredAt: new Date().toISOString(), ...input };
    this.errors.push(record);
    if (this.errors.length > MAX_ERRORS) this.errors.shift();
    return record;
  }

  listRecent(limit = 50): ErrorRecord[] {
    return [...this.errors].reverse().slice(0, limit);
  }

  /** Groups errors sharing source+category+message — surfaces the same underlying issue recurring rather than a flat, repetitive list. */
  getRecurringFailures(minCount = 2): RecurringFailureGroup[] {
    const groups = new Map<string, RecurringFailureGroup>();
    for (const err of this.errors) {
      const key = `${err.source}:${err.category}:${err.message}`;
      let group = groups.get(key);
      if (!group) {
        group = { key, source: err.source, category: err.category, sampleMessage: err.message, count: 0, firstSeenAt: err.occurredAt, lastSeenAt: err.occurredAt, suggestion: SUGGESTIONS[err.category] ?? SUGGESTIONS.unknown };
        groups.set(key, group);
      }
      group.count++;
      group.lastSeenAt = err.occurredAt;
    }
    return Array.from(groups.values()).filter(g => g.count >= minCount).sort((a, b) => b.count - a.count);
  }

  count(): number {
    return this.errors.length;
  }
}

export const errorIntelligenceEngine = new ErrorIntelligenceEngine();
