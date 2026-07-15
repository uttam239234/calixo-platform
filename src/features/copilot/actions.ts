"use server";

/**
 * Calixo Platform - AI Copilot: Server Actions
 *
 * The real backend enforcement boundary for AI credit consumption.
 * `copilotPlatformAPI.sendMessage()` used to be called directly from
 * `"use client"` code (`useCopilotConversation.ts`'s `runPipeline`) — the
 * entitlement check and the AI orchestration both ran inside the same
 * browser-bundled JS, so there was no server round-trip actually enforcing
 * anything (disabling JS or tampering with client state would have
 * bypassed it entirely). This Server Action IS that round-trip: it resolves
 * the real, Clerk-verified identity itself (never trusts a client-supplied
 * organizationId), then runs the mandate's validate -> reserve -> execute
 * -> deduct -> log flow for real, using `estimateTokens()` (already
 * denominated in "credit" units, see `CopilotUsageAdapter.ts`) for both the
 * pre-flight estimate and the post-execution actual cost.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { copilotPlatformAPI } from "@/core/copilot";
import { estimateTokens } from "@/core/copilot/commercial/CopilotUsageAdapter";
import type { SendMessageOutcome } from "@/core/copilot";

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
    const outcome = await copilotPlatformAPI.sendMessage(sessionId, request);
    const actualCredits = estimateTokens(request) + estimateTokens(outcome.responseText);
    await entitlementService.commitAiCredits(actor, reservationId, actualCredits, "AI Copilot message");
    return { ok: true, outcome };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong sending that message." };
  }
}
