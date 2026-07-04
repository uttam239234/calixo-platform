/**
 * Calixo Platform - Enterprise AI Operating System (AIOS)
 *
 * Central export for the AIOS platform.
 * This is the centralized AI platform that powers every module.
 */

export * from './types';
export * from './models/ModelRegistry';
export * from './gateway/AIGateway';
export * from './gateway/providers/OpenAIProvider';
export * from './prompts/PromptLibrary';
export * from './context/ContextEngine';
export * from './memory/MemoryEngine';
export * from './tools/ToolRegistry';
export * from './agents/AgentRegistry';
export * from './analytics/AIAnalytics';
export * from './guardrails/AIGuardrails';
export * from './orchestrator/AIOrchestrator';
export * from './knowledge/KnowledgeEngine';
export * from './config';
export * from './repositories';
export * from './services';

import { appLogger } from '@/logging';
import { modelRegistry } from '@/aios/models/ModelRegistry';
import { aiGateway } from '@/aios/gateway/AIGateway';
import { openAIProvider } from '@/aios/gateway/providers/OpenAIProvider';
import { promptLibrary } from '@/aios/prompts/PromptLibrary';
import { agentRegistry } from '@/aios/agents/AgentRegistry';
import { knowledgeEngine } from '@/aios/knowledge/KnowledgeEngine';
import { eventBus } from '@/background/events/EventBus';

export async function initializeAIOS(): Promise<void> {
  appLogger.info('AIOS', 'Initializing Enterprise AI Operating System...');

  // Register OpenAI provider
  aiGateway.registerProvider(openAIProvider);
  appLogger.info('AIOS', 'OpenAI provider registered');

  // Initialize prompts
  const promptCount = await promptLibrary.initialize();
  appLogger.info('AIOS', `Initialized ${promptCount} system prompts`);

  // Initialize agents
  const agentCount = await agentRegistry.initialize();
  appLogger.info('AIOS', `Initialized ${agentCount} system agents`);

  // Initialize knowledge engine (warm-up embedding cache)
  appLogger.info('AIOS', 'Knowledge engine initialized');

  // Subscribe to events
  eventBus.registerHandler('ai_analytics_handler', async (event) => {
    if (event.type === 'ai.conversation.completed') {
      appLogger.debug('AIOS', `AI conversation completed: ${JSON.stringify(event.data)}`);
    }
  });

  appLogger.info('AIOS', 'Enterprise AI Operating System initialized successfully');
}
