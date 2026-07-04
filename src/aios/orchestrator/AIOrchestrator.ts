/**
 * Calixo Platform - AI Orchestrator
 *
 * Execution pipeline that coordinates AI requests through guardrails,
 * context injection, prompt rendering, gateway calls, analytics, and memory.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type {
  AICompletionRequest, AICompletionResponse, AIExecutionContext, AIMessage,
  AIExecutionPlan, AIExecutionStep, TokenUsage,
} from '@/aios/types';
import { DEFAULT_MODEL_CONFIG } from '@/aios/types';
import { aiGateway } from '@/aios/gateway/AIGateway';
import { aiGuardrails } from '@/aios/guardrails/AIGuardrails';
import { aiAnalytics } from '@/aios/analytics/AIAnalytics';
import { contextEngine } from '@/aios/context/ContextEngine';
import { memoryEngine } from '@/aios/memory/MemoryEngine';
import { promptLibrary } from '@/aios/prompts/PromptLibrary';
import { toolRegistry } from '@/aios/tools/ToolRegistry';
import { eventBus } from '@/background/events/EventBus';

export class AIOrchestrator {
  async execute(request: AICompletionRequest, context?: AIExecutionContext): Promise<AICompletionResponse> {
    // 1. Guardrails check
    const guardrailResults = await aiGuardrails.validateAll(request);
    const blocked = guardrailResults.find(r => r.action === 'block');
    if (blocked) {
      throw new Error(`Request blocked by guardrail: ${blocked.type} - ${blocked.reason}`);
    }

    // 2. Inject context
    const contextMessages = context ? [
      {
        id: generateId(16),
        role: 'system' as const,
        content: contextEngine.contextToSystemMessage(context),
        timestamp: new Date().toISOString(),
      } as AIMessage,
      ...request.messages,
    ] : request.messages;

    // 3. Execute via gateway
    const startTime = Date.now();
    const response = await aiGateway.complete({ ...request, messages: contextMessages });
    const latency = Date.now() - startTime;

    // 4. Store in memory
    if (request.sessionId) {
      await memoryEngine.storeConversation({
        sessionId: request.sessionId,
        userId: request.userId || 'anonymous',
        organizationId: request.organizationId,
        workspaceId: request.workspaceId,
        messages: [...contextMessages, response.message],
      });
    }

    // 5. Record analytics
    await aiAnalytics.record({
      userId: request.userId,
      organizationId: request.organizationId,
      workspaceId: request.workspaceId,
      model: response.model,
      provider: response.provider,
      action: 'chat',
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      cost: response.usage.cost,
      latency,
      success: true,
      toolCalls: request.tools?.length || 0,
      sessionId: request.sessionId,
      module: context?.module,
      feature: context?.feature,
    });

    // 6. Publish event
    await eventBus.publish({
      type: 'ai.conversation.completed',
      source: 'aios',
      status: 'pending' as const,
      data: {
        model: response.model,
        provider: response.provider,
        tokens: response.usage.totalTokens,
        cost: response.usage.cost,
        latency,
        sessionId: request.sessionId,
      },
      organizationId: request.organizationId,
      userId: request.userId,
      correlationId: request.sessionId,
    });

    return response;
  }

  async executeWithTools(request: AICompletionRequest, context?: AIExecutionContext): Promise<AICompletionResponse> {
    let currentMessages = [...request.messages];
    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      const response = await this.execute({ ...request, messages: currentMessages }, context);
      const toolCalls = response.message.toolCalls;

      if (!toolCalls || toolCalls.length === 0) {
        return response;
      }

      // Execute tool calls
      currentMessages = [...currentMessages, response.message];
      for (const toolCall of toolCalls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await toolRegistry.execute(toolCall.function.name, args);
        currentMessages = [...currentMessages, {
          id: generateId(16),
          role: 'tool',
          content: JSON.stringify(result),
          toolCallId: toolCall.id,
          timestamp: new Date().toISOString(),
        }];
      }

      iterations++;
    }

    // Final response after all tool calls
    return this.execute({ ...request, messages: currentMessages }, context);
  }

  async createExecutionPlan(context: AIExecutionContext, goal: string): Promise<AIExecutionPlan> {
    const plan: AIExecutionPlan = {
      id: generateId(16),
      steps: [
        {
          id: generateId(16),
          type: 'prompt',
          config: { promptKey: 'system.default', variables: { goal } },
          dependsOn: [],
          status: 'pending',
        },
        {
          id: generateId(16),
          type: 'memory',
          config: { action: 'recall', scope: 'user', key: 'preferences' },
          dependsOn: [],
          status: 'pending',
        },
      ],
      context,
    };
    return plan;
  }
}

export const aiOrchestrator = new AIOrchestrator();