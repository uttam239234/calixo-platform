"use server";

/**
 * Calixo Platform - Platform Admin: AI Health Server Action
 *
 * Exposes `aios/persistence.ts`'s real request log (server-only) to the
 * Platform Admin console — every field here (success rate, latency,
 * credits, provider breakdown, fallback activations, recent failures)
 * comes from `AIRequestLogEntry` rows written by Copilot/Content
 * Studio/Reports/Analytics/Brand Monitoring's own Server Actions after
 * every real provider call. No synthetic/sample data.
 */
import { getHealthSummary, type AIHealthSummary } from "@/aios/persistence";
import { providerRouter } from "@/aios/gateway/ProviderRouter";

export interface AIHealthPageData {
  summary: AIHealthSummary;
  providerStatus: { provider: string; name: string; available: boolean; priority: number }[];
}

export async function getAIHealthAction(sinceHoursAgo = 24 * 7): Promise<AIHealthPageData> {
  const [summary, providerStatus] = await Promise.all([
    getHealthSummary(undefined, sinceHoursAgo),
    providerRouter.getProviderStatus(),
  ]);
  return { summary, providerStatus };
}
