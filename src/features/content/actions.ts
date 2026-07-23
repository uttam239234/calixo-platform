"use server";

/**
 * Calixo Platform - Content Studio: Server Actions
 *
 * Real backend enforcement boundary for every AI-touching Content Studio
 * operation. Round 26 (Content Studio redesign) added the freeform-prompt
 * intent classifier (`analyzeCreativePromptAction`/`analyzeContentPromptAction`),
 * real image generation + a real vision-model quality-control pass
 * (`runQualityPass`), natural-language post-generation editing
 * (`editCreativeVariationAction`), and Campaign Mode
 * (`analyzeCampaignPromptAction`/`executeCampaignAction`) on top of the
 * generation/credit scaffolding built in an earlier round.
 *
 * `applyAction` (translate) and `localize` follow the identical, now-proven
 * pattern but were not converted this round — disclosed scope cut, not an
 * oversight, carried over unchanged from the prior round.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService } from "@/core/platform/access";
import { contentPlatformAPI, OutputCatalogRegistry } from "@/core/content";
import type { CampaignPlan, ContentBrief, ContentOutputKind, CreativeOutputKind, GenerationHistoryEntry, PromptIntentAnalysis } from "@/core/content";
import type { ToneOption } from "@/core/ai/types";
import { generateId } from "@/shared/utils/string";
import { setRealGenerator } from "@/core/ai/GenerationEngine";
import { setRealImageGenerator } from "@/core/media/providers/OpenAIMediaProvider";
import { aiService } from "@/aios/services/AIService";
import { generateOpenAIImage, nearestDalle3Size } from "@/aios/gateway/providers/OpenAIImageProvider";
import { saveGeneratedImage, readGeneratedImage } from "@/aios/media/imageStore";
import { recordAIRequest } from "@/aios/persistence";
import { appLogger } from "@/logging";

const MODULE = "ContentStudio.actions";

/** A fixed, disclosed credit cost per generation (matching the scale used for Copilot/Reports) rather than the real per-request token count — a product-pricing choice, not a technical limitation, kept unchanged from before this round. */
const CONTENT_GENERATION_CREDIT_COST = 15;
/** Per real image call — Creative Design Studio's default of 4 variations reserves/commits 4x this. */
const CREATIVE_VARIATION_CREDIT_COST = 15;
/** The one small classification LLM call that turns a freeform prompt into a real catalog output + brief. */
const PROMPT_ANALYSIS_CREDIT_COST = 3;
const CAMPAIGN_ANALYSIS_CREDIT_COST = 3;
/** Below this real vision-model quality score, the affected variation is regenerated once automatically before being shown to the user. */
const QUALITY_THRESHOLD = 70;

const TONE_VALUES: ToneOption[] = ["professional", "conversational", "persuasive", "authoritative", "friendly", "witty", "empathetic", "formal"];

type Actor = { userId: string; organizationId: string };

/**
 * `GenerationEngine.ts` deliberately never imports `aiService` directly
 * (it's reachable from client bundles via Copilot's skill registration) —
 * this is the one, safely-isolated `"use server"` call site that injects
 * the real generator. Re-set on every request with the real actor captured
 * in closure (so AI analytics/context attribution is correct per-request)
 * — cheap, just overwrites a module-level function reference.
 */
function injectRealGenerator(actor: Actor): void {
  setRealGenerator(async finalPrompt => {
    const startedAt = Date.now();
    try {
      const response = await aiService.chat(
        {
          messages: [
            {
              id: generateId(16),
              role: "system",
              content: "You are Calixo's Content Studio AI. Generate exactly the content requested by the brief below, formatted appropriately for its platform and content type. Return ONLY the finished content — no meta-commentary, no explanations, no surrounding markdown fences unless the content itself is meant to include them.",
              timestamp: new Date().toISOString(),
            },
            { id: generateId(16), role: "user", content: finalPrompt, timestamp: new Date().toISOString() },
          ],
        },
        { userId: actor.userId, organizationId: actor.organizationId, module: "content-studio" }
      );
      // Root-cause fix (production incident, brief Step 10/11): Content Studio's real generations
      // were never logged anywhere — the AI Health page and audit trail only ever saw Copilot
      // traffic. Mirrors `AIConversationEngine.run()`'s exact real-request-log pattern.
      await recordAIRequest({
        organizationId: actor.organizationId,
        userId: actor.userId,
        module: "content-studio",
        provider: response.provider,
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        creditsUsed: CONTENT_GENERATION_CREDIT_COST,
        latencyMs: Date.now() - startedAt,
        success: true,
        fallbackActivated: response.provider !== "openai",
      });
      return response.message.content;
    } catch (error) {
      await recordAIRequest({
        organizationId: actor.organizationId,
        userId: actor.userId,
        module: "content-studio",
        provider: "openai",
        model: "gpt-4o-mini",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        creditsUsed: 0,
        latencyMs: Date.now() - startedAt,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        fallbackActivated: false,
      });
      throw error;
    }
  });
}

