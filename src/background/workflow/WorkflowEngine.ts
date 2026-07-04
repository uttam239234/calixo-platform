/**
 * Calixo Platform - Workflow Engine
 *
 * Reusable workflow architecture supporting triggers, conditions,
 * actions, execution history, and state management.
 * This sprint builds the engine only - no workflow UI.
 */

import { appLogger } from '@/logging';
import type {
  Workflow, WorkflowCondition, WorkflowAction,
  Execution, ExecutionLog,
} from '@/background/types';
import type { WorkflowRepository, ExecutionRepository } from '@/background/repositories/interfaces';
import { InMemoryWorkflowRepository, InMemoryExecutionRepository } from '@/background/repositories/implementations';
import { queueEngine } from '@/background/queue/QueueEngine';
import { eventBus } from '@/background/events/EventBus';

export class WorkflowEngine {
  private workflowRepo: WorkflowRepository;
  private executionRepo: ExecutionRepository;

  constructor(
    workflowRepo?: WorkflowRepository,
    executionRepo?: ExecutionRepository
  ) {
    this.workflowRepo = workflowRepo || new InMemoryWorkflowRepository();
    this.executionRepo = executionRepo || new InMemoryExecutionRepository();
  }

  async createWorkflow(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const workflow = await this.workflowRepo.create(data);
    appLogger.info('WorkflowEngine', `Workflow created: ${workflow.name} (${workflow.id})`);
    return workflow;
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
    return this.workflowRepo.update(id, data);
  }

  async activateWorkflow(id: string): Promise<Workflow> {
    return this.workflowRepo.activate(id);
  }

  async pauseWorkflow(id: string): Promise<Workflow> {
    return this.workflowRepo.pause(id);
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflowRepo.delete(id);
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    return this.workflowRepo.getById(id);
  }

  async getWorkflowsByOrganization(organizationId: string): Promise<Workflow[]> {
    return this.workflowRepo.getByOrganization(organizationId);
  }

  async getActiveWorkflows(): Promise<Workflow[]> {
    return this.workflowRepo.getByStatus('active');
  }

  // ============================================================================
  // Execution
  // ============================================================================

