/**
 * Calixo Platform - OpenAI Provider Adapter
 *
 * Implements the AIProviderInterface for OpenAI.
 * No business logic depends directly on the OpenAI SDK.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type {
  AIProviderInterface, AIProvider, AIModel, AICompletionRequest, AICompletionResponse,
  AIMessage, TokenUsage,
} from '@/aios/types';
import { modelRegistry } from '@/aios/models/ModelRegistry';

export class OpenAIProvider implements AIProviderInterface {
  provider: AIProvider = 'openai';
  name = 'OpenAI';
  isAvailable = true;
  models: AIModel[] = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || 'gpt-4o-mini';
    const modelDef = modelRegistry.getModelByType(model);
    const startTime = Date.now();

    // In production, this would call the OpenAI API
    // const response = await openai.chat.completions.create({ ... });
    // For now, return a mock response
    const mockResponse = await this.mockCompletion(request, model);

    const latency = Date.now() - startTime;
    const promptTokens = this.estimateTokens(request.messages.map(m => m.content).join(' '));
    const completionTokens = this.estimateTokens(mockResponse.content);
    const totalTokens = promptTokens + completionTokens;
    const cost = modelRegistry.calculateCost(model, promptTokens, completionTokens);

    return {
      id: generateId(16),
      message: {
        id: generateId(16),
        role: 'assistant',
        content: mockResponse.content,
        timestamp: new Date().toISOString(),
      },
      model,
      provider: 'openai',
      usage: { promptTokens, completionTokens, totalTokens, cost },
      latency,
      finishReason: 'stop',
    };
  }

  async completeStream(request: AICompletionRequest): Promise<AsyncIterable<AICompletionResponse>> {
    // Streaming placeholder - in production, implement actual streaming
    const response = await this.complete(request);
    return {
      [Symbol.asyncIterator]: async function* () {
        yield response;
      },
    };
  }

  async embed(text: string): Promise<number[]> {
    // In production, call OpenAI embeddings API
    // const response = await openai.embeddings.create({ model: 'text-embedding-3-large', input: text });
    return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }

  async validateConfig(): Promise<boolean> {
    // In production, validate API key by making a test call
    return true;
  }

  private async mockCompletion(request: AICompletionRequest, model: AIModel): Promise<{ content: string }> {
    const lastMessage = request.messages[request.messages.length - 1];
    const systemMessage = request.messages.find(m => m.role === 'system');

    return {
      content: `This is a mock response from ${model}. In production, this would call the OpenAI API.\n\nYou said: "${lastMessage?.content || 'Hello'}"`,
    };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

export const openAIProvider = new OpenAIProvider();