/**
 * `core/media/**` (reached via `ContentOrchestrationEngine` → `MediaPlatformAPI`) is client-bundle
 * reachable the same way `GenerationEngine` is — real generation is injected the same way, calling
 * the real `gpt-image-1` fetch (`OpenAIImageProvider`) and persisting the bytes to disk
 * (`imageStore.saveGeneratedImage`) so the result outlives OpenAI's ~1-hour temporary URL.
 */
function injectRealImageGenerator(actor: Actor): void {
  setRealImageGenerator(async request => {
    const startedAt = Date.now();
    const size = nearestDalle3Size(request.dimensions.width, request.dimensions.height);
    // gpt-image-1 has no dedicated negative-prompt parameter — the only real way to honor one is
    // folding it into the main prompt as an explicit exclusion instruction.
    const fullPrompt = request.negativePrompt ? `${request.prompt}. Avoid the following: ${request.negativePrompt}.` : request.prompt;
    appLogger.info(MODULE, "Provider selected for image request", { provider: "openai-image", model: "gpt-image-1", size, promptLength: fullPrompt.length });
    try {
      const { base64, revisedPrompt } = await generateOpenAIImage(fullPrompt, size);
      const { url } = await saveGeneratedImage(actor.organizationId, base64);
      appLogger.info(MODULE, "Image persisted, returning URL to caller", { assetUrl: url, latencyMs: Date.now() - startedAt, base64Length: base64.length });
      await recordAIRequest({
        organizationId: actor.organizationId,
        userId: actor.userId,
        module: "content-studio",
        provider: "openai",
        model: "gpt-image-1",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        creditsUsed: CREATIVE_VARIATION_CREDIT_COST,
        latencyMs: Date.now() - startedAt,
        success: true,
        fallbackActivated: false,
      });
      return { assetUrl: url, revisedPrompt, cost: size === "1024x1024" ? 0.04 : 0.08 };
    } catch (error) {
      await recordAIRequest({
        organizationId: actor.organizationId,
        userId: actor.userId,
        module: "content-studio",
        provider: "openai",
        model: "gpt-image-1",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        creditsUsed: 0,
        latencyMs: Date.now() - startedAt,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        fallbackActivated: false,
      });
      throw error;
    }
  });
}

/** Defends against the model wrapping its JSON in ```json fences despite instructions — a real, common failure mode, not a hypothetical. */
function extractJson(text: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  return (fenced ? fenced[1] : text).trim();
}

function readVariationAsDataUri(imageUrl: string): string | undefined {
  const match = /^\/api\/generated-media\/([^/]+)\/([^/]+)\.png$/.exec(imageUrl);
  if (!match) return undefined;
  const buffer = readGeneratedImage(match[1], match[2]);
  return buffer ? `data:image/png;base64,${buffer.toString("base64")}` : undefined;
}

/**
 * Real vision-model quality-control call (the brief's own checklist: typography readability,
 * visual balance, safe margins, platform compatibility, logo/CTA visibility, spelling, grammar,
 * brand consistency) — best-effort: a parse or provider failure never blocks delivering the
 * already-real generated image, it just skips scoring for that variation.
 */
