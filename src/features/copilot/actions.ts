"use server";

/**
 * Calixo Platform - AI Copilot: Server Actions
 *
 * The real backend enforcement boundary for AI credit consumption AND (as
 * of this round) the real entry point into the AI pipeline itself.
 * `sendCopilotMessageAction` calls `aiConversationEngine.run()` directly —
 * NOT `copilotPlatformAPI.sendMessage()` (the old keyword-trigger planner
 * path) — deliberately: `CopilotPlatformAPI.ts` is re-exported from
 * `@/core/copilot`'s barrel, which many "use client" hooks import
 * (`useCopilotConversation.ts`, `CopilotProvider.tsx`, etc.), so it must
 * never gain a dependency on `AIService`/`ProviderRouter` (both
 * `server-only`, since they hold real vendor API keys) — that would break
 * every client bundle reaching that barrel, the exact bug class Round 23
 * found and fixed for the dashboard widget registry. `AIConversationEngine`
 * is deep-imported here, in a `"use server"` file, which is Next.js's own
 * safe boundary for exactly this.
 *
 * Credits: the pre-flight estimate still uses `estimateTokens()` (real
 * usage isn't known before the call), but the post-execution "actual" cost
 * now comes from `outcome.totalTokens` — the REAL `usage.total_tokens`
 * OpenAI/Anthropic returned — replacing the old double-estimate
 * (`estimateTokens(request) + estimateTokens(responseText)`, which was
 * never anything but a character-count guess on both sides).
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { estimateTokens } from "@/core/copilot/commercial/CopilotUsageAdapter";
import { aiConversationEngine } from "@/core/copilot/planning/AIConversationEngine";
import type { ExecutionPlan, SendMessageOutcome } from "@/core/copilot";

export interface CopilotActionResult {
  ok: boolean;
  outcome?: SendMessageOutcome;
  error?: string;
  upgradeTarget?: string;
}

export async function sendCopilotMessageAction(sessionId: string, request: string): Promise<CopilotActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "ai-copilot");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "AI Copilot isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const estimatedCredits = estimateTokens(request);
  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, estimatedCredits, "AI Copilot message");
  if (!result.allowed || !reservationId) {
    return { ok: false, error: result.message ?? "Out of AI credits. Purchase additional credits or upgrade your plan.", upgradeTarget: result.upgradeTarget };
  }

  try {
    const outcome = await aiConversationEngine.run(actor, sessionId, request);
    const actualCredits = Math.max(1, outcome.totalTokens);
    await entitlementService.commitAiCredits(actor, reservationId, actualCredits, "AI Copilot message");

    const plan: ExecutionPlan = {
      id: sessionId,
      sessionId,
      title: request.slice(0, 80),
      request,
      steps: [...outcome.tasks.map(t => ({
        id: t.stepId, order: 1, skillId: t.toolId, toolId: t.toolId, label: t.label, description: t.label,
        input: {}, enabled: true, estimatedTimeMs: t.estimatedTimeMs, agentId: outcome.agentId, requiresApproval: false,
      })), ...outcome.pendingApprovalSteps],
      stage: "execution-plan",
      estimatedTotalMs: outcome.latencyMs,
      createdAt: new Date().toISOString(),
    };

    return {
      ok: true,
      outcome: {
        responseText: outcome.responseText,
        agentId: outcome.agentId,
        awaitingClarification: false,
        pendingApprovalSteps: outcome.pendingApprovalSteps,
        tasks: outcome.tasks,
        plan,
      },
    };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong sending that message." };
  }
}
