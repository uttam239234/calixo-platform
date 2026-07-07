/**
 * Calixo Platform - Rate Limiting Platform
 *
 * Real sliding-window counters, not a stub — each `(scope, key)` pair
 * (organization/workspace/api_key/user/ip/endpoint/global) gets its own
 * timestamped request log; a request is allowed only while the count
 * inside the current window is under the configured limit. Burst is
 * modeled as a separate short-window rule stacked on top of a longer quota
 * rule for the same scope — both are just entries in `RateLimitRule[]`.
 */
import type { RateLimitRule } from "./types";

export interface RateLimitCheckResult {
  allowed: boolean;
  rule?: RateLimitRule;
  remaining?: number;
  resetAt?: number;
}

export class RateLimiter {
  private windows = new Map<string, number[]>();

  private key(rule: RateLimitRule, identifier: string): string {
    return `${rule.scope}:${identifier}`;
  }

  /** Checks (and, if allowed, records) a request against every rule that applies to this call. Returns the first violated rule, if any. */
  check(rules: RateLimitRule[], identifiers: Partial<Record<RateLimitRule["scope"], string>>): RateLimitCheckResult {
    const now = Date.now();

    for (const rule of rules) {
      const identifier = identifiers[rule.scope];
      if (!identifier) continue;

      const key = this.key(rule, identifier);
      const timestamps = (this.windows.get(key) ?? []).filter(t => now - t < rule.windowMs);

      if (timestamps.length >= rule.limit) {
        return { allowed: false, rule, remaining: 0, resetAt: timestamps[0] + rule.windowMs };
      }
      this.windows.set(key, timestamps);
    }

    // All rules passed — record this request against each of them.
    for (const rule of rules) {
      const identifier = identifiers[rule.scope];
      if (!identifier) continue;
      const key = this.key(rule, identifier);
      const timestamps = this.windows.get(key) ?? [];
      timestamps.push(now);
      this.windows.set(key, timestamps);
    }

    return { allowed: true };
  }

  reset(scope: RateLimitRule["scope"], identifier: string): void {
    this.windows.delete(`${scope}:${identifier}`);
  }

  count(): number {
    return this.windows.size;
  }
}

export const rateLimiter = new RateLimiter();