async function runQualityCheck(imageDataUri: string, brief: ContentBrief, outputLabel: string, actor: Actor): Promise<{ score: number; issues: string[] } | undefined> {
  try {
    const response = await aiService.chat(
      {
        messages: [
          {
            id: generateId(16),
            role: "system",
            content:
              'You are a strict creative quality-control reviewer. Look at the attached design image and evaluate it against: typography readability, visual balance, safe margins, platform compatibility, logo visibility, CTA visibility, spelling, grammar, and brand consistency. Respond with ONLY valid JSON, no markdown fences: {"score": <0-100 overall quality score>, "issues": ["<short specific issue>", ...]}. If there are no real issues, return an empty issues array. Never invent an issue that is not visible in the image.',
            timestamp: new Date().toISOString(),
          },
          {
            id: generateId(16),
            role: "user",
            content: `Creative: ${outputLabel}. Objective: ${brief.objective}. The CTA should read: "${brief.cta}".`,
            imageUrls: [imageDataUri],
            timestamp: new Date().toISOString(),
          },
        ],
      },
      { userId: actor.userId, organizationId: actor.organizationId, module: "content-studio" }
    );
    const parsed = JSON.parse(extractJson(response.message.content));
    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, parsed.score)) : 100;
    const issues = Array.isArray(parsed.issues) ? parsed.issues.filter((i: unknown): i is string => typeof i === "string").slice(0, 6) : [];
    return { score, issues };
  } catch {
    return undefined;
  }
}

/** Runs QC on every variation; any variation scoring below `QUALITY_THRESHOLD` is regenerated once automatically (never looped) before its score is recorded — the brief's "if quality score is poor, regenerate automatically." Skipped gracefully (not faked) for images that aren't real persisted files, e.g. if no real image provider was configured for this request. */
async function runQualityPass(entry: GenerationHistoryEntry, brief: ContentBrief, actor: Actor): Promise<GenerationHistoryEntry> {
  if (!entry.variations) return entry;
  for (let i = 0; i < entry.variations.length; i++) {
    const dataUri = readVariationAsDataUri(entry.variations[i].imageUrl);
    if (!dataUri) continue;
    const qc = await runQualityCheck(dataUri, brief, entry.outputLabel, actor);
    if (!qc) continue;

    if (qc.score < QUALITY_THRESHOLD) {
      try {
        await contentPlatformAPI.regenerateVariation(entry.id, i, `Fix these specific problems: ${qc.issues.join("; ") || "improve overall visual quality"}.`);
        const recheckUri = readVariationAsDataUri(entry.variations[i].imageUrl);
        const recheck = recheckUri ? await runQualityCheck(recheckUri, brief, entry.outputLabel, actor) : undefined;
        contentPlatformAPI.recordVariationQuality(entry.id, i, recheck?.score ?? qc.score, recheck?.issues ?? qc.issues);
      } catch {
        contentPlatformAPI.recordVariationQuality(entry.id, i, qc.score, qc.issues);
      }
    } else {
      contentPlatformAPI.recordVariationQuality(entry.id, i, qc.score, qc.issues);
    }
  }
  return entry;
}

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
    injectRealGenerator(actor);
    const entry = await generate();
    await entitlementService.commitAiCredits(actor, reservationId, CONTENT_GENERATION_CREDIT_COST, "Content Studio generation");
    return { ok: true, entry };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong generating that." };
  }
}

export async function generateCreativeAction(brief: ContentBrief, outputId: CreativeOutputKind, variationCount = 4): Promise<ContentGenerationActionResult> {
  const requestId = generateId(12);
  const startedAt = Date.now();
  appLogger.info(MODULE, "generateCreativeAction: received request", { requestId, outputId, variationCount, objectiveLength: brief.objective.length });

  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor: Actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "content");
  if (!moduleCheck.allowed) {
    appLogger.warn(MODULE, "generateCreativeAction: denied at entitlement check", { requestId, reasonCode: moduleCheck.reasonCode });
    return { ok: false, error: moduleCheck.message ?? "Content Studio isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };
  }

  const estimatedCost = Math.max(1, variationCount) * CREATIVE_VARIATION_CREDIT_COST;
  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, estimatedCost, "Content Studio creative generation");
  if (!result.allowed || !reservationId) {
    appLogger.warn(MODULE, "generateCreativeAction: denied at credit reservation", { requestId, estimatedCost, reasonCode: result.reasonCode });
    return { ok: false, error: result.message ?? "Out of AI credits. Purchase additional credits or upgrade your plan.", upgradeTarget: result.upgradeTarget };
  }
  appLogger.info(MODULE, "generateCreativeAction: credits reserved, calling real image provider", { requestId, estimatedCost, provider: "openai", model: "gpt-image-1" });

  try {
    injectRealImageGenerator(actor);
    let entry = await contentPlatformAPI.generateCreative(brief, outputId, actor.organizationId, variationCount);
    entry = await runQualityPass(entry, brief, actor);
    await entitlementService.commitAiCredits(actor, reservationId, estimatedCost, "Content Studio creative generation");
    appLogger.info(MODULE, "generateCreativeAction: complete — real image(s) returned", {
      requestId,
      latencyMs: Date.now() - startedAt,
      variationCount: entry.variations?.length ?? 0,
      imageUrls: entry.variations?.map(v => v.imageUrl),
      creditsUsed: estimatedCost,
    });
    return { ok: true, entry };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    appLogger.error(MODULE, "generateCreativeAction: failed, credits released", error, { requestId, latencyMs: Date.now() - startedAt });
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong generating that." };
  }
}

