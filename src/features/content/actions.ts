"use server";

/**
 * Calixo Platform - Content Studio: Server Actions
 *
 * Real backend enforcement boundary for the two AI generation entry points
 * (`generateCreative`/`generateContent`) — both used to be called directly
 * from `"use client"` code (`ContentStudioProvider.tsx`) with only a
 * client-side RBAC permission check and no AI-credit check at all. `applyAction`
 * (translate) and `localize` follow the identical, now-proven pattern but
 * were not converted this round — disclosed scope cut, not an oversight.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { contentPlatformAPI } from "@/core/content";
import type { ContentBrief, ContentOutputKind, CreativeOutputKind, GenerationHistoryEntry } from "@/core/content";

/** No real image/text generation model backs this codebase's simulated outputs — a fixed, disclosed credit cost per generation, matching the scale used for Copilot/Reports. */
const CONTENT_GENERATION_CREDIT_COST = 15;

export interface ContentGenerationActionResult {
  ok: boolean;
  entry?: GenerationHistoryEntry;
  error?: string;
  upgradeTarget?: string;
}

async function runContentGeneration(organizationId: string, userId: string, generate: () => Promise<GenerationHistoryEntry>): Promise<ContentGenerationActionResult> {
  const actor = { userId, organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "content");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Content Studio isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, CONTENT_GENERATION_CREDIT_COST, "Content Studio generation");
  if (!result.allowed || !reservationId) {
    return { ok: false, error: result.message ?? "Out of AI credits. Purchase additional credits or upgrade your plan.", upgradeTarget: result.upgradeTarget };
  }

  try {
    const entry = await generate();
    await entitlementService.commitAiCredits(actor, reservationId, CONTENT_GENERATION_CREDIT_COST, "Content Studio generation");
    return { ok: true, entry };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong generating that." };
  }
}

export async function generateCreativeAction(brief: ContentBrief, outputId: CreativeOutputKind): Promise<ContentGenerationActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  return runContentGeneration(identity.organizationId, identity.userId, () => contentPlatformAPI.generateCreative(brief, outputId, identity.organizationId));
}

export async function generateContentAction(brief: ContentBrief, outputId: ContentOutputKind): Promise<ContentGenerationActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  return runContentGeneration(identity.organizationId, identity.userId, () => contentPlatformAPI.generateContent(brief, outputId, identity.organizationId));
}
