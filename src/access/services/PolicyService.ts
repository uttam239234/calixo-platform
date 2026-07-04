/**
 * Calixo Platform - Policy Service
 *
 * Manages policy lifecycle: create, update, enable, disable, delete.
 * Policies define access rules for organizations, workspaces, teams, features, and subscriptions.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import type { Policy, CreatePolicyRequest, UpdatePolicyRequest, PolicyAssignment, PaginatedPolicies } from '@/access/types';
import type { PolicyRepository, PolicyAssignmentRepository } from '@/access/repositories/interfaces';
import { InMemoryPolicyRepository, InMemoryPolicyAssignmentRepository } from '@/access/repositories/implementations';

export class PolicyService {
  private policyRepo: PolicyRepository;
  private assignmentRepo: PolicyAssignmentRepository;

  constructor(
    policyRepo?: PolicyRepository,
    assignmentRepo?: PolicyAssignmentRepository
  ) {
    this.policyRepo = policyRepo || new InMemoryPolicyRepository();
    this.assignmentRepo = assignmentRepo || new InMemoryPolicyAssignmentRepository();
  }

  async getPolicy(id: string): Promise<Policy> {
    const policy = await this.policyRepo.getById(id);
    if (!policy) throw new NotFoundError('Policy');
    return policy;
  }

  async getAllPolicies(): Promise<Policy[]> {
    return this.policyRepo.getAll();
  }

  async getPoliciesByType(type: string): Promise<Policy[]> {
    return this.policyRepo.getByType(type);
  }

  async getEnabledPolicies(): Promise<Policy[]> {
    return this.policyRepo.getEnabled();
  }

  async getPaginatedPolicies(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    isEnabled?: boolean;
  }): Promise<PaginatedPolicies> {
    return this.policyRepo.getPaginated(params);
  }

  async createPolicy(data: CreatePolicyRequest): Promise<Policy> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Policy name is required');
    }
    if (!data.type) {
      throw new ValidationError('Policy type is required');
    }
    if (!data.effect) {
      throw new ValidationError('Policy effect is required');
    }
    if (!data.scope) {
      throw new ValidationError('Policy scope is required');
    }

    appLogger.info('PolicyService', `Policy created: ${data.name}`);
    return this.policyRepo.create(data);
  }

  async updatePolicy(id: string, data: UpdatePolicyRequest): Promise<Policy> {
    const policy = await this.policyRepo.getById(id);
    if (!policy) throw new NotFoundError('Policy');
    return this.policyRepo.update(id, data);
  }

  async enablePolicy(id: string): Promise<Policy> {
    const policy = await this.policyRepo.getById(id);
    if (!policy) throw new NotFoundError('Policy');
    appLogger.info('PolicyService', `Policy enabled: ${policy.name} (${id})`);
    return this.policyRepo.enable(id);
  }

  async disablePolicy(id: string): Promise<Policy> {
    const policy = await this.policyRepo.getById(id);
    if (!policy) throw new NotFoundError('Policy');
    appLogger.info('PolicyService', `Policy disabled: ${policy.name} (${id})`);
    return this.policyRepo.disable(id);
  }

  async deletePolicy(id: string): Promise<boolean> {
    const policy = await this.policyRepo.getById(id);
    if (!policy) throw new NotFoundError('Policy');
    appLogger.info('PolicyService', `Policy deleted: ${policy.name} (${id})`);
    return this.policyRepo.delete(id);
  }

  // ============================================================================
  // Policy Assignments
  // ============================================================================

  async assignPolicyToEntity(policyId: string, entityType: string, entityId: string): Promise<PolicyAssignment> {
    const policy = await this.policyRepo.getById(policyId);
    if (!policy) throw new NotFoundError('Policy');

    const alreadyAssigned = await this.assignmentRepo.isAssigned(policyId, entityType, entityId);
    if (alreadyAssigned) {
      throw new ValidationError('Policy is already assigned to this entity');
    }

    appLogger.info('PolicyService', `Policy ${policyId} assigned to ${entityType} ${entityId}`);
    return this.assignmentRepo.assign(policyId, entityType, entityId);
  }

  async removePolicyFromEntity(policyId: string, entityType: string, entityId: string): Promise<boolean> {
    appLogger.info('PolicyService', `Policy ${policyId} removed from ${entityType} ${entityId}`);
    return this.assignmentRepo.removeByPolicyAndEntity(policyId, entityType, entityId);
  }

  async getEntityPolicies(entityType: string, entityId: string): Promise<PolicyAssignment[]> {
    return this.assignmentRepo.getByEntity(entityType, entityId);
  }

  async getPolicyAssignments(policyId: string): Promise<PolicyAssignment[]> {
    return this.assignmentRepo.getByPolicy(policyId);
  }
}

export const policyService = new PolicyService();