export async function generateContentAction(brief: ContentBrief, outputId: ContentOutputKind): Promise<ContentGenerationActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  return runContentGeneration(identity.organizationId, identity.userId, () => contentPlatformAPI.generateContent(brief, outputId, identity.organizationId));
}

/** Natural-language post-generation editing ("Make the headline larger") — regeneration-based, disclosed as such; see `ContentOrchestrationEngine.regenerateVariation`'s own doc comment. */
export async function editCreativeVariationAction(entryId: string, variationIndex: number, instruction: string): Promise<ContentGenerationActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor: Actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "content");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Content Studio isn't available on your plan.", upgradeTarget: moduleCheck.upgradeTarget };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, CREATIVE_VARIATION_CREDIT_COST, "Content Studio creative edit");
  if (!result.allowed || !reservationId) return { ok: false, error: result.message ?? "Out of AI credits.", upgradeTarget: result.upgradeTarget };

  try {
    injectRealImageGenerator(actor);
    const entry = await contentPlatformAPI.regenerateVariation(entryId, variationIndex, instruction);
    await entitlementService.commitAiCredits(actor, reservationId, CREATIVE_VARIATION_CREDIT_COST, "Content Studio creative edit");
    return { ok: true, entry };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong applying that change." };
  }
}

// ============================================================================
// Prompt-driven intent analysis — Creative Design Studio / Content Creation Studio
// ============================================================================

export interface ConversationTurn {
  question: string;
  answer: string;
}

export interface PromptAnalysisActionResult {
  ok: boolean;
  analysis?: PromptIntentAnalysis;
  error?: string;
}

/**
 * The Prompt Orchestration Engine's classification step: turns a freeform prompt into a real
 * catalog output id + a filled-in `ContentBrief`, asking at most one clarifying question per
 * round and never inventing a catalog id the model returns — every `outputId` is validated
 * against the real registry before being trusted.
 */
