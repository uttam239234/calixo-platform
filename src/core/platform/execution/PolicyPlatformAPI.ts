/**
 * Calixo Platform - Execution Policy Platform API
 *
 * Named `ExecutionPolicyPlatformAPI` (not `PolicyPlatformAPI`) — the Access
 * Control Platform (Phase 3) already exports a `PolicyPlatformAPI` for
 * ABAC/business policies; this is a different concept (execution
 * quotas/concurrency/windows) and needed a distinct name to avoid a barrel
 * export collision in `core/platform/index.ts`.
 */
import { executionPolicyEngine } from "./ExecutionPolicyEngine";
import type { ExecutionPolicyDefinition, PolicyEvaluation, PolicyScope } from "./types";

export class ExecutionPolicyPlatformAPI {
  setPolicy(policy: ExecutionPolicyDefinition): ExecutionPolicyDefinition {
    return executionPolicyEngine.setPolicy(policy);
  }

  getPolicy(scope: PolicyScope, scopeId?: string): ExecutionPolicyDefinition | undefined {
    return executionPolicyEngine.getPolicy(scope, scopeId);
  }

  resolve(organizationId?: string, workspaceId?: string): ExecutionPolicyDefinition {
    return executionPolicyEngine.resolve(organizationId, workspaceId);
  }

  evaluate(organizationId?: string, workspaceId?: string): PolicyEvaluation {
    return executionPolicyEngine.evaluate(organizationId, workspaceId);
  }

  list(): ExecutionPolicyDefinition[] {
    return executionPolicyEngine.list();
  }
}

export const executionPolicyPlatformAPI = new ExecutionPolicyPlatformAPI();
