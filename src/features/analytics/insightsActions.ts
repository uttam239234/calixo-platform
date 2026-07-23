"use server";

/**
 * Calixo Platform - Analytics: AI Insights Server Action
 *
 * Analytics' "AI Insights" panel was a hardcoded static array
 * (`AnalyticsEngine.DEFAULT_INSIGHTS`) with zero AI-credit metering — there
 * was no Server Action for it at all before this round. This is the real
 * boundary: resolves identity server-side, checks module access, reserves
 * AI credits, and calls `aiService.generateInsights()` with a real digest
 * of the organization's actual KPIs/revenue trend (never fabricated
 * numbers). The 4 seeded `DEFAULT_INSIGHTS` stay in place as a disclosed
 * static baseline — this adds a genuine, on-demand, real insight alongside
 * them rather than attempting to force free-form model output into every
 * field of the existing structured schema (title/priority/confidence/
 * uplift), which would need reliable JSON-mode prompting this round didn't
 * have time to verify live.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { analyticsPlatformAPI } from "@/core/analytics";
import type { AnalyticsInsight } from "@/core/analytics";
import { generateId } from "@/shared/utils/string";
import { aiService } from "@/aios/services/AIService";

const ANALYTICS_INSIGHT_CREDIT_COST = 10;

export interface GenerateAnalyticsInsightResult {
  ok: boolean;
  insight?: AnalyticsInsight;
  error?: string;
  upgradeTarget?: string;
}

export async function generateAnalyticsInsightAction(): Promise<GenerateAnalyticsInsightResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "analytics");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Analytics isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, ANALYTICS_INSIGHT_CREDIT_COST, "AI analytics insight");
  if (!result.allowed || !reservationId) {
    return { ok: false, error: result.message ?? "Out of AI credits. Purchase additional credits or upgrade your plan.", upgradeTarget: result.upgradeTarget };
  }

  try {
    const summary = analyticsPlatformAPI.getExecutiveSummary();
    const digest = `Real KPIs: ${JSON.stringify(summary.kpis)}\nRevenue trend (recent points): ${JSON.stringify(summary.revenueTrend.slice(-10))}`;
    const response = await aiService.generateInsights(digest, { userId: actor.userId, organizationId: actor.organizationId, module: "analytics" });
    const actualCredits = Math.max(1, response.usage.totalTokens);
    await entitlementService.commitAiCredits(actor, reservationId, actualCredits, "AI analytics insight");

    const insight: AnalyticsInsight = {
      id: generateId(12),
      title: "AI Analysis",
      description: response.message.content,
      priority: "Medium",
      confidence: 80,
      uplift: "—",
      status: "new",
    };
    return { ok: true, insight };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong generating that insight." };
  }
}
