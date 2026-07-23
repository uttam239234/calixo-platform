import "server-only";

/**
 * Calixo Platform - AI Provider Router
 *
 * The brief's own priority algorithm, made real: OpenAI, then Anthropic,
 * then Gemini, else a clear "no providers available" result — never a
 * silent failure or a fabricated response. Availability is re-checked
 * against the real Platform Secrets Console on every selection (not a
 * cached boolean set once at boot) so adding/rotating/removing a vendor
 * key via Platform Admin → Secrets takes effect on the very next AI
 * request, no restart required.
 *
 * Deliberately not re-exported from `@/aios`'s barrel `index.ts` — see
 * `getProviderKey.ts`'s doc comment for why.
 */
import { openAIProvider } from './providers/OpenAIProvider';
import { anthropicProvider } from './providers/AnthropicProvider';
import { googleProvider } from './providers/GoogleProvider';
import type { AIProviderInterface, AIModel } from '@/aios/types';

const PRIORITY: { provider: AIProviderInterface; defaultModel: AIModel }[] = [
  { provider: openAIProvider, defaultModel: 'gpt-4o-mini' },
  { provider: anthropicProvider, defaultModel: 'claude-3-haiku' },
  { provider: googleProvider, defaultModel: 'gemini-pro' },
];

export interface ProviderSelection {
  provider: AIProviderInterface;
  model: AIModel;
}

export const NO_PROVIDERS_MESSAGE = 'No AI providers are currently available.';

export class ProviderRouter {
  /** Priority order: OpenAI -> Anthropic -> Gemini -> none. Each candidate's availability is refreshed against the real Secrets Console immediately before the check, so this never trusts a stale in-memory flag. */
  async selectProvider(): Promise<ProviderSelection | undefined> {
    for (const candidate of PRIORITY) {
      const available = await candidate.provider.refreshAvailability?.() ?? candidate.provider.isAvailable;
      if (available) return { provider: candidate.provider, model: candidate.defaultModel };
    }
    return undefined;
  }

  async getAvailableProviders(): Promise<AIProviderInterface[]> {
    const results: AIProviderInterface[] = [];
    for (const candidate of PRIORITY) {
      const available = await candidate.provider.refreshAvailability?.() ?? candidate.provider.isAvailable;
      if (available) results.push(candidate.provider);
    }
    return results;
  }

  /** All registered providers, priority order, each with its real live-availability flag — used by the AI Health page and by Copilot's tool-awareness system prompt (so the model itself can mention degraded provider availability if directly asked). */
  async getProviderStatus(): Promise<{ provider: AIProviderInterface['provider']; name: string; available: boolean; priority: number }[]> {
    const results = [];
    for (let i = 0; i < PRIORITY.length; i++) {
      const candidate = PRIORITY[i];
      const available = await candidate.provider.refreshAvailability?.() ?? candidate.provider.isAvailable;
      results.push({ provider: candidate.provider.provider, name: candidate.provider.name, available, priority: i + 1 });
    }
    return results;
  }
}

export const providerRouter = new ProviderRouter();