  async executeWorkflow(workflowId: string, input: Record<string, unknown>, context?: {
    organizationId?: string;
    workspaceId?: string;
    userId?: string;
  }): Promise<Execution> {
    const workflow = await this.workflowRepo.getById(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    if (workflow.status !== 'active') throw new Error('Workflow is not active');

    // Create execution record
    const execution = await this.executionRepo.create({
      workflowId: workflow.id,
      worker: `workflow:${workflow.name}`,
      status: 'running',
      input,
      retryCount: 0,
      maxRetries: 3,
      organizationId: context?.organizationId,
      workspaceId: context?.workspaceId,
      userId: context?.userId,
      startedAt: new Date().toISOString(),
    });

    // Add start log
    await this.executionRepo.addLog(execution.id, {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Workflow '${workflow.name}' execution started`,
    });

    try {
      // Evaluate conditions
      if (workflow.conditions.length > 0) {
        const conditionsMet = this.evaluateConditions(workflow.conditions, input);
        if (!conditionsMet) {
          await this.executionRepo.addLog(execution.id, {
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: 'Workflow conditions not met, skipping execution',
          });
          return this.executionRepo.complete(execution.id, { skipped: true, reason: 'conditions_not_met' }, 0);
        }
      }

      // Execute actions in order
      const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);
      const results: Record<string, unknown> = {};

      for (const action of sortedActions) {
        await this.executionRepo.addLog(execution.id, {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Executing action: ${action.name} (${action.type})`,
        });

        try {
          const result = await this.executeAction(action, input, results);
          results[action.name] = result;
        } catch (error) {
          const errMsg = (error as Error).message;
          await this.executionRepo.addLog(execution.id, {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Action '${action.name}' failed: ${errMsg}`,
          });

          if (action.onFailure === 'abort') {
            throw error;
          }
          if (action.onFailure === 'retry') {
            // Enqueue retry job
            await queueEngine.enqueue({
              type: 'immediate',
              name: `workflow:retry:${workflow.name}:${action.name}`,
              worker: 'workflow',
              payload: { workflowId, action, input, results },
            });
          }
          // 'continue' - just log and move on
        }
      }

      const duration = Date.now() - new Date(execution.startedAt || execution.createdAt).getTime();

      await this.executionRepo.addLog(execution.id, {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Workflow '${workflow.name}' execution completed`,
        data: { duration },
      });

      return this.executionRepo.complete(execution.id, results, duration);
    } catch (error) {
      const errMsg = (error as Error).message;
      await this.executionRepo.addLog(execution.id, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Workflow execution failed: ${errMsg}`,
      });

      return this.executionRepo.fail(execution.id, {
        message: errMsg,
        category: 'transient',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private evaluateConditions(conditions: WorkflowCondition[], input: Record<string, unknown>): boolean {
    return conditions.every(condition => {
      const value = input[condition.field];
      switch (condition.operator) {
        case 'eq': return value === condition.value;
        case 'neq': return value !== condition.value;
        case 'gt': return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value;
        case 'gte': return typeof value === 'number' && typeof condition.value === 'number' && value >= condition.value;
        case 'lt': return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value;
        case 'lte': return typeof value === 'number' && typeof condition.value === 'number' && value <= condition.value;
        case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
        case 'contains': return typeof value === 'string' && typeof condition.value === 'string' && value.includes(condition.value);
        case 'exists': return value !== undefined && value !== null;
        default: return false;
      }
    });
  }

  private async executeAction(
    action: WorkflowAction,
    input: Record<string, unknown>,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    switch (action.type) {
      case 'create_job': {
        const cfg = action.config as Record<string, unknown>;
        const job = await queueEngine.enqueue({
          type: (cfg.priority as 'immediate' | 'background') || 'immediate',
          name: (cfg.name as string) || `workflow:action:${action.name}`,
          worker: (cfg.worker as string) || 'default',
          payload: { ...(cfg.payload as Record<string, unknown> || {}), ...input, ...previousResults },
          organizationId: cfg.organizationId as string,
          workspaceId: cfg.workspaceId as string,
        });
        return { jobId: job.id };
      }

      case 'publish_event': {
        const cfg = action.config as Record<string, unknown>;
        const event = await eventBus.publish({
          type: cfg.eventType as string,
          source: 'workflow',
          status: 'pending' as const,
          data: { ...(cfg.data as Record<string, unknown> || {}), ...input, ...previousResults },
          organizationId: cfg.organizationId as string,
          userId: cfg.userId as string,
        });
        return { eventId: event.id };
      }

      case 'delay': {
        const cfg = action.config as Record<string, unknown>;
        const delayMs = (cfg.duration as number) || 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return { delayed: delayMs };
      }

      case 'transform': {
        const cfg = action.config as Record<string, unknown>;
        const transformFn = cfg.transform as string;
        if (transformFn === 'merge') {
          return { ...input, ...previousResults, ...(cfg.data as Record<string, unknown> || {}) };
        }
        return (cfg.data as Record<string, unknown>) || input;
      }

      default:
        appLogger.warn('WorkflowEngine', `Unknown action type: ${action.type}`);
        return null;
    }
  }

  async getExecution(id: string): Promise<Execution | null> {
    return this.executionRepo.getById(id);
  }

  async getWorkflowExecutions(workflowId: string): Promise<Execution[]> {
    return this.executionRepo.getByWorkflow(workflowId);
  }

  async getExecutionLogs(executionId: string): Promise<ExecutionLog[]> {
    const exec = await this.executionRepo.getById(executionId);
    return exec?.logs || [];
  }
}

export const workflowEngine = new WorkflowEngine();