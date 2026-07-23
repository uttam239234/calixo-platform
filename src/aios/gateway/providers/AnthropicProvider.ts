import "server-only";

/**
 * Calixo Platform - Anthropic Provider Adapter
 *
 * Did not exist before this round — `ModelRegistry`/`config/providers.ts`
 * both already listed Claude models "prepared" (`isActive: false`), and
 * `PlatformSecretCatalog` already cataloged `anthropic_api_key` ("used by
 * AIOS's Anthropic provider"), but nothing ever implemented one.
 *
 * Anthropic's Messages API is NOT wire-compatible with OpenAI's, so this
 * provider is where AIOS's provider-agnostic shape earns its keep — three
 * real translations happen here that `OpenAIProvider` doesn't need:
 *  1. `system` is a top-level request field, not a `role:"system"` message
 *     — extracted out of `AIMessage[]` before sending.
 *  2. Assistant tool calls and tool results are represented as typed
 *     content BLOCKS (`{type:"tool_use",...}` / `{type:"tool_result",...}`)
 *     inside a message's `content` array, not OpenAI's separate
 *     `tool_calls`/`role:"tool"` fields — converted both directions.
 *  3. Anthropic's `tools` schema is `{name, description, input_schema}`,
 *     not OpenAI's `{type:"function", function:{name, description,
 *     parameters}}` — `AICompletionRequest.tools` is authored once in the
 *     OpenAI shape (matching `ToolDefinition`) and converted per-provider.
 */

import { generateId } from '@/shared/utils/string';
import type {
  AIProviderInterface, AIProvider, AIModel, AICompletionRequest, AICompletionResponse,
  AIMessage, ToolCall, ToolDefinition,
} from '@/aios/types';
import { modelRegistry } from '@/aios/models/ModelRegistry';
import { getProviderKey, isProviderKeyConfigured } from './getProviderKey';

const CATALOG_ID = 'anthropic_api_key';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const REQUEST_TIMEOUT_MS = 30000;

type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

/** Parses a `data:image/png;base64,AAAA...` URI into Anthropic's `{media_type, data}` shape. Returns undefined for anything else (e.g. a plain https URL) — Anthropic's base64 source block is the only format this provider produces images in. */
function parseDataUri(uri: string): { media_type: string; data: string } | undefined {
  const match = /^data:([^;]+);base64,(.+)$/.exec(uri);
  if (!match) return undefined;
  return { media_type: match[1], data: match[2] };
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

function toAnthropicTools(tools?: ToolDefinition[]): { name: string; description: string; input_schema: Record<string, unknown> }[] | undefined {
  if (!tools || tools.length === 0) return undefined;
  return tools.map(t => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters }));
}

/** Merges consecutive same-role turns, since a tool-result message (mapped to `role:"user"`) immediately following an assistant tool-call message stays as its own turn — Anthropic requires strict user/assistant alternation. */
function toAnthropicMessages(messages: AIMessage[]): { system: string; conversation: AnthropicMessage[] } {
  const systemParts: string[] = [];
  const conversation: AnthropicMessage[] = [];

  for (const m of messages) {
    if (m.role === 'system') {
      systemParts.push(m.content);
      continue;
    }
    if (m.role === 'tool') {
      conversation.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: m.toolCallId || '', content: m.content }] });
      continue;
    }
    if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
      const blocks: AnthropicContentBlock[] = [];
      if (m.content) blocks.push({ type: 'text', text: m.content });
      for (const call of m.toolCalls) {
        blocks.push({ type: 'tool_use', id: call.id, name: call.function.name, input: JSON.parse(call.function.arguments || '{}') });
      }
      conversation.push({ role: 'assistant', content: blocks });
      continue;
    }
    if (m.imageUrls && m.imageUrls.length > 0) {
      const blocks: AnthropicContentBlock[] = [];
      if (m.content) blocks.push({ type: 'text', text: m.content });
      for (const uri of m.imageUrls) {
        const parsed = parseDataUri(uri);
        if (parsed) blocks.push({ type: 'image', source: { type: 'base64', media_type: parsed.media_type, data: parsed.data } });
      }
      conversation.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: blocks });
      continue;
    }
    conversation.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
  }

  return { system: systemParts.join('\n\n'), conversation };
}

function fromAnthropicContent(blocks: AnthropicContentBlock[]): { content: string; toolCalls?: ToolCall[] } {
  const textParts: string[] = [];
  const toolCalls: ToolCall[] = [];
  for (const block of blocks) {
    if (block.type === 'text') textParts.push(block.text);
    else if (block.type === 'tool_use') {
      toolCalls.push({ id: block.id, type: 'function', function: { name: block.name, arguments: JSON.stringify(block.input) } });
    }
  }
  return { content: textParts.join('\n'), toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
}

export class AnthropicProvider implements AIProviderInterface {
  provider: AIProvider = 'anthropic';
  name = 'Anthropic';
  isAvailable = false;
  models: AIModel[] = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];

  async refreshAvailability(): Promise<boolean> {
    this.isAvailable = await isProviderKeyConfigured(CATALOG_ID);
    return this.isAvailable;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model && this.models.includes(request.model) ? request.model : 'claude-3-haiku';
    const apiKey = await getProviderKey(CATALOG_ID);
    if (!apiKey) throw new Error('Anthropic is not configured — add a real API key in Platform Admin → Secrets.');

    const { system, conversation } = toAnthropicMessages(request.messages);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const startTime = Date.now();

    try {
      const body: Record<string, unknown> = {
        model,
        max_tokens: request.config?.maxTokens ?? 2048,
        temperature: request.config?.temperature ?? 0.7,
        messages: conversation,
      };
      if (system) body.system = system;
      const tools = toAnthropicTools(request.tools);
      if (tools) body.tools = tools;

      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message = errBody?.error?.message || `Anthropic returned HTTP ${response.status}.`;
        throw new Error(message);
      }

      const data = await response.json();
      const { content, toolCalls } = fromAnthropicContent(data.content ?? []);
      const promptTokens = data.usage?.input_tokens ?? 0;
      const completionTokens = data.usage?.output_tokens ?? 0;
      const totalTokens = promptTokens + completionTokens;
      const cost = modelRegistry.calculateCost(model, promptTokens, completionTokens);

      return {
        id: data.id || generateId(16),
        message: { id: generateId(16), role: 'assistant', content, toolCalls, timestamp: new Date().toISOString() },
        model,
        provider: 'anthropic',
        usage: { promptTokens, completionTokens, totalTokens, cost },
        latency,
        finishReason: data.stop_reason === 'tool_use' ? 'tool_calls' : data.stop_reason === 'max_tokens' ? 'length' : 'stop',
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

  async validateConfig(): Promise<boolean> {
    return isProviderKeyConfigured(CATALOG_ID);
  }
}

export const anthropicProvider = new AnthropicProvider();
