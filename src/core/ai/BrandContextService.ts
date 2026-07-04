/**
 * Calixo Platform — Brand Context Service
 *
 * Collects and resolves brand-level context for AI content generation.
 * Used by GenerationEngine to inject brand voice and identity into prompts.
 */

import type { BrandContext } from "./types";

const DEFAULT_BRAND: BrandContext = {
  brandName: "Calixo",
  voice: "Professional, innovative, empowering",
  writingStyle: "Clear, concise, benefit-driven with data-backed claims",
  preferredCTA: "Start Free Trial →",
  forbiddenWords: ["cheap", "maybe", "hopefully", "just"],
  preferredWords: ["transformative", "enterprise-grade", "intelligent", "scalable", "proven"],
  businessType: "SaaS / Enterprise AI Marketing Platform",
  targetIndustry: "Marketing Technology, Enterprise SaaS, Digital Agencies",
  mission: "Empower every marketing team with AI-driven content intelligence",
  vision: "To become the operating system for enterprise content creation and distribution",
};

const BRAND_PRESETS: Record<string, BrandContext> = {
  calixo: DEFAULT_BRAND,
  enterprise: {
    ...DEFAULT_BRAND,
    voice: "Authoritative, executive-level, strategic",
    writingStyle: "Formal yet accessible, thought-leadership oriented with case studies and ROI metrics",
    preferredCTA: "Schedule Enterprise Demo →",
  },
  startup: {
    ...DEFAULT_BRAND,
    voice: "Energetic, bold, innovative",
    writingStyle: "Conversational and punchy, with emojis and relatable anecdotes",
    preferredCTA: "Get Started Free 🚀",
    forbiddenWords: [...DEFAULT_BRAND.forbiddenWords, "enterprise", "complex"],
    preferredWords: ["game-changing", "agile", "disruptive", "lean", "fast"],
  },
};

export const BrandContextService = {
  /**
   * Resolve brand context by brand identifier, falling back to defaults.
   */
  resolve(brandId?: string): BrandContext {
    if (brandId && BRAND_PRESETS[brandId]) {
      return { ...BRAND_PRESETS[brandId] };
    }
    return { ...DEFAULT_BRAND };
  },

  /**
   * Build a custom brand context from partial input (e.g. from generator UI).
   */
  buildFromInput(input: Partial<BrandContext> & { brandName: string }): BrandContext {
    return {
      brandName: input.brandName,
      voice: input.voice ?? DEFAULT_BRAND.voice,
      writingStyle: input.writingStyle ?? DEFAULT_BRAND.writingStyle,
      preferredCTA: input.preferredCTA ?? DEFAULT_BRAND.preferredCTA,
      forbiddenWords: input.forbiddenWords ?? [...DEFAULT_BRAND.forbiddenWords],
      preferredWords: input.preferredWords ?? [...DEFAULT_BRAND.preferredWords],
      businessType: input.businessType ?? DEFAULT_BRAND.businessType,
      targetIndustry: input.targetIndustry ?? DEFAULT_BRAND.targetIndustry,
      mission: input.mission ?? DEFAULT_BRAND.mission,
      vision: input.vision ?? DEFAULT_BRAND.vision,
    };
  },

  /**
   * Get default brand context.
   */
  getDefault(): BrandContext {
    return { ...DEFAULT_BRAND };
  },
};