async function analyzePromptIntent(kind: "creative" | "content", rawPrompt: string, conversation: ConversationTurn[], actor: Actor): Promise<PromptIntentAnalysis> {
  const catalog = kind === "creative" ? OutputCatalogRegistry.listCreative() : OutputCatalogRegistry.listContent();
  const catalogLines = catalog.map(c => `- ${c.id}: ${c.label} — ${c.description}`).join("\n");
  const forceResolve = conversation.length >= 2;

  const conversationBlock =
    conversation.length > 0 ? `\n\nPrior clarification exchange:\n${conversation.map(t => `Q: ${t.question}\nA: ${t.answer}`).join("\n")}` : "";

  const system = `You are Calixo's ${kind === "creative" ? "Creative Director" : "Content Strategist"} AI. A user describes what they want in plain language, like a 16-year-old would. Determine which single output below best matches and fill in a brief. Never mention capabilities or limitations — always resolve to something real.

Available outputs (id — label — description):
${catalogLines}
${forceResolve ? "\nYou MUST resolve to a real outputId now from the list above — pick your best guess, never ask another question." : ""}

Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{"outputId": "<an id from the list above, or null only if truly ambiguous>", "objective": "<one-sentence campaign objective>", "audienceName": "<the target audience>", "tone": "<professional|conversational|persuasive|authoritative|friendly|witty|empathetic|formal>", "cta": "<a short call-to-action phrase>", "language": "<language name, e.g. English>", "needsClarification": <true only if outputId is null>, "clarifyingQuestion": "<a single short question, only if needsClarification>", "clarifyingOptions": ["<2-5 short option labels, only if needsClarification>"]}`;

  const response = await aiService.chat(
    {
      messages: [
        { id: generateId(16), role: "system", content: system, timestamp: new Date().toISOString() },
        { id: generateId(16), role: "user", content: `${rawPrompt}${conversationBlock}`, timestamp: new Date().toISOString() },
      ],
    },
    { userId: actor.userId, organizationId: actor.organizationId, module: "content-studio" }
  );

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(extractJson(response.message.content));
  } catch {
    parsed = {};
  }

  const catalogIds = new Set(catalog.map(c => c.id as string));
  const outputId = typeof parsed.outputId === "string" && catalogIds.has(parsed.outputId) ? parsed.outputId : undefined;
  const tone: ToneOption = TONE_VALUES.includes(parsed.tone as ToneOption) ? (parsed.tone as ToneOption) : "professional";

  if (!outputId && !forceResolve && parsed.needsClarification) {
    return {
      resolved: false,
      clarifyingQuestion: typeof parsed.clarifyingQuestion === "string" ? parsed.clarifyingQuestion : "Which format would you like?",
      clarifyingOptions:
        Array.isArray(parsed.clarifyingOptions) && parsed.clarifyingOptions.length > 0
          ? (parsed.clarifyingOptions as unknown[]).filter((o): o is string => typeof o === "string").slice(0, 5)
          : catalog.slice(0, 4).map(c => c.label),
    };
  }

  const resolvedId = outputId ?? catalog[0].id;
  const catalogEntry = catalog.find(c => c.id === resolvedId)!;
  const brief: ContentBrief = {
    objective: typeof parsed.objective === "string" && parsed.objective ? parsed.objective : rawPrompt,
    audienceName: typeof parsed.audienceName === "string" && parsed.audienceName ? parsed.audienceName : "General audience",
    tone,
    cta: typeof parsed.cta === "string" && parsed.cta ? parsed.cta : "Learn More",
    language: typeof parsed.language === "string" && parsed.language ? parsed.language : "English",
  };

  return { resolved: true, outputId: resolvedId, outputLabel: catalogEntry.label, brief };
}

async function runPromptAnalysis(kind: "creative" | "content", rawPrompt: string, conversation: ConversationTurn[]): Promise<PromptAnalysisActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor: Actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "content");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Content Studio isn't available on your plan." };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, PROMPT_ANALYSIS_CREDIT_COST, "Content Studio prompt analysis");
  if (!result.allowed || !reservationId) return { ok: false, error: result.message ?? "Out of AI credits." };

  try {
    const analysis = await analyzePromptIntent(kind, rawPrompt, conversation, actor);
    await entitlementService.commitAiCredits(actor, reservationId, PROMPT_ANALYSIS_CREDIT_COST, "Content Studio prompt analysis");
    return { ok: true, analysis };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong understanding that prompt." };
  }
}

export async function analyzeCreativePromptAction(rawPrompt: string, conversation: ConversationTurn[] = []): Promise<PromptAnalysisActionResult> {
  return runPromptAnalysis("creative", rawPrompt, conversation);
}

export async function analyzeContentPromptAction(rawPrompt: string, conversation: ConversationTurn[] = []): Promise<PromptAnalysisActionResult> {
  return runPromptAnalysis("content", rawPrompt, conversation);
}

// ============================================================================
// Campaign Mode
// ============================================================================

const CAMPAIGN_ASSET_CATALOG: { id: string; label: string; kind: "creative" | "content"; outputId: CreativeOutputKind | ContentOutputKind }[] = [
  { id: "instagram-creative", label: "Instagram Creative", kind: "creative", outputId: "instagram-post" },
  { id: "facebook-creative", label: "Facebook Creative", kind: "creative", outputId: "facebook-post" },
  { id: "linkedin-creative", label: "LinkedIn Creative", kind: "creative", outputId: "linkedin-post" },
  { id: "whatsapp-creative", label: "WhatsApp Creative", kind: "creative", outputId: "whatsapp-creative" },
  { id: "google-display-banner", label: "Google Display Banner", kind: "creative", outputId: "google-display-ad" },
  { id: "email-banner", label: "Email Banner", kind: "creative", outputId: "email-header" },
  { id: "landing-page-hero", label: "Landing Page Hero", kind: "content", outputId: "landing-page" },
  { id: "blog", label: "Blog", kind: "content", outputId: "blog" },
  { id: "google-ads", label: "Google Ads", kind: "content", outputId: "headline" },
  { id: "meta-ads", label: "Meta Ads", kind: "content", outputId: "ad-copy" },
];

