import "server-only";

/**
 * Calixo Platform - OpenAI Provider Adapter
 *
 * Real implementation — replaces the prior `mockCompletion()` (a hardcoded
 * "This is a mock response..." string). Uses the platform's own real,
 * sealed `openai_api_key` (Platform Secrets Console, Round 19 — the same
 * credential Settings → Advanced already live-tests) via `getProviderKey()`,
 * never `process.env` directly, so a key rotated/added through the Secrets
 * Console takes effect on the very next request with no redeploy.
 *
 * OpenAI's wire format is close enough to AIOS's own `AIMessage`/`ToolCall`
 * shape (both already `{role, content, tool_calls: [{id, type:"function",
 * function:{name, arguments}}]}`) that no translation layer is needed here
 * the way `AnthropicProvider` requires one — this is the reference/simplest
 * of the three real provider implementations.
 */

import { generateId } from '@/shared/utils/string';
import type {
  AIProviderInterface, AIProvider, AIModel, AICompletionRequest, AICompletionResponse,
  AIMessage, ToolCall,
} from '@/aios/types';
import { modelRegistry } from '@/aios/models/ModelRegistry';
import { getProviderKey, isProviderKeyConfigured } from './getProviderKey';

const CATALOG_ID = 'openai_api_key';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 30000;

type OpenAIContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

interface OpenAIChatMessage {
  role: string;
  content: string | OpenAIContentPart[] | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

function toOpenAIMessages(messages: AIMessage[]): OpenAIChatMessage[] {
  return messages.map(m => {
    const content: OpenAIChatMessage['content'] =
      m.imageUrls && m.imageUrls.length > 0
        ? [{ type: 'text', text: m.content || '' }, ...m.imageUrls.map(url => ({ type: 'image_url' as const, image_url: { url } }))]
        : m.content || null;
    const out: OpenAIChatMessage = { role: m.role === 'system' ? 'system' : m.role, content };
    if (m.toolCalls) out.tool_calls = m.toolCalls;
    if (m.toolCallId) out.tool_call_id = m.toolCallId;
    if (m.role === 'tool' && m.name) out.name = m.name;
    return out;
  });
}

export class OpenAIProvider implements AIProviderInterface {
  provider: AIProvider = 'openai';
  name = 'OpenAI';
  isAvailable = false;
  models: AIModel[] = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  /** Called by `ProviderRouter` before each selection — cheap after the registry's first disk read (in-memory afterward), so safe to call per-request rather than caching a possibly-stale boolean. */
  async refreshAvailability(): Promise<boolean> {
    this.isAvailable = await isProviderKeyConfigured(CATALOG_ID);
    return this.isAvailable;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model && this.models.includes(request.model) ? request.model : 'gpt-4o-mini';
    const apiKey = await getProviderKey(CATALOG_ID);
    if (!apiKey) throw new Error('OpenAI is not configured — add a real API key in Platform Admin → Secrets.');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const startTime = Date.now();

    try {
      const body: Record<string, unknown> = {
        model,
        messages: toOpenAIMessages(request.messages),
        temperature: request.config?.temperature ?? 0.7,
        max_tokens: request.config?.maxTokens ?? 2048,
      };
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools;
        body.tool_choice = 'auto';
      }

      let response: Response;
      try {
        response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } catch (error) {
        // A raw `AbortError`/"This operation was aborted" is meaningless to an end user — the
        // brief's own example of a meaningful error message ("OpenAI timeout") is what should
        // surface instead, all the way up through the credit-release/toast path.
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`OpenAI request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Try again, or use a shorter prompt.`);
        }
        throw new Error('Could not reach OpenAI — the network may be unavailable.');
      }

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message = errBody?.error?.message || `OpenAI returned HTTP ${response.status}.`;
        throw new Error(message);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const promptTokens = data.usage?.prompt_tokens ?? 0;
      const completionTokens = data.usage?.completion_tokens ?? 0;
      const totalTokens = data.usage?.total_tokens ?? promptTokens + completionTokens;
      const cost = modelRegistry.calculateCost(model, promptTokens, completionTokens);

      return {
        id: data.id || generateId(16),
        message: {
          id: generateId(16),
          role: 'assistant',
          content: choice?.message?.content ?? '',
          toolCalls: choice?.message?.tool_calls,
          timestamp: new Date().toISOString(),
        },
        model,
        provider: 'openai',
        usage: { promptTokens, completionTokens, totalTokens, cost },
        latency,
        finishReason: choice?.finish_reason ?? 'stop',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async completeStream(request: AICompletionRequest): Promise<AsyncIterable<AICompletionResponse>> {
    const response = await this.complete(request);
    return {
      [Symbol.asyncIterator]: async function* () {
        yield response;
      },
    };
  }

  async embed(text: string): Promise<number[]> {
    const apiKey = await getProviderKey(CATALOG_ID);
    if (!apiKey) throw new Error('OpenAI is not configured.');
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });
    if (!response.ok) throw new Error(`OpenAI embeddings returned HTTP ${response.status}.`);
    const data = await response.json();
    return data.data?.[0]?.embedding ?? [];
  }

  async validateConfig(): Promise<boolean> {
    return isProviderKeyConfigured(CATALOG_ID);
  }
}

export const openAIProvider = new OpenAIProvider();
