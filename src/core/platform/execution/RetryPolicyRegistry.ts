/**
 * Calixo Platform - Retry Platform
 *
 * `background/types.ts` already had one hard-coded `DEFAULT_RETRY_POLICY`
 * (never a registry, never referenced by `QueueEngine.retry()`, which just
 * checks `job.retryCount >= job.maxRetries` with no backoff delay applied
 * at all). This formalizes named, registrable retry policies with real
 * backoff math, so `ExecutionEngine` can compute an actual delay before a
 * retry becomes due instead of retrying immediately.
 */
import type { FailureCategory } from "@/background/types";
import type { RetryPolicyDefinition } from "./types";

export const DEFAULT_RETRY_POLICY: RetryPolicyDefinition = {
  id: "default",
  name: "Default Retry Policy",
  description: "Exponential backoff, 3 attempts. Mirrors background/types' DEFAULT_RETRY_POLICY as the platform's canonical default.",
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30_000,
  backoffMultiplier: 2,
  strategy: "exponential",
  retryableCategories: ["transient", "timeout", "rate_limit"],
  abortCategories: ["validation", "permanent"],
};

export const AGGRESSIVE_RETRY_POLICY: RetryPolicyDefinition = {
  id: "aggressive",
  name: "Aggressive Retry Policy",
  description: "Fast, frequent retries for low-latency operations (e.g. cache warms, health checks).",
  maxRetries: 5,
  initialDelayMs: 250,
  maxDelayMs: 5_000,
  backoffMultiplier: 1.5,
  strategy: "exponential",
  retryableCategories: ["transient", "timeout", "rate_limit"],
  abortCategories: ["validation", "permanent"],
};

export const CONSERVATIVE_RETRY_POLICY: RetryPolicyDefinition = {
  id: "conservative",
  name: "Conservative Retry Policy",
  description: "Slow, few retries for expensive or rate-limited external operations (e.g. connector syncs).",
  maxRetries: 2,
  initialDelayMs: 5_000,
  maxDelayMs: 120_000,
  backoffMultiplier: 3,
  strategy: "exponential",
  retryableCategories: ["transient", "rate_limit"],
  abortCategories: ["validation", "permanent", "timeout"],
};

export class RetryPolicyRegistry {
  private policies = new Map<string, RetryPolicyDefinition>();

  constructor() {
    this.register(DEFAULT_RETRY_POLICY);
    this.register(AGGRESSIVE_RETRY_POLICY);
    this.register(CONSERVATIVE_RETRY_POLICY);
  }

  register(policy: RetryPolicyDefinition): RetryPolicyDefinition {
    this.policies.set(policy.id, policy);
    return policy;
  }

  get(id: string): RetryPolicyDefinition | undefined {
    return this.policies.get(id);
  }

  getOrDefault(id?: string): RetryPolicyDefinition {
    return (id ? this.policies.get(id) : undefined) ?? this.policies.get(DEFAULT_RETRY_POLICY.id)!;
  }

  list(): RetryPolicyDefinition[] {
    return Array.from(this.policies.values());
  }

  count(): number {
    return this.policies.size;
  }

  /** Real backoff math: fixed/linear/exponential, capped at `maxDelayMs`. `attempt` is 1-indexed (first retry = 1). */
  computeDelayMs(policy: RetryPolicyDefinition, attempt: number): number {
    let delay: number;
    switch (policy.strategy) {
      case "fixed":
        delay = policy.initialDelayMs;
        break;
      case "linear":
        delay = policy.initialDelayMs * attempt;
        break;
      case "exponential":
      default:
        delay = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
        break;
    }
    return Math.min(delay, policy.maxDelayMs);
  }

  isRetryable(policy: RetryPolicyDefinition, category: FailureCategory, attempt: number): boolean {
    if (attempt > policy.maxRetries) return false;
    if (policy.abortCategories.includes(category)) return false;
    return policy.retryableCategories.includes(category);
  }
}

export const retryPolicyRegistry = new RetryPolicyRegistry();
