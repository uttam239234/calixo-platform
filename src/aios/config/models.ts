/**
 * Calixo Platform - AIOS Model Configuration
 *
 * Central model configuration with provider settings, rate limits,
 * fallback chains, and cost thresholds.
 */

import type { AIModel, AIProvider, ModelConfig } from '@/aios/types';

export interface ModelProviderConfig {
  provider: AIProvider;
  apiKeyEnv: string;
  baseUrl?: string;
  timeoutMs: number;
  maxRetries: number;
  rateLimitRpm: number;
  isEnabled: boolean;
}

export const PROVIDER_CONFIGS: Record<AIProvider, ModelProviderConfig> = {
  openai: {
    provider: 'openai',
    apiKeyEnv: 'OPENAI_API_KEY',
    timeoutMs: 60000,
    maxRetries: 3,
    rateLimitRpm: 500,
    isEnabled: true,
  },
  anthropic: {
    provider: 'anthropic',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    timeoutMs: 60000,
    maxRetries: 3,
    rateLimitRpm: 200,
    isEnabled: false,
  },
  google: {
    provider: 'google',
    apiKeyEnv: 'GOOGLE_AI_API_KEY',
    timeoutMs: 45000,
    maxRetries: 3,
    rateLimitRpm: 300,
    isEnabled: false,
  },
  azure_openai: {
    provider: 'azure_openai',
    apiKeyEnv: 'AZURE_OPENAI_API_KEY',
    baseUrl: 'https://YOUR_RESOURCE.openai.azure.com',
    timeoutMs: 60000,
    maxRetries: 3,
    rateLimitRpm: 400,
    isEnabled: false,
  },
  local: {
    provider: 'local',
    apiKeyEnv: '',
    timeoutMs: 120000,
    maxRetries: 1,
    rateLimitRpm: 50,
    isEnabled: false,
  },
};

export interface FallbackConfig {
  enabled: boolean;
  chain: AIModel[];
  maxFallbacks: number;
}

export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  enabled: true,
  chain: ['gpt-4o-mini', 'gpt-3.5-turbo'],
  maxFallbacks: 2,
};

export interface AIOSConfig {
  defaultModel: AIModel;
  defaultProvider: AIProvider;
  maxTokensDefault: number;
  temperatureDefault: number;
  streamingEnabled: boolean;
  conversationMaxMessages: number;
  conversationTtlMinutes: number;
  memoryMaxEntries: number;
  analyticsRetentionDays: number;
  guardrailsEnabled: boolean;
  rateLimitPerMinute: number;
  fallback: FallbackConfig;
  costAlertThreshold: number;
}

export const DEFAULT_AIOS_CONFIG: AIOSConfig = {
  defaultModel: 'gpt-4o-mini',
  defaultProvider: 'openai',
  maxTokensDefault: 4096,
  temperatureDefault: 0.7,
  streamingEnabled: false,
  conversationMaxMessages: 100,
  conversationTtlMinutes: 1440, // 24 hours
  memoryMaxEntries: 10000,
  analyticsRetentionDays: 90,
  guardrailsEnabled: true,
  rateLimitPerMinute: 60,
  fallback: DEFAULT_FALLBACK_CONFIG,
  costAlertThreshold: 100,
};