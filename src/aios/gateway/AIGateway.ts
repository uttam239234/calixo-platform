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
import { providerRouter, NO_PROVIDERS_MESSAGE } from './ProviderRouter';
import { openAIProvider } from './providers/OpenAIProvider';
import { anthropicProvider } from './providers/AnthropicProvider';
import { googleProvider } from './providers/GoogleProvider';

export class AIGateway {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();

  /** Registers all 3 real providers immediately at construction (cheap — no network/disk I/O happens until a request actually needs a key) rather than depending on `initializeAIOS()` ever being called, which nothing in this codebase currently does. */
  constructor() {
    this.registerProvider(openAIProvider);
    this.registerProvider(anthropicProvider);
    this.registerProvider(googleProvider);
  }

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

  /**
   * When the caller names an explicit model, honor it exactly (existing
   * behavior, unchanged). When it doesn't — the common case, and the one
   * every rewired module (Copilot/Content/Reports/Analytics/Brand) now
   * uses — `ProviderRouter` picks OpenAI -> Anthropic -> Gemini by real,
   * live availability instead of always defaulting to
   * `DEFAULT_MODEL_CONFIG.model` (which would silently fail if OpenAI
   * specifically isn't configured, even with Anthropic available).
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    let provider: AIProviderInterface;
    let model: AIModel;

    if (request.model) {
      model = request.model;
      const modelDef = modelRegistry.getModelByType(model);
      if (!modelDef) throw new Error(`Model not found: ${model}`);
      const explicit = this.providers.get(modelDef.provider);
      if (!explicit) throw new Error(`Provider not available: ${modelDef.provider}`);
      if (!(await (explicit.refreshAvailability?.() ?? Promise.resolve(explicit.isAvailable)))) {
        throw new Error(`Provider ${modelDef.provider} is not available`);
      }
      provider = explicit;
    } else {
      const selection = await providerRouter.selectProvider();
      if (!selection) throw new Error(NO_PROVIDERS_MESSAGE);
      provider = selection.provider;
      model = selection.model;
    }

    const startTime = Date.now();
    const response = await provider.complete({ ...request, model });
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