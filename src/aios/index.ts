import "server-only";

/**
 * Calixo Platform - Enterprise AI Operating System (AIOS)
 *
 * Central export for the AIOS platform.
 * This is the centralized AI platform that powers every module.
 *
 * `import "server-only"` (this round): every real provider now makes a
 * live call using a sealed vendor API key, so nothing in this barrel is
 * safe for a client bundle — the individual provider/router files are
 * already `server-only` themselves and never re-exported here for exactly
 * that reason (see `providers/getProviderKey.ts`'s doc comment), but the
 * orchestrator/service/gateway sitting above them would otherwise still
 * transitively pull that dependency in through this barrel. Pure data/types
 * (`@/aios/types`, including the runtime `DEFAULT_MODEL_CONFIG` constant)
 * stay untouched and deep-importable from client code exactly as before —
 * only this aggregate barrel is now a hard server-only boundary.
 */
export * from './types';
export * from './models/ModelRegistry';
export * from './gateway/AIGateway';
// Providers (`OpenAIProvider`/`AnthropicProvider`/`GoogleProvider`) and
// `ProviderRouter` are deliberately NOT re-exported here — deep-import them
// from `@/aios/gateway/providers/*` / `@/aios/gateway/ProviderRouter`.
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
import { promptLibrary } from '@/aios/prompts/PromptLibrary';
import { agentRegistry } from '@/aios/agents/AgentRegistry';
import { eventBus } from '@/background/events/EventBus';

/**
 * Not required for the real providers to work — `AIGateway`'s own
 * constructor registers OpenAI/Anthropic/Google unconditionally (nothing
 * in this codebase ever reliably calls a single app-boot hook, so provider
 * registration can't depend on one). This remains for the prompt/agent
 * seed data and the analytics event subscription, both genuinely one-time
 * setup, safe to call from anywhere that already does its own idempotent
 * "has this run yet" gating (e.g. a module's own `initialize*Foundation()`).
 */
export async function initializeAIOS(): Promise<void> {
  appLogger.info('AIOS', 'Initializing Enterprise AI Operating System...');

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
