"use server";

/**
 * Calixo Platform - Brand Monitoring: AI Insights Server Action
 *
 * Mirrors `features/analytics/insightsActions.ts` exactly. Brand
 * Monitoring's "AI Reputation surface" (`explainSentiment`/`getInsights`/
 * `detectRisks`/etc.) is explicitly documented in `ReputationPlatformAPI.ts`
 * as deterministic/rule-based text-templating over real aggregates, not a
 * model call — this adds one, on demand, over the org's real sentiment
 * overview and real (if partly fixture-based, per that file's own
 * disclosure) competitor landscape.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { reputationPlatformAPI } from "@/core/reputation";
import type { ReputationInsight } from "@/core/reputation";
import { generateId } from "@/shared/utils/string";
import { aiService } from "@/aios/services/AIService";

const BRAND_INSIGHT_CREDIT_COST = 10;

export interface GenerateBrandInsightResult {
  ok: boolean;
  insight?: ReputationInsight;
  error?: string;
  upgradeTarget?: string;
}

export async function generateBrandInsightAction(): Promise<GenerateBrandInsightResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "brand");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Brand Monitoring isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, BRAND_INSIGHT_CREDIT_COST, "AI brand insight");
  if (!result.allowed || !reservationId) {
    return { ok: false, error: result.message ?? "Out of AI credits. Purchase additional credits or upgrade your plan.", upgradeTarget: result.upgradeTarget };
  }

  try {
    const overview = reputationPlatformAPI.getOverview();
    const landscape = reputationPlatformAPI.getCompetitorLandscape();
    const digest = `Real sentiment overview: ${JSON.stringify(overview)}\nCompetitor landscape (share of voice/sentiment): ${JSON.stringify(landscape)}`;
    const response = await aiService.generateInsights(digest, { userId: actor.userId, organizationId: actor.organizationId, module: "brand" });
    const actualCredits = Math.max(1, response.usage.totalTokens);
    await entitlementService.commitAiCredits(actor, reservationId, actualCredits, "AI brand insight");

    const insight: ReputationInsight = {
      id: generateId(12),
      type: "summary",
      title: "AI Analysis",
      content: response.message.content,
      confidence: 0.8,
      relatedData: ["sentiment", "competitors"],
      generatedAt: new Date().toISOString(),
    };
    return { ok: true, insight };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong generating that insight." };
  }
}
