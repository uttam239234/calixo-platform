/**
 * Calixo Platform - Model Registry
 *
 * Central registry for AI models with provider abstraction.
 * No business logic depends directly on a provider SDK.
 */

import { appLogger } from '@/logging';
import type { AIModel, AIProvider, ModelDefinition, ModelCapability, ModelConfig } from '@/aios/types';

export const MODEL_REGISTRY_DEFINITIONS: ModelDefinition[] = [
  // OpenAI Models
  {
    id: 'openai-gpt-4o', model: 'gpt-4o', provider: 'openai',
    displayName: 'GPT-4o', description: 'OpenAI GPT-4o - fastest, most affordable flagship model',
    capabilities: ['chat', 'completion', 'function_calling', 'vision', 'streaming'],
    maxTokens: 128000, costPer1KPrompt: 0.0025, costPer1KCompletion: 0.01,
    isActive: true, isExperimental: false,
  },
  {
    id: 'openai-gpt-4o-mini', model: 'gpt-4o-mini', provider: 'openai',
    displayName: 'GPT-4o Mini', description: 'OpenAI GPT-4o Mini - cost-efficient, high-speed',
    capabilities: ['chat', 'completion', 'function_calling', 'streaming'],
    maxTokens: 128000, costPer1KPrompt: 0.00015, costPer1KCompletion: 0.0006,
    isActive: true, isExperimental: false,
  },
  {
    id: 'openai-gpt-4-turbo', model: 'gpt-4-turbo', provider: 'openai',
    displayName: 'GPT-4 Turbo', description: 'OpenAI GPT-4 Turbo - high quality, slower',
    capabilities: ['chat', 'completion', 'function_calling', 'vision', 'streaming'],
    maxTokens: 128000, costPer1KPrompt: 0.01, costPer1KCompletion: 0.03,
    isActive: true, isExperimental: false,
  },
  {
    id: 'openai-gpt-3.5-turbo', model: 'gpt-3.5-turbo', provider: 'openai',
    displayName: 'GPT-3.5 Turbo', description: 'OpenAI GPT-3.5 Turbo - legacy, cost-effective',
    capabilities: ['chat', 'completion', 'function_calling', 'streaming'],
    maxTokens: 16384, costPer1KPrompt: 0.0005, costPer1KCompletion: 0.0015,
    isActive: true, isExperimental: false,
  },

  // Anthropic Models (prepared)
  {
    id: 'anthropic-claude-3-opus', model: 'claude-3-opus', provider: 'anthropic',
    displayName: 'Claude 3 Opus', description: 'Anthropic Claude 3 Opus - most powerful',
    capabilities: ['chat', 'completion', 'function_calling', 'vision', 'streaming'],
    maxTokens: 200000, costPer1KPrompt: 0.015, costPer1KCompletion: 0.075,
    isActive: false, isExperimental: true,
  },
  {
    id: 'anthropic-claude-3-sonnet', model: 'claude-3-sonnet', provider: 'anthropic',
    displayName: 'Claude 3 Sonnet', description: 'Anthropic Claude 3 Sonnet - balanced',
    capabilities: ['chat', 'completion', 'function_calling', 'vision', 'streaming'],
    maxTokens: 200000, costPer1KPrompt: 0.003, costPer1KCompletion: 0.015,
    isActive: false, isExperimental: true,
  },
  {
    id: 'anthropic-claude-3-haiku', model: 'claude-3-haiku', provider: 'anthropic',
    displayName: 'Claude 3 Haiku', description: 'Anthropic Claude 3 Haiku - fastest, cheapest',
    capabilities: ['chat', 'completion', 'function_calling', 'streaming'],
    maxTokens: 200000, costPer1KPrompt: 0.00025, costPer1KCompletion: 0.00125,
    isActive: false, isExperimental: true,
  },

  // Google Models (prepared)
  {
    id: 'google-gemini-pro', model: 'gemini-pro', provider: 'google',
    displayName: 'Gemini Pro', description: 'Google Gemini Pro - versatile',
    capabilities: ['chat', 'completion', 'function_calling', 'streaming'],
    maxTokens: 32768, costPer1KPrompt: 0.000125, costPer1KCompletion: 0.000375,
    isActive: false, isExperimental: true,
  },
  {
    id: 'google-gemini-ultra', model: 'gemini-ultra', provider: 'google',
    displayName: 'Gemini Ultra', description: 'Google Gemini Ultra - most capable',
    capabilities: ['chat', 'completion', 'function_calling', 'vision', 'streaming'],
    maxTokens: 32768, costPer1KPrompt: 0.001, costPer1KCompletion: 0.002,
    isActive: false, isExperimental: true,
  },

  // Azure OpenAI (prepared)
  {
    id: 'azure-gpt-4o', model: 'azure-gpt-4o', provider: 'azure_openai',
    displayName: 'Azure GPT-4o', description: 'Azure OpenAI GPT-4o - enterprise managed',
    capabilities: ['chat', 'completion', 'function_calling', 'vision', 'streaming'],
    maxTokens: 128000, costPer1KPrompt: 0.0025, costPer1KCompletion: 0.01,
    isActive: false, isExperimental: true,
  },

  // Local Models (prepared)
  {
    id: 'local-llama', model: 'local-llama', provider: 'local',
    displayName: 'Local Llama', description: 'Local Llama model - self-hosted',
    capabilities: ['chat', 'completion'],
    maxTokens: 8192, costPer1KPrompt: 0, costPer1KCompletion: 0,
    isActive: false, isExperimental: true,
  },
  {
    id: 'local-mistral', model: 'local-mistral', provider: 'local',
    displayName: 'Local Mistral', description: 'Local Mistral model - self-hosted',
    capabilities: ['chat', 'completion', 'function_calling'],
    maxTokens: 32768, costPer1KPrompt: 0, costPer1KCompletion: 0,
    isActive: false, isExperimental: true,
  },
];

export class ModelRegistry {
  private models: Map<string, ModelDefinition> = new Map();

  constructor() {
    for (const m of MODEL_REGISTRY_DEFINITIONS) {
      this.models.set(m.id, m);
    }
  }

  getModel(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }

  getModelByType(model: AIModel): ModelDefinition | undefined {
    return Array.from(this.models.values()).find(m => m.model === model);
  }

  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  getActiveModels(): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.isActive);
  }

  getModelsByProvider(provider: AIProvider): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.provider === provider);
  }

  getModelsByCapability(capability: ModelCapability): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.capabilities.includes(capability));
  }

  getDefaultModel(): ModelDefinition {
    return this.getModelByType('gpt-4o-mini') || this.getAllModels()[0];
  }

  calculateCost(model: AIModel, promptTokens: number, completionTokens: number): number {
    const def = this.getModelByType(model);
    if (!def) return 0;
    return (promptTokens / 1000) * def.costPer1KPrompt + (completionTokens / 1000) * def.costPer1KCompletion;
  }

  isModelAvailable(model: AIModel): boolean {
    const def = this.getModelByType(model);
    return def?.isActive || false;
  }

  registerModel(definition: ModelDefinition): void {
    if (this.models.has(definition.id)) {
      appLogger.warn('ModelRegistry', `Model ${definition.id} already registered`);
      return;
    }
    this.models.set(definition.id, definition);
    appLogger.info('ModelRegistry', `Model registered: ${definition.displayName}`);
  }
}

export const modelRegistry = new ModelRegistry();