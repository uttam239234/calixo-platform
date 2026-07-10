/**
 * Calixo Platform — Content Studio Orchestration Types
 *
 * Content Studio owns none of the generation/layout/quality/brand/asset logic itself — this is
 * a thin translation layer only. `ContentBrief` is the simplified, jargon-free shape Simple Mode
 * and the AI Assistant collect; `ContentOrchestrationEngine` (see ../engine) expands it into the
 * full `GenerationRequest`/`CreativeRequest`/`MediaRequest` shapes the real engines require.
 *
 * Platform is intentionally NOT part of `ContentBrief` — each catalog entry (see ../registry)
 * already pins its own authoritative platform, so there is never a mismatch between what the
 * user picked and what the underlying engine is told.
 */
import type { ToneOption } from "@/core/ai/types";

export interface ContentBrief {
  objective: string;
  audienceName: string;
  tone: ToneOption;
  cta: string;
  language: string;
  brandStyleId?: string;
  /** Advanced Mode only — links this generation to a real Ads campaign. */
  campaignId?: string;
  /** Advanced Mode only — trades creative range for tighter brand-voice/style adherence. */
  strictBrandRules?: boolean;
}

// ============================================================================
// Output catalogs — the brief's exact, jargon-free named outputs
// ============================================================================

export type CreativeOutputKind =
  | "instagram-post"
  | "instagram-story"
  | "facebook-post"
  | "facebook-carousel"
  | "linkedin-post"
  | "linkedin-carousel"
  | "google-display-ad"
  | "google-pmax-assets"
  | "whatsapp-creative"
  | "banner-ad"
  | "email-header"
  | "flyer"
  | "poster"
  | "brochure"
  | "event-banner"
  | "custom-size";

export type ContentOutputKind =
  | "social-caption"
  | "ad-copy"
  | "headline"
  | "blog"
  | "email"
  | "whatsapp-campaign"
  | "sms"
  | "landing-page"
  | "brochure-copy"
  | "press-release"
  | "video-script"
  | "product-description"
  | "case-study";

export type OutputGroup = "Social" | "Ads" | "Messaging" | "Print & Events" | "Custom" | "Long-form" | "Sales";

export interface CreativeOutputCatalogEntry {
  id: CreativeOutputKind;
  label: string;
  description: string;
  group: OutputGroup;
  creativeType: import("@/core/creative/types").CreativeType;
  platform: import("@/core/creative/types").CreativePlatform;
  /** Only set for outputs that fan out into more than one rendered asset per generation (e.g. Google PMax's 3-ratio asset group). */
  assetSetSize?: number;
}

export interface ContentOutputCatalogEntry {
  id: ContentOutputKind;
  label: string;
  description: string;
  group: OutputGroup;
  contentType: import("@/core/ai/types").ContentTypeOption;
  platform: import("@/core/ai/types").Platform;
  defaultLength: import("@/core/ai/types").LengthOption;
}

// ============================================================================
// Content actions (rewrite/shorten/expand/translate/improve-*)
// ============================================================================

export type ContentAction =
  | "rewrite"
  | "shorten"
  | "expand"
  | "translate"
  | "improve-readability"
  | "improve-engagement"
  | "improve-seo";

// ============================================================================
// Generation history ("My Creations")
// ============================================================================

export type GenerationHistoryKind = "creative" | "content";

export interface PlatformVersion {
  platform: string;
  imageUrl: string;
}

export interface LocalizedVersion {
  language: string;
  text?: string;
  imageUrl?: string;
}

export interface GenerationHistoryEntry {
  id: string;
  kind: GenerationHistoryKind;
  outputId: CreativeOutputKind | ContentOutputKind;
  outputLabel: string;
  createdAt: string;
  organizationId: string;
  brief: ContentBrief;

  // Content-kind fields
  primaryText?: string;
  shortText?: string;
  longText?: string;
  textVariants?: string[];
  hashtags?: string[];
  ctaVariations?: string[];

  // Creative-kind fields
  primaryImageUrl?: string;
  variantImageUrls?: string[];
  platformVersions?: PlatformVersion[];

  localizedVersions?: LocalizedVersion[];

  savedAssetId?: string;
  workflowEntryId?: string;
}

// ============================================================================
// Mode
// ============================================================================

export type ContentStudioMode = "simple" | "advanced";

// ============================================================================
// AI Assistant — deterministic conversation
// ============================================================================

export type AssistantQuestionId = "channels" | "audience" | "geography" | "needType" | "tone" | "cta";
export type AssistantNeedType = "creative" | "content" | "both";

export interface AssistantQuestionOption {
  id: string;
  label: string;
}

export interface AssistantQuestion {
  id: AssistantQuestionId;
  prompt: string;
  options: AssistantQuestionOption[];
}

export interface AssistantTurn {
  role: "assistant" | "user";
  message: string;
  questionId?: AssistantQuestionId;
}

export interface AssistantAnswers {
  channels?: string;
  audience?: string;
  geography?: string;
  needType?: AssistantNeedType;
  tone?: ToneOption;
  cta?: string;
}

export interface AssistantSession {
  turns: AssistantTurn[];
  answers: AssistantAnswers;
  objective: string;
  done: boolean;
}
