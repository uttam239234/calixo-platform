import "server-only";

/**
 * Calixo Platform - Google (Gemini) Provider Adapter
 *
 * Third-priority provider in `ProviderRouter`'s fallback chain. `google_ai_api_key`
 * was already cataloged in the Platform Secrets Console before this round
 * (`PlatformSecretCatalog.ts`) but nothing ever validated or consumed it —
 * this is a real implementation, not a stub, even though this environment's
 * key is expected to be unconfigured (the brief only names OpenAI/Anthropic
 * as "already configured, validated and tested"): `refreshAvailability()`
 * genuinely checks the real secret, and if a Google AI key is ever added
 * via Platform Admin → Secrets, this provider starts working with zero
 * code changes, exactly the router's own "else if Gemini available" branch.
 *
 * Gemini's wire format differs from both OpenAI and Anthropic: `contents`
 * uses `role: "user"|"model"` (not "assistant"), a message's text lives in
 * a `parts[]` array, function calls are `parts: [{functionCall:{name,args}}]`,
 * and the API key is a query parameter, not a header.
 */

import { generateId } from '@/shared/utils/string';
import type {
  AIProviderInterface, AIProvider, AIModel, AICompletionRequest, AICompletionResponse,
  AIMessage, ToolCall, ToolDefinition,
} from '@/aios/types';
import { modelRegistry } from '@/aios/models/ModelRegistry';
import { getProviderKey, isProviderKeyConfigured } from './getProviderKey';

const CATALOG_ID = 'google_ai_api_key';
const REQUEST_TIMEOUT_MS = 30000;

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
  inline_data?: { mime_type: string; data: string };
}

/** Parses a `data:image/png;base64,AAAA...` URI into Gemini's `inline_data` shape. */
function parseDataUri(uri: string): { mime_type: string; data: string } | undefined {
  const match = /^data:([^;]+);base64,(.+)$/.exec(uri);
  if (!match) return undefined;
  return { mime_type: match[1], data: match[2] };
}

interface GeminiContent {
  role: 'user' | 'model' | 'function';
  parts: GeminiPart[];
}

function toGeminiModel(model?: AIModel): string {
  if (model === 'gemini-ultra') return 'gemini-1.5-pro';
  return 'gemini-1.5-flash';
}

function toGeminiContents(messages: AIMessage[]): { systemInstruction?: string; contents: GeminiContent[] } {
  let systemInstruction: string | undefined;
  const contents: GeminiContent[] = [];

  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction = systemInstruction ? `${systemInstruction}\n\n${m.content}` : m.content;
      continue;
    }
    if (m.role === 'tool') {
      contents.push({ role: 'function', parts: [{ functionResponse: { name: m.name || 'tool', response: { result: m.content } } }] });
      continue;
    }
    if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
      const parts: GeminiPart[] = [];
      if (m.content) parts.push({ text: m.content });
      for (const call of m.toolCalls) parts.push({ functionCall: { name: call.function.name, args: JSON.parse(call.function.arguments || '{}') } });
      contents.push({ role: 'model', parts });
      continue;
    }
    if (m.imageUrls && m.imageUrls.length > 0) {
      const parts: GeminiPart[] = [];
      if (m.content) parts.push({ text: m.content });
      for (const uri of m.imageUrls) {
        const parsed = parseDataUri(uri);
        if (parsed) parts.push({ inline_data: parsed });
      }
      contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts });
      continue;
    }
    contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
  }

  return { systemInstruction, contents };
}

function toGeminiTools(tools?: ToolDefinition[]): { functionDeclarations: { name: string; description: string; parameters: Record<string, unknown> }[] }[] | undefined {
  if (!tools || tools.length === 0) return undefined;
  return [{ functionDeclarations: tools.map(t => ({ name: t.function.name, description: t.function.description, parameters: t.function.parameters })) }];
}

function fromGeminiParts(parts: GeminiPart[]): { content: string; toolCalls?: ToolCall[] } {
  const textParts: string[] = [];
  const toolCalls: ToolCall[] = [];
  for (const part of parts) {
    if (part.text) textParts.push(part.text);
    if (part.functionCall) {
      toolCalls.push({ id: generateId(12), type: 'function', function: { name: part.functionCall.name, arguments: JSON.stringify(part.functionCall.args) } });
    }
  }
  return { content: textParts.join('\n'), toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
}

export class GoogleProvider implements AIProviderInterface {
  provider: AIProvider = 'google';
  name = 'Google Gemini';
  isAvailable = false;
  models: AIModel[] = ['gemini-pro', 'gemini-ultra'];

  async refreshAvailability(): Promise<boolean> {
    this.isAvailable = await isProviderKeyConfigured(CATALOG_ID);
    return this.isAvailable;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model && this.models.includes(request.model) ? request.model : 'gemini-pro';
    const apiKey = await getProviderKey(CATALOG_ID);
    if (!apiKey) throw new Error('Google Gemini is not configured — add a real API key in Platform Admin → Secrets.');

    const geminiModel = toGeminiModel(model);
    const { systemInstruction, contents } = toGeminiContents(request.messages);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const startTime = Date.now();

    try {
      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: request.config?.temperature ?? 0.7,
          maxOutputTokens: request.config?.maxTokens ?? 2048,
        },
      };
      if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
      const tools = toGeminiTools(request.tools);
      if (tools) body.tools = tools;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal }
      );

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message = errBody?.error?.message || `Gemini returned HTTP ${response.status}.`;
        throw new Error(message);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const { content, toolCalls } = fromGeminiParts(candidate?.content?.parts ?? []);
      const promptTokens = data.usageMetadata?.promptTokenCount ?? 0;
      const completionTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
      const totalTokens = data.usageMetadata?.totalTokenCount ?? promptTokens + completionTokens;
      const cost = modelRegistry.calculateCost(model, promptTokens, completionTokens);

      return {
        id: generateId(16),
        message: { id: generateId(16), role: 'assistant', content, toolCalls, timestamp: new Date().toISOString() },
        model,
        provider: 'google',
        usage: { promptTokens, completionTokens, totalTokens, cost },
        latency,
        finishReason: candidate?.finishReason === 'MAX_TOKENS' ? 'length' : 'stop',
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

export const googleProvider = new GoogleProvider();
