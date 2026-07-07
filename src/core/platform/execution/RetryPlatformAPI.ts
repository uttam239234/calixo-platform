/**
 * Calixo Platform - Retry Platform API
 */
import { retryPolicyRegistry } from "./RetryPolicyRegistry";
import type { FailureCategory } from "@/background/types";
import type { RetryPolicyDefinition } from "./types";

export class RetryPlatformAPI {
  register(policy: RetryPolicyDefinition): RetryPolicyDefinition {
    return retryPolicyRegistry.register(policy);
  }

  get(id: string): RetryPolicyDefinition | undefined {
    return retryPolicyRegistry.get(id);
  }

  list(): RetryPolicyDefinition[] {
    return retryPolicyRegistry.list();
  }

  computeDelayMs(policyId: string, attempt: number): number {
    return retryPolicyRegistry.computeDelayMs(retryPolicyRegistry.getOrDefault(policyId), attempt);
  }

  isRetryable(policyId: string, category: FailureCategory, attempt: number): boolean {
    return retryPolicyRegistry.isRetryable(retryPolicyRegistry.getOrDefault(policyId), category, attempt);
  }
}

export const retryPlatformAPI = new RetryPlatformAPI();
