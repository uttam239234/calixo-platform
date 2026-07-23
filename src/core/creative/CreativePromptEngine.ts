/**
 * Calixo Platform — Creative Prompt Engine
 *
 * Builds professional image generation prompts from creative requests.
 * Future image providers (DALL-E, Midjourney, Stable Diffusion, Flux, Ideogram)
 * will consume these prompts.
 */

import type { CreativeRequest, CreativePrompt, CreativePlatform, CreativeType, PlatformDimensions } from "./types";
import { PlatformKnowledgeService } from "./PlatformKnowledgeService";

export const CreativePromptEngine = {
  /**
   * Build a complete image generation prompt from a creative request.
   */
  buildPrompt(request: CreativeRequest, dimensions: PlatformDimensions): CreativePrompt {
    const platformKnowledge = PlatformKnowledgeService.get(request.platform);
    const dimStr = `${dimensions.width}x${dimensions.height}${dimensions.unit}`;

    const styleKeywords = this.getStyleKeywords(request.visualStyle, request.platform);
    const colorInstructions = this.buildColorInstructions(request.colorPalette, request.includeBrandColors, request.brand.colors);
    const compositionInstructions = this.buildCompositionInstructions(request.platform, request.creativeType);
    const prompt = this.buildPromptText(request, platformKnowledge.displayName, dimStr, styleKeywords);
    const negativePrompt = this.buildNegativePrompt(request);

    return {
      platform: request.platform,
      creativeType: request.creativeType,
      dimensions: dimStr,
      prompt,
      negativePrompt,
      styleKeywords,
      colorInstructions,
      compositionInstructions,
    };
  },

  /**
   * Build the main positive prompt text.
   */
  buildPromptText(request: CreativeRequest, platformName: string, dimensions: string, styleKeywords: string[]): string {
    const parts: string[] = [];

    // Platform and type context
    parts.push(`Professional ${request.creativeType.replace("-", " ")} for ${platformName}, ${dimensions}`);

    // Campaign and message
    if (request.campaign) parts.push(`"${request.campaign}"`);
    if (request.message) parts.push(`message: "${request.message}"`);

    // Visual style
    parts.push(`style: ${request.visualStyle || "modern, professional"}`);

    // Brand elements
    if (request.includeLogo) parts.push("include subtle brand logo placement");
    if (request.includeBrandColors) parts.push(`brand colors: ${request.brand.colors.join(", ")}`);

    // Audience context
    if (request.audience) parts.push(`target audience: ${request.audience}`);

    // CTA
    if (request.cta) parts.push(`CTA text: "${request.cta}"`);

    // Safe margins + platform best practices — real platform knowledge folded directly into the
    // image prompt, not just used for post-hoc quality scoring.
    const platformKnowledge = PlatformKnowledgeService.get(request.platform);
    const safeAreas = platformKnowledge.safeAreas;
    if (safeAreas.top > 0 || safeAreas.bottom > 0 || safeAreas.left > 0 || safeAreas.right > 0) {
      parts.push(`safe margins: keep headline, logo, and CTA at least ${safeAreas.top}${safeAreas.unit} from the top, ${safeAreas.bottom}${safeAreas.unit} from the bottom, ${safeAreas.left}${safeAreas.unit} from the left, and ${safeAreas.right}${safeAreas.unit} from the right`);
    }
    if (platformKnowledge.bestPractices.length > 0) {
      parts.push(`platform best practice: ${platformKnowledge.bestPractices[0]}`);
    }

    // Style keywords
    parts.push(styleKeywords.join(", "));

    // Quality boosters
    parts.push("high resolution, professional design, clean layout, premium quality, commercial use, 8K");

    return parts.join(". ").trim();
  },

  /**
   * Build negative prompt to exclude unwanted elements.
   */
  buildNegativePrompt(request: CreativeRequest): string {
    const base = "low quality, blurry, pixelated, watermark, signature, text errors, cropped, distorted, amateur, cluttered, messy, ugly, deformed, bad anatomy, extra limbs, fused fingers";
    const platformSpecific = this.getPlatformNegativePrompt(request.platform);
    return `${base}${platformSpecific}`;
  },

  getPlatformNegativePrompt(platform: CreativePlatform): string {
    const rules: Record<string, string> = {
      instagram: ", Instagram UI elements, phone frame, screenshot, notification bar, navigation bar",
      facebook: ", Facebook UI elements, notification icons, like button overlay",
      linkedin: ", LinkedIn UI elements, connection request overlay, notification badge",
      youtube: ", timestamp overlay, play button overlay, video player UI, progress bar",
      "google-display": ", browser chrome, ad badge, close button overlay",
    };
    return rules[platform] ?? "";
  },

  /**
   * Get style keywords for the visual style.
   */
  getStyleKeywords(visualStyle: string, platform: CreativePlatform): string[] {
    const base = ["professional", "clean", "high contrast"];
    const styleMap: Record<string, string[]> = {
      modern: ["modern", "minimalist", "sleek", "contemporary"],
      corporate: ["corporate", "professional", "formal", "clean"],
      creative: ["creative", "artistic", "bold", "expressive"],
      playful: ["playful", "colorful", "fun", "energetic"],
      luxury: ["luxury", "premium", "elegant", "sophisticated"],
      tech: ["tech", "futuristic", "digital", "innovative"],
    };
    return [...(styleMap[visualStyle.toLowerCase()] ?? base), ...base];
  },

  /**
   * Build colour instructions string.
   */
  buildColorInstructions(palette: string[], includeBrand: boolean, brandColors: string[]): string {
    if (includeBrand && brandColors.length > 0) {
      return `Use brand colors as primary palette: ${brandColors.join(", ")}. Accent with ${palette.slice(0, 2).join(" and ")} if needed.`;
    }
    return `Use colour palette: ${palette.join(", ")}. Ensure high contrast.`;
  },

  /**
   * Build composition instructions.
   */
  buildCompositionInstructions(platform: CreativePlatform, creativeType: CreativeType): string {
    const instructions: string[] = [];

    if (creativeType === "carousel") {
      instructions.push("Create a 5-card carousel sequence with consistent design language");
    }
    if (creativeType === "story") {
      instructions.push("Vertical 9:16 composition. Keep key content in the centre safe zone. Allow space for UI overlay at top and bottom.");
    }
    if (creativeType === "thumbnail") {
      instructions.push("16:9 composition. Bold, high-contrast thumbnail style. Avoid bottom-right (timestamp area).");
    }
    if (creativeType === "billboard") {
      instructions.push("Large format. Readable from distance. Maximum 7 words total.");
    }
    if (platform === "instagram" || platform === "meta-ads") {
      instructions.push("Ensure critical content is away from top/bottom 15% safe zones.");
    }

    return instructions.join(" ") || "Standard composition with clear visual hierarchy.";
  },
};