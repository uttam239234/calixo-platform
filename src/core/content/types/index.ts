/**
 * Calixo Platform — Content Studio Orchestration Types
 *
 * Content Studio owns none of the generation/layout/quality/brand/asset logic itself — this is
 * a thin translation layer only. `ContentBrief` is the simplified, jargon-free shape both Studios'
 * prompt-orchestration classifier fills in from a freeform prompt; `ContentOrchestrationEngine`
 * (see ../engine) expands it into the full `GenerationRequest`/`CreativeRequest`/`MediaRequest`
 * shapes the real engines require.
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
  /** Advanced Options only — Creative Design Studio's manual visual-style override, replacing the tone-derived default. */
  visualStyleOverride?: string;
  /** Advanced Options only — appended to the real negative prompt so it's honored even by providers (like DALL-E 3) with no dedicated negative-prompt parameter, via an explicit "Avoid: ..." instruction folded into the main prompt. */
  negativePromptExtra?: string;
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
  | "case-study"
  | "linkedin-post-copy"
  | "x-post-copy"
  | "push-notification"
  | "newsletter";

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
  /** Real, individually-generated layout variations (Creative Design Studio's "4 professional variations") — `primaryImageUrl`/`variantImageUrls` above are kept in sync from this for backward compatibility with older UI/consumers. */
  variations?: CreativeVariation[];
  /** The exact hidden production prompt sent to the image model — stored so natural-language post-generation editing can extend it, never re-derived from scratch. */
  hiddenPrompt?: string;

  localizedVersions?: LocalizedVersion[];

  savedAssetId?: string;
  workflowEntryId?: string;
}

export interface CreativeVariation {
  id: string;
  imageUrl: string;
  layoutLabel: string;
  qualityScore?: number;
  qualityIssues?: string[];
  regenerated?: boolean;
}

// ============================================================================
// Prompt-driven intent analysis (Creative Design Studio / Content Creation Studio)
// ============================================================================

/** The result of classifying a freeform prompt into a real catalog output + a filled-in brief — shared shape for both Studios (`outputId` is a `CreativeOutputKind` or `ContentOutputKind` depending on which analyzer produced it). Never invents a catalog id: an unrecognized/ambiguous prompt always comes back with `resolved: false` and a clarifying question grounded in real catalog labels. */
export interface PromptIntentAnalysis {
  resolved: boolean;
  outputId?: string;
  outputLabel?: string;
  brief?: ContentBrief;
  clarifyingQuestion?: string;
  clarifyingOptions?: string[];
}

// ============================================================================
// Campaign Mode
// ============================================================================

export interface CampaignAssetOption {
  id: string;
  label: string;
  kind: "creative" | "content";
  outputId: CreativeOutputKind | ContentOutputKind;
  selected: boolean;
}

export interface CampaignPlan {
  campaignId: string;
  campaignName: string;
  brief: ContentBrief;
  assetOptions: CampaignAssetOption[];
}

export interface CampaignResult {
  campaignId: string;
  campaignName: string;
  entries: GenerationHistoryEntry[];
}
