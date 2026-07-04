/**
 * Calixo Platform — Enterprise AI Generation Engine Types
 *
 * Shared type definitions for the AI generation engine layer.
 * This engine is platform-agnostic and can be consumed by any module.
 */

// ============================================================================
// Brand Context
// ============================================================================

export interface BrandContext {
  brandName: string;
  voice: string;
  writingStyle: string;
  preferredCTA: string;
  forbiddenWords: string[];
  preferredWords: string[];
  businessType: string;
  targetIndustry: string;
  mission: string;
  vision: string;
}

// ============================================================================
// Audience Context
// ============================================================================

export interface AudienceContext {
  audienceName: string;
  ageGroup: string;
  profession: string;
  interests: string[];
  location: string;
  painPoints: string[];
  goals: string[];
  communicationStyle: string;
}

// ============================================================================
// Platform Context
// ============================================================================

export type Platform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "google-ads"
  | "google-display"
  | "performance-max"
  | "email"
  | "landing-page"
  | "blog"
  | "poster"
  | "flyer"
  | "brochure"
  | "standee";

export interface PlatformConstraints {
  platform: Platform;
  displayName: string;
  characterLimit: number;
  imageRatio: string;
  recommendedTone: string;
  ctaRules: string;
  seoRequirements: string;
  bestPractices: string[];
}

// ============================================================================
// Generation Request
// ============================================================================

export type ContentTypeOption =
  | "blog-article"
  | "facebook-post"
  | "instagram-caption"
  | "linkedin-post"
  | "x-post"
  | "google-search-ad"
  | "google-display-ad"
  | "meta-ad"
  | "email"
  | "landing-page"
  | "product-description"
  | "press-release"
  | "video-script"
  | "cta"
  | "headline";

export type ToneOption =
  | "professional" | "conversational" | "persuasive"
  | "authoritative" | "friendly" | "witty"
  | "empathetic" | "formal";

export type LengthOption = "short" | "medium" | "long" | "comprehensive";
export type ReadingLevelOption = "elementary" | "middle-school" | "high-school" | "college" | "graduate" | "expert";
export type CreativityOption = "conservative" | "balanced" | "creative" | "experimental";

export interface GenerationRequest {
  contentType: ContentTypeOption;
  platform: Platform;
  brand: BrandContext;
  audience: AudienceContext;
  campaign: string;
  language: string;
  tone: ToneOption;
  length: LengthOption;
  readingLevel: ReadingLevelOption;
  creativity: CreativityOption;
  seoMode: boolean;
  brandVoice: boolean;
  model: string;
  prompt: string;
  templateId: string | null;
}

// ============================================================================
// Generation Result
// ============================================================================

export interface QualityScores {
  promptQuality: number;
  readabilityScore: number;
  seoScore: number;
  brandCompliance: number;
  estimatedEngagement: number;
  estimatedCTR: number;
  ctaQuality: number;
  contentScore: number;
}

export interface GenerationResult {
  id: string;
  content: string;
  request: GenerationRequest;
  finalPrompt: string;
  metadata: {
    model: string;
    tokensUsed: number;
    generationTimeMs: number;
    cost: number;
    characterCount: number;
    wordCount: number;
  };
  quality: QualityScores;
  suggestions: string[];
}

// ============================================================================
// Generation History
// ============================================================================

export interface HistoryEntry {
  id: string;
  timestamp: string;
  request: GenerationRequest;
  result: GenerationResult;
}