export interface CampaignAnalysisActionResult {
  ok: boolean;
  plan?: CampaignPlan;
  error?: string;
}

export async function analyzeCampaignPromptAction(rawPrompt: string): Promise<CampaignAnalysisActionResult> {
  const identity = await resolveIdentity();
  if (!identity) return { ok: false, error: "Sign in required." };
  const actor: Actor = { userId: identity.userId, organizationId: identity.organizationId };

  const moduleCheck = await entitlementService.canAccessModule(actor, "content");
  if (!moduleCheck.allowed) return { ok: false, error: moduleCheck.message ?? "Content Studio isn't available on your plan." };

  const { result, reservationId } = await entitlementService.reserveAiCredits(actor, CAMPAIGN_ANALYSIS_CREDIT_COST, "Content Studio campaign analysis");
  if (!result.allowed || !reservationId) return { ok: false, error: result.message ?? "Out of AI credits." };

  try {
    const system = `You are Calixo's Campaign Strategist AI. A user describes a marketing campaign they want to launch, in plain language. Extract a campaign brief. Respond with ONLY valid JSON, no markdown fences: {"campaignName": "<short campaign name>", "objective": "<one-sentence objective>", "audienceName": "<target audience>", "tone": "<professional|conversational|persuasive|authoritative|friendly|witty|empathetic|formal>", "cta": "<short call-to-action phrase>"}`;
    const response = await aiService.chat(
      {
        messages: [
          { id: generateId(16), role: "system", content: system, timestamp: new Date().toISOString() },
          { id: generateId(16), role: "user", content: rawPrompt, timestamp: new Date().toISOString() },
        ],
      },
      { userId: actor.userId, organizationId: actor.organizationId, module: "content-studio" }
    );

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(extractJson(response.message.content));
    } catch {
      parsed = {};
    }
    const tone: ToneOption = TONE_VALUES.includes(parsed.tone as ToneOption) ? (parsed.tone as ToneOption) : "professional";

    const plan: CampaignPlan = {
      campaignId: `campaign-${Date.now()}-${generateId(6)}`,
      campaignName: typeof parsed.campaignName === "string" && parsed.campaignName ? parsed.campaignName : rawPrompt,
      brief: {
        objective: typeof parsed.objective === "string" && parsed.objective ? parsed.objective : rawPrompt,
        audienceName: typeof parsed.audienceName === "string" && parsed.audienceName ? parsed.audienceName : "General audience",
        tone,
        cta: typeof parsed.cta === "string" && parsed.cta ? parsed.cta : "Learn More",
        language: "English",
      },
      assetOptions: CAMPAIGN_ASSET_CATALOG.map(a => ({ id: a.id, label: a.label, kind: a.kind, outputId: a.outputId, selected: true })),
    };
    await entitlementService.commitAiCredits(actor, reservationId, CAMPAIGN_ANALYSIS_CREDIT_COST, "Content Studio campaign analysis");
    return { ok: true, plan };
  } catch (error) {
    await entitlementService.releaseAiCredits(actor, reservationId);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong understanding that campaign." };
  }
}

export interface CampaignExecutionActionResult {
  ok: boolean;
  results?: GenerationHistoryEntry[];
  error?: string;
}

/** Fans out real, credit-gated generation across every selected asset, one real call per asset — each reuses the exact same shared brief (objective/audience/tone/cta) and `campaignId` for brand-consistent identity across every asset, per the brief's "maintain consistent branding across all assets." */
export async function executeCampaignAction(plan: CampaignPlan, selectedAssetIds: string[]): Promise<CampaignExecutionActionResult> {
  const selected = plan.assetOptions.filter(a => selectedAssetIds.includes(a.id));
  if (selected.length === 0) return { ok: false, error: "Select at least one asset to generate." };

  const results: GenerationHistoryEntry[] = [];
  for (const asset of selected) {
    const brief: ContentBrief = { ...plan.brief, campaignId: plan.campaignId };
    if (asset.kind === "creative") {
      const outcome = await generateCreativeAction(brief, asset.outputId as CreativeOutputKind, 4);
      if (outcome.ok && outcome.entry) results.push(outcome.entry);
    } else {
      const outcome = await generateContentAction(brief, asset.outputId as ContentOutputKind);
      if (outcome.ok && outcome.entry) results.push(outcome.entry);
    }
  }
  return { ok: true, results };
}
