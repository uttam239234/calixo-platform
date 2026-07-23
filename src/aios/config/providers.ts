/**
 * Calixo Platform - AIOS Provider Configuration
 *
 * Provider-specific configuration including API endpoints, retry policies,
 * streaming support, and model availability.
 */

import type { AIProvider, AIModel } from '@/aios/types';

export interface ProviderEndpoint {
  provider: AIProvider;
  chatCompletions: string;
  embeddings: string;
  imageGeneration: string;
  audioTranscription: string;
}

export const PROVIDER_ENDPOINTS: Partial<Record<AIProvider, ProviderEndpoint>> = {
  openai: {
    provider: 'openai',
    chatCompletions: 'https://api.openai.com/v1/chat/completions',
    embeddings: 'https://api.openai.com/v1/embeddings',
    imageGeneration: 'https://api.openai.com/v1/images/generations',
    audioTranscription: 'https://api.openai.com/v1/audio/transcriptions',
  },
  azure_openai: {
    provider: 'azure_openai',
    chatCompletions: '/openai/deployments/{deployment}/chat/completions',
    embeddings: '/openai/deployments/{deployment}/embeddings',
    imageGeneration: '/openai/deployments/{deployment}/images/generations',
    audioTranscription: '/openai/deployments/{deployment}/audio/transcriptions',
  },
};

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [429, 500, 502, 503, 504],
};

export interface StreamingConfig {
  enabled: boolean;
  chunkTimeoutMs: number;
  maxChunkSize: number;
}

export const DEFAULT_STREAMING_CONFIG: StreamingConfig = {
  enabled: false,
  chunkTimeoutMs: 15000,
  maxChunkSize: 4096,
};

export const MODEL_SUPPORTED_ACTIONS: Record<AIModel, { chat: boolean; stream: boolean; functionCalling: boolean; vision: boolean; embedding: boolean }> = {
  'gpt-4o': { chat: true, stream: true, functionCalling: true, vision: true, embedding: false },
  'gpt-4o-mini': { chat: true, stream: true, functionCalling: true, vision: false, embedding: false },
  'gpt-4-turbo': { chat: true, stream: true, functionCalling: true, vision: true, embedding: false },
  'gpt-3.5-turbo': { chat: true, stream: true, functionCalling: true, vision: false, embedding: false },
  'claude-3-opus': { chat: true, stream: true, functionCalling: true, vision: true, embedding: false },
  'claude-3-sonnet': { chat: true, stream: true, functionCalling: true, vision: true, embedding: false },
  'claude-3-haiku': { chat: true, stream: true, functionCalling: true, vision: false, embedding: false },
  'gemini-pro': { chat: true, stream: true, functionCalling: true, vision: false, embedding: false },
  'gemini-ultra': { chat: true, stream: true, functionCalling: true, vision: true, embedding: false },
  'azure-gpt-4o': { chat: true, stream: true, functionCalling: true, vision: true, embedding: false },
  'local-llama': { chat: true, stream: false, functionCalling: false, vision: false, embedding: true },
  'local-mistral': { chat: true, stream: false, functionCalling: true, vision: false, embedding: true },
  'gpt-image-1': { chat: false, stream: false, functionCalling: false, vision: false, embedding: false },
};

export const PROVIDER_MODEL_MAP: Record<AIProvider, AIModel[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  google: ['gemini-pro', 'gemini-ultra'],
  azure_openai: ['azure-gpt-4o'],
  local: ['local-llama', 'local-mistral'],
};