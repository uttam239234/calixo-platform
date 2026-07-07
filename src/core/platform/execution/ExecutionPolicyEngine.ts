/**
 * Calixo Platform - Execution Policy Platform
 *
 * Nothing in this codebase enforced organization/workspace quotas or
 * concurrency limits on background work before this. Quota enforcement
 * reuses Phase 6's `RateLimiter` (sliding-window counters) exactly as-is —
 * an execution quota is just another `RateLimitRule` scope, not a second
 * rate-limiting engine. Concurrency and execution windows are genuinely new
 * (nothing to reuse for those).
 */
import { rateLimiter } from "@/core/platform/api/RateLimiter";
import type { RateLimitRule } from "@/core/platform/api/types";
import type { ExecutionPolicyDefinition, ExecutionWindow, PolicyEvaluation, PolicyScope } from "./types";

const GLOBAL_DEFAULT_POLICY: ExecutionPolicyDefinition = {
  id: "global-default",
  scope: "global",
  priority: "medium",
  timeoutMs: 60_000,
  maxConcurrent: 50,
  quotaPerHour: 10_000,
  cancellable: true,
};

export class ExecutionPolicyEngine {
  private policies = new Map<string, ExecutionPolicyDefinition>();
  private concurrent = new Map<string, number>();

  constructor() {
    this.setPolicy(GLOBAL_DEFAULT_POLICY);
  }

  private key(scope: PolicyScope, scopeId?: string): string {
    return scopeId ? `${scope}:${scopeId}` : scope;
  }

  setPolicy(policy: ExecutionPolicyDefinition): ExecutionPolicyDefinition {
    this.policies.set(this.key(policy.scope, policy.scopeId), policy);
    return policy;
  }

  getPolicy(scope: PolicyScope, scopeId?: string): ExecutionPolicyDefinition | undefined {
    return this.policies.get(this.key(scope, scopeId));
  }

  /** Workspace policy wins over organization policy wins over the global default. */
  resolve(organizationId?: string, workspaceId?: string): ExecutionPolicyDefinition {
    return (
      (workspaceId ? this.policies.get(this.key("workspace", workspaceId)) : undefined) ??
      (organizationId ? this.policies.get(this.key("organization", organizationId)) : undefined) ??
      this.policies.get("global")!
    );
  }

  /** Enforces the execution window and hourly quota. Concurrency is a separate acquire/release pair since it must be held for the execution's duration, not checked once. */
  evaluate(organizationId?: string, workspaceId?: string): PolicyEvaluation {
    const policy = this.resolve(organizationId, workspaceId);

    if (policy.executionWindow && !this.withinWindow(policy.executionWindow)) {
      return { allowed: false, reason: "Outside configured execution window", policy };
    }

    if (policy.quotaPerHour) {
      const scope: RateLimitRule["scope"] = policy.scope === "global" ? "global" : policy.scope;
      const identifier = policy.scope === "workspace" ? workspaceId : policy.scope === "organization" ? organizationId : "global";
      if (identifier) {
        const rule: RateLimitRule = { scope, limit: policy.quotaPerHour, windowMs: 3_600_000 };
        const result = rateLimiter.check([rule], { [scope]: identifier } as Partial<Record<RateLimitRule["scope"], string>>);
        if (!result.allowed) {
          return { allowed: false, reason: `Hourly execution quota exceeded (${policy.quotaPerHour}/hr)`, policy };
        }
      }
    }

    return { allowed: true, policy };
  }

  private withinWindow(window: ExecutionWindow): boolean {
    const now = new Date();
    if (window.businessDaysOnly) {
      const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: window.timezone }).format(now);
      if (day === "Sat" || day === "Sun") return false;
    }
    const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: window.timezone }).format(now)) % 24;
    if (window.startHour <= window.endHour) {
      return hour >= window.startHour && hour < window.endHour;
    }
    return hour >= window.startHour || hour < window.endHour;
  }

  tryAcquireSlot(organizationId?: string, workspaceId?: string): boolean {
    const policy = this.resolve(organizationId, workspaceId);
    const key = this.key(policy.scope, policy.scopeId);
    const current = this.concurrent.get(key) ?? 0;
    if (current >= policy.maxConcurrent) return false;
    this.concurrent.set(key, current + 1);
    return true;
  }

  releaseSlot(organizationId?: string, workspaceId?: string): void {
    const policy = this.resolve(organizationId, workspaceId);
    const key = this.key(policy.scope, policy.scopeId);
    this.concurrent.set(key, Math.max(0, (this.concurrent.get(key) ?? 0) - 1));
  }

  list(): ExecutionPolicyDefinition[] {
    return Array.from(this.policies.values());
  }

  count(): number {
    return this.policies.size;
  }
}

export const executionPolicyEngine = new ExecutionPolicyEngine();
