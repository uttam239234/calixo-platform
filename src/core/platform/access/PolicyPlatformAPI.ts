/**
 * Calixo Platform - Policy Platform API
 *
 * Wraps `policyService` (`src/access`, unmodified) and adds what it never
 * had: `PolicyCreated`/`PolicyUpdated`/`PolicyDeleted` platform events and
 * permission-cache invalidation (policies affect authorization outcomes,
 * so a policy change must invalidate cached permission sets).
 */
import { policyService } from "@/access/services/PolicyService";
import type { CreatePolicyRequest, Policy, UpdatePolicyRequest } from "@/access/types";
import { platformEventBus } from "../events/PlatformEventBus";
import { permissionCache } from "./PermissionCache";

export class PolicyPlatformAPI {
  async getAllPolicies(): Promise<Policy[]> {
    return policyService.getAllPolicies();
  }

  async getPoliciesByType(type: string): Promise<Policy[]> {
    return policyService.getPoliciesByType(type);
  }

  async createPolicy(data: CreatePolicyRequest, actorId: string): Promise<Policy> {
    const policy = await policyService.createPolicy(data);
    this.invalidateScope(policy);
    void platformEventBus.publish({ type: "PolicyCreated", userId: actorId, payload: { policyId: policy.id, name: policy.name, type: policy.type } });
    return policy;
  }

  async updatePolicy(id: string, data: UpdatePolicyRequest, actorId: string): Promise<Policy> {
    const policy = await policyService.updatePolicy(id, data);
    this.invalidateScope(policy);
    void platformEventBus.publish({ type: "PolicyUpdated", userId: actorId, payload: { policyId: policy.id } });
    return policy;
  }

  async enablePolicy(id: string, actorId: string): Promise<Policy> {
    const policy = await policyService.enablePolicy(id);
    this.invalidateScope(policy);
    void platformEventBus.publish({ type: "PolicyUpdated", userId: actorId, payload: { policyId: policy.id } });
    return policy;
  }

  async disablePolicy(id: string, actorId: string): Promise<Policy> {
    const policy = await policyService.disablePolicy(id);
    this.invalidateScope(policy);
    void platformEventBus.publish({ type: "PolicyUpdated", userId: actorId, payload: { policyId: policy.id } });
    return policy;
  }

  async deletePolicy(id: string, actorId: string): Promise<boolean> {
    const policy = await policyService.getPolicy(id).catch(() => null);
    const result = await policyService.deletePolicy(id);
    if (policy) this.invalidateScope(policy);
    void platformEventBus.publish({ type: "PolicyDeleted", userId: actorId, payload: { policyId: id } });
    return result;
  }

  async assignPolicyToEntity(policyId: string, entityType: string, entityId: string) {
    return policyService.assignPolicyToEntity(policyId, entityType, entityId);
  }

  private invalidateScope(policy: Policy): void {
    for (const organizationId of policy.scope.organizationIds ?? []) {
      permissionCache.invalidateOrganization(organizationId);
    }
    for (const userId of policy.scope.userIds ?? []) {
      permissionCache.invalidateUser(userId);
    }
  }
}

export const policyPlatformAPI = new PolicyPlatformAPI();
