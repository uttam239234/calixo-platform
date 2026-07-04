/**
 * Calixo Platform — Creative Intelligence Layer Types
 *
 * Shared type definitions for the Creative Engine.
 * Platform-agnostic — any future module can consume these.
 */

// ============================================================================
// Platforms
// ============================================================================

export type CreativePlatform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "google-search"
  | "google-display"
  | "performance-max"
  | "meta-ads"
  | "youtube"
  | "whatsapp"
  | "email"
  | "blog"
  | "print";

// ============================================================================
// Creative Types
// ============================================================================

export type CreativeType =
  | "social-post"
  | "story"
  | "carousel"
  | "reel-cover"
  | "thumbnail"
  | "display-banner"
  | "poster"
  | "flyer"
  | "brochure"
  | "standee"
  | "billboard"
  | "presentation"
  | "infographic"
  | "email-header"
  | "landing-hero";

// ============================================================================
// Platform Knowledge
// ============================================================================

export interface PlatformDimensions {
  width: number;
  height: number;
  unit: "px" | "mm" | "in";
}

export interface PlatformKnowledge {
  platform: CreativePlatform;
  displayName: string;
  recommendedDimensions: PlatformDimensions[];
  safeAreas: { top: number; bottom: number; left: number; right: number; unit: string };
  characterLimits: { headline: number; body: number; cta: number };
  imageRatio: string;
  videoRatio: string;
  ctaPosition: "bottom-right" | "bottom-center" | "bottom-left" | "center" | "top-right" | "overlay";
  textDensity: "minimal" | "low" | "medium" | "high";
  brandPlacement: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-right" | "center";
  recommendedFontSizes: { headline: string; subheadline: string; body: string; cta: string };
  bestPractices: string[];
  accessibilityRules: string[];
}

// ============================================================================
// Creative Type Knowledge
// ============================================================================

export interface CreativeTypeKnowledge {
  type: CreativeType;
  displayName: string;
  description: string;
  compatiblePlatforms: CreativePlatform[];
  layoutRules: string[];
  recommendedStructure: LayoutSection[];
  visualHierarchy: string[];
  requiredElements: string[];
  optionalElements: string[];
}

export interface LayoutSection {
  name: string;
  position: string;
  elements: LayoutElement[];
  notes: string;
}

export interface LayoutElement {
  type: "headline" | "image" | "logo" | "cta" | "text" | "icon" | "divider" | "background";
  label: string;
  position: { x: string; y: string; width: string; height: string };
  required: boolean;
  style: string;
}

// ============================================================================
// Design System
// ============================================================================

export interface DesignSystemRules {
  spacing: {
    unit: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  margins: { top: number; bottom: number; left: number; right: number };
  padding: { xs: number; sm: number; md: number; lg: number };
  grid: { columns: number; gutter: number; margin: number; maxWidth: number };
  typography: {
    scale: Record<string, { size: string; lineHeight: string; weight: number }>;
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
  };
  colorPriority: string[];
  logoRules: { minSize: number; clearSpace: number; allowedPositions: string[] };
  contrastRules: { minRatio: number; textOnImage: string };
  whitespaceRules: { minPadding: number; elementSpacing: number; sectionSpacing: number };
  visualBalance: { ruleOfThirds: boolean; focalPoint: string; weightDistribution: string };
}

// ============================================================================
// Creative Request & Result
// ============================================================================

export interface CreativeRequest {
  platform: CreativePlatform;
  creativeType: CreativeType;
  campaign: string;
  brand: { name: string; logo?: string; colors: string[]; fonts: string[] };
  audience: string;
  visualStyle: string;
  colorPalette: string[];
  message: string;
  cta: string;
  includeLogo: boolean;
  includeBrandColors: boolean;
}

export interface LayoutBlueprint {
  creativeType: CreativeType;
  platform: CreativePlatform;
  dimensions: PlatformDimensions;
  sections: LayoutSection[];
}

export interface CreativeValidation {
  platformCompliance: { passed: boolean; issues: string[] };
  brandCompliance: { passed: boolean; issues: string[] };
  accessibility: { passed: boolean; issues: string[]; score: number };
  readability: { score: number; level: string };
  textDensity: { ratio: number; status: "good" | "warning" | "exceeded" };
  visualHierarchy: { passed: boolean; issues: string[] };
  overallScore: number;
}

export interface CreativePrompt {
  platform: CreativePlatform;
  creativeType: CreativeType;
  dimensions: string;
  prompt: string;
  negativePrompt: string;
  styleKeywords: string[];
  colorInstructions: string;
  compositionInstructions: string;
}

export interface CreativeResult {
  platform: CreativePlatform;
  creativeType: CreativeType;
  dimensions: PlatformDimensions;
  layout: LayoutBlueprint;
  prompt: CreativePrompt;
  colorRecommendations: string[];
  typographyRecommendations: string[];
  brandPlacement: string;
  ctaPlacement: string;
  accessibilityNotes: string[];
  validation: CreativeValidation;
  futureImagePayload: {
    prompt: string;
    negativePrompt: string;
    width: number;
    height: number;
    stylePreset: string;
    colorPalette: string[];
  };
}