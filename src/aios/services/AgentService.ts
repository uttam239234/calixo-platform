/**
 * Calixo Platform - Agent Service
 *
 * Manages AI agent lifecycle: register, update, activate, deactivate, delete.
 * Tracks agent executions with success/failure metrics.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  Agent, AgentExecution, AgentStatus, AIModel, AIProvider,
  PaginatedAgents,
} from '@/aios/types';
import { agentRegistry } from '@/aios/agents/AgentRegistry';
import type { AgentRepository, AgentExecutionRepository } from '@/aios/repositories/interfaces';
import { InMemoryAgentRepository, InMemoryAgentExecutionRepository } from '@/aios/repositories/implementations';

export class AgentService {
  private agentRepo: AgentRepository;
  private executionRepo: AgentExecutionRepository;

  constructor(
    agentRepo?: AgentRepository,
    executionRepo?: AgentExecutionRepository,
  ) {
    this.agentRepo = agentRepo || new InMemoryAgentRepository();
    this.executionRepo = executionRepo || new InMemoryAgentExecutionRepository();
  }

  async getAgent(id: string): Promise<Agent> {
    const agent = await this.agentRepo.getById(id);
    if (!agent) throw new NotFoundError('Agent');
    return agent;
  }

  async getAgentByName(name: string): Promise<Agent> {
    const agent = await this.agentRepo.getByName(name);
    if (!agent) throw new NotFoundError('Agent');
    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.agentRepo.getAll();
  }

  async getActiveAgents(): Promise<Agent[]> {
    return this.agentRepo.getActive();
  }

  async getPaginatedAgents(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedAgents> {
    return this.agentRepo.getPaginated(params);
  }

  async registerAgent(params: {
    name: string;
    description: string;
    role: string;
    model: AIModel;
    provider: AIProvider;
    systemPrompt: string;
    tools?: string[];
    maxIterations?: number;
    metadata?: Record<string, unknown>;
  }): Promise<Agent> {
    if (!params.name || !params.name.trim()) {
      throw new ValidationError('Agent name is required');
    }

    const exists = await this.agentRepo.existsByName(params.name);
    if (exists) {
      throw new ValidationError(`Agent "${params.name}" already exists`);
    }

    const now = new Date().toISOString();
    const agent: Agent = {
      id: generateId(16),
      name: params.name,
      description: params.description,
      role: params.role,
      model: params.model,
      provider: params.provider,
      systemPrompt: params.systemPrompt,
      tools: params.tools || [],
      maxIterations: params.maxIterations || 5,
      status: 'active',
      isSystem: false,
      metadata: params.metadata,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.agentRepo.create(agent);
    appLogger.info('AgentService', `Agent registered: ${created.name}`);
    return created;
  }

  async updateAgent(id: string, updates: Partial<Pick<Agent, 'name' | 'description' | 'role' | 'model' | 'provider' | 'systemPrompt' | 'tools' | 'maxIterations' | 'metadata'>>): Promise<Agent> {
    const agent = await this.agentRepo.getById(id);
    if (!agent) throw new NotFoundError('Agent');
    if (agent.isSystem) throw new ValidationError('Cannot modify system agents');

    const updated = await this.agentRepo.update(id, updates);
    appLogger.info('AgentService', `Agent updated: ${updated.name}`);
    return updated;
  }

  async activateAgent(id: string): Promise<Agent> {
    const agent = await this.agentRepo.getById(id);
    if (!agent) throw new NotFoundError('Agent');

    const updated = await this.agentRepo.setStatus(id, 'active');
    appLogger.info('AgentService', `Agent activated: ${updated.name}`);
    return updated;
  }

  async deactivateAgent(id: string): Promise<Agent> {
    const agent = await this.agentRepo.getById(id);
    if (!agent) throw new NotFoundError('Agent');
    if (agent.isSystem) throw new ValidationError('Cannot deactivate system agents');

    const updated = await this.agentRepo.setStatus(id, 'inactive');
    appLogger.info('AgentService', `Agent deactivated: ${updated.name}`);
    return updated;
  }

  async deprecateAgent(id: string): Promise<Agent> {
    const agent = await this.agentRepo.getById(id);
    if (!agent) throw new NotFoundError('Agent');
    if (agent.isSystem) throw new ValidationError('Cannot deprecate system agents');

    const updated = await this.agentRepo.setStatus(id, 'deprecated');
    appLogger.info('AgentService', `Agent deprecated: ${updated.name}`);
    return updated;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const agent = await this.agentRepo.getById(id);
    if (!agent) throw new NotFoundError('Agent');
    if (agent.isSystem) throw new ValidationError('Cannot delete system agents');

    appLogger.info('AgentService', `Agent deleted: ${agent.name}`);
    return this.agentRepo.delete(id);
  }

  // Execution tracking

  async getExecution(id: string): Promise<AgentExecution> {
    const execution = await this.executionRepo.getById(id);
    if (!execution) throw new NotFoundError('AgentExecution');
    return execution;
  }

  async getExecutionsByAgent(agentId: string): Promise<AgentExecution[]> {
    return this.executionRepo.getByAgent(agentId);
  }

  async getExecutionsByUser(userId: string): Promise<AgentExecution[]> {
    return this.executionRepo.getByUser(userId);
  }

  async getAgentStats(agentId: string): Promise<{
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageLatency: number;
    totalTokens: number;
    totalCost: number;
  }> {
    const executions = await this.executionRepo.getByAgent(agentId);
    const completed = executions.filter(e => e.status === 'completed');
    const failed = executions.filter(e => e.status === 'failed');

    return {
      totalExecutions: executions.length,
      completedExecutions: completed.length,
      failedExecutions: failed.length,
      averageLatency: completed.length > 0
        ? completed.reduce((s, e) => s + e.latency, 0) / completed.length
        : 0,
      totalTokens: completed.reduce((s, e) => s + e.usage.totalTokens, 0),
      totalCost: completed.reduce((s, e) => s + e.usage.cost, 0),
    };
  }
}

export const agentService = new AgentService();