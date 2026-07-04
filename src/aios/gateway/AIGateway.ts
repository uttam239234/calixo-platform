/**
 * Calixo Platform - AI Gateway
 *
 * Provider abstraction layer. All AI requests go through this gateway.
 * No business logic depends directly on a provider SDK.
 * Supports OpenAI, Anthropic, Google Gemini, Azure OpenAI, and local models.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type {
  AIProvider, AIModel, AIProviderInterface, AICompletionRequest, AICompletionResponse,
  AIMessage, TokenUsage, ModelConfig,
} from '@/aios/types';
import { DEFAULT_MODEL_CONFIG } from '@/aios/types';
import { modelRegistry } from '@/aios/models/ModelRegistry';

export class AIGateway {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();

  registerProvider(provider: AIProviderInterface): void {
    this.providers.set(provider.provider, provider);
    appLogger.info('AIGateway', `Provider registered: ${provider.name}`);
  }

  getProvider(provider: AIProvider): AIProviderInterface | undefined {
    return this.providers.get(provider);
  }

  getAvailableProviders(): AIProviderInterface[] {
    return Array.from(this.providers.values()).filter(p => p.isAvailable);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || DEFAULT_MODEL_CONFIG.model;
    const modelDef = modelRegistry.getModelByType(model);
    if (!modelDef) throw new Error(`Model not found: ${model}`);

    const provider = this.providers.get(modelDef.provider);
    if (!provider) throw new Error(`Provider not available: ${modelDef.provider}`);
    if (!provider.isAvailable) throw new Error(`Provider ${modelDef.provider} is not available`);

    const startTime = Date.now();
    const response = await provider.complete(request);
    const latency = Date.now() - startTime;

    return {
      ...response,
      latency,
      metadata: { ...response.metadata, gatewayLatency: latency },
    };
  }

  async completeStream(request: AICompletionRequest): Promise<AsyncIterable<AICompletionResponse>> {
    const model = request.model || DEFAULT_MODEL_CONFIG.model;
    const modelDef = modelRegistry.getModelByType(model);
    if (!modelDef) throw new Error(`Model not found: ${model}`);

    const provider = this.providers.get(modelDef.provider);
    if (!provider) throw new Error(`Provider not available: ${modelDef.provider}`);

    return provider.completeStream(request);
  }

  async embed(text: string, model?: AIModel): Promise<number[]> {
    const targetModel = model || 'gpt-4o-mini';
    const modelDef = modelRegistry.getModelByType(targetModel);
    if (!modelDef) throw new Error(`Model not found: ${targetModel}`);

    const provider = this.providers.get(modelDef.provider);
    if (!provider?.embed) throw new Error(`Embedding not supported by ${modelDef.provider}`);

    return provider.embed(text);
  }
}

export const aiGateway = new AIGateway();