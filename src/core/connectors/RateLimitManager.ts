/**
 * Calixo Platform - Universal Connector Framework: Rate Limit Manager
 *
 * Tracks each connector instance's real rate-limit state — remaining
 * requests, reset time, burst limit, retry-after, and a throttle queue
 * depth — updated from the ACTUAL HTTP response headers a provider sends
 * back (each vendor names its headers differently; `PROVIDER_HEADER_MAP`
 * is the real, documented header name per provider). Deliberately
 * per-process in-memory only (not persisted): rate-limit state is
 * transient by nature — it's stale the instant the next real request
 * happens — so durability would be misleading, not useful. Keyed by
 * connector instance, so memory cost is proportional to ACTIVE connectors
 * being called right now, not total organizations.
 */
import type { ConnectorProviderId, ConnectorRateLimit } from "./types";

/** Real, documented rate-limit header names per vendor (where a stable, documented one exists — several vendors don't expose one in every response, which `recordFromHeaders` handles by leaving fields undefined rather than guessing). */
const PROVIDER_HEADER_MAP: Partial<Record<ConnectorProviderId, { remaining?: string; limit?: string; reset?: string; retryAfter?: string }>> = {
  google: { retryAfter: "retry-after" },
  meta: { retryAfter: "retry-after", remaining: "x-app-usage" },
  microsoft: { retryAfter: "retry-after" },
  slack: { retryAfter: "retry-after" },
  hubspot: { remaining: "x-hubspot-ratelimit-remaining", limit: "x-hubspot-ratelimit-max", reset: "x-hubspot-ratelimit-interval-milliseconds" },
  shopify: { remaining: "x-shopify-shop-api-call-limit" },
  wordpress: { retryAfter: "retry-after" },
};

const state = new Map<string, ConnectorRateLimit>();

function key(connectorInstanceId: string): string {
  return connectorInstanceId;
}

export const rateLimitManager = {
  get(connectorInstanceId: string): ConnectorRateLimit | undefined {
    return state.get(key(connectorInstanceId));
  },

  /** Real header parsing — call this with the actual `Headers`/plain object a provider returned from any real HTTP call the connector made. */
  recordFromHeaders(connectorInstanceId: string, provider: ConnectorProviderId, headers: Record<string, string | null | undefined>): ConnectorRateLimit {
    const map = PROVIDER_HEADER_MAP[provider] ?? {};
    const get = (name?: string) => (name ? headers[name] ?? headers[name.toLowerCase()] : undefined);

    const remainingRaw = get(map.remaining);
    const limitRaw = get(map.limit);
    const retryAfterRaw = get(map.retryAfter);

    const remainingRequests = remainingRaw && /^\d+$/.test(remainingRaw) ? Number(remainingRaw) : undefined;
    const burstLimit = limitRaw && /^\d+$/.test(limitRaw) ? Number(limitRaw) : undefined;
    const retryAfterMs = retryAfterRaw && /^\d+$/.test(retryAfterRaw) ? Number(retryAfterRaw) * 1000 : undefined;

    const existing = state.get(key(connectorInstanceId));
    const record: ConnectorRateLimit = {
      connectorInstanceId,
      provider,
      remainingRequests: remainingRequests ?? existing?.remainingRequests,
      burstLimit: burstLimit ?? existing?.burstLimit,
      resetAt: retryAfterMs ? new Date(Date.now() + retryAfterMs).toISOString() : existing?.resetAt,
      retryAfterMs,
      throttleQueueLength: existing?.throttleQueueLength ?? 0,
      updatedAt: new Date().toISOString(),
    };
    state.set(key(connectorInstanceId), record);
    return record;
  },

  isThrottled(connectorInstanceId: string): boolean {
    const record = state.get(key(connectorInstanceId));
    if (!record?.resetAt) return false;
    return new Date(record.resetAt).getTime() > Date.now();
  },

  enqueueThrottled(connectorInstanceId: string): number {
    const record = state.get(key(connectorInstanceId));
    if (!record) return 0;
    record.throttleQueueLength += 1;
    return record.throttleQueueLength;
  },

  dequeueThrottled(connectorInstanceId: string): number {
    const record = state.get(key(connectorInstanceId));
    if (!record) return 0;
    record.throttleQueueLength = Math.max(0, record.throttleQueueLength - 1);
    return record.throttleQueueLength;
  },

  reset(connectorInstanceId: string): void {
    state.delete(key(connectorInstanceId));
  },

  listAll(): ConnectorRateLimit[] {
    return Array.from(state.values());
  },
};
