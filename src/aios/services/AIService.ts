/**
 * Calixo Platform - AI Service
 *
 * Central AI service that orchestrates all AI operations through the
 * AIOrchestrator. This is the main entry point for AI capabilities
 * consumed by other modules.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  AICompletionRequest, AICompletionResponse, AIExecutionContext,
  AgentExecution, AIModel, AIProvider,
} from '@/aios/types';
import { aiOrchestrator } from '@/aios/orchestrator/AIOrchestrator';
import { agentRegistry } from '@/aios/agents/AgentRegistry';
import { contextEngine } from '@/aios/context/ContextEngine';
import { knowledgeEngine } from '@/aios/knowledge/KnowledgeEngine';
import { memoryEngine } from '@/aios/memory/MemoryEngine';
import { aiAnalytics } from '@/aios/analytics/AIAnalytics';
import { aiGuardrails } from '@/aios/guardrails/AIGuardrails';

export class AIService {
  /**
   * Process a chat completion request through the full AI pipeline.
   */
  async chat(request: AICompletionRequest, contextParams?: Parameters<typeof contextEngine.buildContext>[0]): Promise<AICompletionResponse> {
    const context = contextParams ? await contextEngine.buildContext(contextParams) : undefined;

    // Retrieve relevant knowledge context if organization is provided
    let enhancedMessages = [...request.messages];
    if (context?.organizationId) {
      const lastMessage = request.messages[request.messages.length - 1];
      const knowledgeContext = await knowledgeEngine.retrieveContext({
        organizationId: context.organizationId,
        query: lastMessage?.content || '',
      });
      if (knowledgeContext) {
        enhancedMessages = [
          ...request.messages.slice(0, -1),
          {
            id: generateId(16),
            role: 'system',
            content: knowledgeContext,
            timestamp: new Date().toISOString(),
          },
          lastMessage,
        ].filter(Boolean) as typeof request.messages;
      }
    }

    return aiOrchestrator.execute({ ...request, messages: enhancedMessages }, context);
  }

  /**
   * Process a request with tool calling support (agentic loop).
   */
  async chatWithTools(request: AICompletionRequest, contextParams?: Parameters<typeof contextEngine.buildContext>[0]): Promise<AICompletionResponse> {
    const context = contextParams ? await contextEngine.buildContext(contextParams) : undefined;
    return aiOrchestrator.executeWithTools(request, context);
  }

  /**
   * Generate AI content using a specific prompt template.
   */
  async generateContent(promptKey: string, variables: Record<string, unknown>, contextParams?: Parameters<typeof contextEngine.buildContext>[0]): Promise<AICompletionResponse> {
    const { promptLibrary } = await import('@/aios/prompts/PromptLibrary');
    const prompt = await promptLibrary.getByKey(promptKey);
    if (!prompt) throw new NotFoundError('Prompt');
    const content = promptLibrary.render(prompt, variables);

    const request: AICompletionRequest = {
      messages: [{ id: generateId(16), role: 'user', content, timestamp: new Date().toISOString() }],
    };
    return this.chat(request, contextParams);
  }

  /**
   * Execute a specific agent with input.
   */
  async executeAgent(agentName: string, input: string, userId: string, organizationId?: string): Promise<AgentExecution> {
    const agent = agentRegistry.getAgentByName(agentName);
    if (!agent) throw new NotFoundError('Agent');

    const execution = await agentRegistry.createExecution({
      agentId: agent.id,
      userId,
      organizationId,
      input,
    });

    try {
      const response = await this.chat({
        messages: [
          { id: generateId(16), role: 'system', content: agent.systemPrompt, timestamp: new Date().toISOString() },
          { id: generateId(16), role: 'user', content: input, timestamp: new Date().toISOString() },
        ],
      });

      return agentRegistry.completeExecution(
        execution.id,
        response.message.content,
        response.usage,
        response.latency,
      );
    } catch (error) {
      return agentRegistry.failExecution(execution.id, (error as Error).message);
    }
  }

  /**
   * Get AI analytics summary for an organization.
   */
  async getAnalytics(organizationId: string, periodStart?: string, periodEnd?: string) {
    return aiAnalytics.getSummary(organizationId, periodStart, periodEnd);
  }

  /**
   * Get rate limit status for a user.
   */
  async checkRateLimit(userId: string) {
    return aiGuardrails.checkRateLimit(userId);
  }

  /**
   * Search knowledge base and return relevant documents.
   */
  async searchKnowledge(organizationId: string, query: string, limit?: number) {
    return knowledgeEngine.search({ organizationId, query, limit });
  }

  /**
   * Retrieve conversation memory for a session.
   */
  async getConversationMemory(sessionId: string) {
    return memoryEngine.getConversation(sessionId);
  }

  /**
   * Get available models for an organization.
   */
  async getAvailableModels(organizationId?: string) {
    const { modelRegistry } = await import('@/aios/models/ModelRegistry');
    return modelRegistry.getActiveModels();
  }

  /**
   * Get available agents.
   */
  async getAvailableAgents() {
    return agentRegistry.getActiveAgents();
  }
}

export const aiService = new AIService();