/**
 * Calixo Platform — Creative Engine
 *
 * Main orchestration service for the Creative Intelligence Layer.
 * Pipeline: Platform → Creative Type → Layout Engine → Design Engine → Creative Prompt → Validation → Output.
 *
 * Future modules call:
 *   const result = await CreativeEngine.generate(request);
 * No dependency on Content Studio required.
 */

import type { CreativeRequest, CreativeResult } from "./types";
import { PlatformKnowledgeService } from "./PlatformKnowledgeService";
import { CreativeTypeService } from "./CreativeTypeService";
import { LayoutEngine } from "./LayoutEngine";
import { DesignSystemEngine } from "./DesignSystemEngine";
import { CreativePromptEngine } from "./CreativePromptEngine";
import { CreativeValidator } from "./CreativeValidator";

export const CreativeEngine = {
  /**
   * Main entry point: orchestrate the full creative pipeline.
   */
  generate(request: CreativeRequest): CreativeResult {
    // 1. Platform Knowledge
    const platformKnowledge = PlatformKnowledgeService.get(request.platform);
    const dimensions = platformKnowledge.recommendedDimensions[0];

    // 2. Creative Type Knowledge
    const creativeTypeKnowledge = CreativeTypeService.get(request.creativeType);

    // 3. Layout Blueprint
    const layout = LayoutEngine.generate(request.creativeType, request.platform);

    // 4. Design System Rules
    const designSystem = DesignSystemEngine.get();
    const colorRecommendations = this.getColorRecommendations(request, designSystem.colorPriority);
    const typographyRecommendations = this.getTypographyRecommendations(request, designSystem.typography);

    // 5. Creative Prompt
    const prompt = CreativePromptEngine.buildPrompt(request, dimensions);

    // 6. Brand & CTA Placement
    const brandPlacement = `${platformKnowledge.brandPlacement} corner, ${platformKnowledge.recommendedFontSizes.headline} for headline`;
    const ctaPlacement = `${platformKnowledge.ctaPosition} position, ${platformKnowledge.recommendedFontSizes.cta} for CTA`;

    // 7. Accessibility Notes
    const accessibilityNotes = platformKnowledge.accessibilityRules ?? [];

    // 8. Build Result
    const result: CreativeResult = {
      platform: request.platform,
      creativeType: request.creativeType,
      dimensions,
      layout,
      prompt,
      colorRecommendations,
      typographyRecommendations,
      brandPlacement,
      ctaPlacement,
      accessibilityNotes,
      validation: {
        platformCompliance: { passed: true, issues: [] },
        brandCompliance: { passed: true, issues: [] },
        accessibility: { passed: true, issues: [], score: 100 },
        readability: { score: 80, level: "Good" },
        textDensity: { ratio: 0.3, status: "good" },
        visualHierarchy: { passed: true, issues: [] },
        overallScore: 85,
      },
      futureImagePayload: {
        prompt: prompt.prompt,
        negativePrompt: prompt.negativePrompt,
        width: dimensions.width,
        height: dimensions.height,
        stylePreset: request.visualStyle || "modern",
        colorPalette: request.includeBrandColors ? request.brand.colors : request.colorPalette,
      },
    };

    // 9. Validate
    result.validation = CreativeValidator.validate(request, result);

    return result;
  },

  getColorRecommendations(request: CreativeRequest, colorPriority: string[]): string[] {
    const recommendations: string[] = [];
    if (request.includeBrandColors && request.brand.colors.length > 0) {
      recommendations.push(`Primary: ${request.brand.colors[0]}`);
      if (request.brand.colors[1]) recommendations.push(`Secondary: ${request.brand.colors[1]}`);
    }
    if (request.colorPalette.length > 0) {
      recommendations.push(`Accent palette: ${request.colorPalette.slice(0, 3).join(", ")}`);
    }
    recommendations.push(`Text: Use ${colorPriority.includes("text-primary") ? "high contrast dark/light" : "readable contrast"} against background`);
    recommendations.push(`Background: Clean, uncluttered ${request.visualStyle === "luxury" ? "dark" : "light"} background preferred`);
    return recommendations;
  },

  getTypographyRecommendations(request: CreativeRequest, typography: any): string[] {
    return [
      `Heading: ${typography.headingFont}, ${typography.scale["h2"]?.size ?? "32px"}, weight ${typography.scale["h2"]?.weight ?? 600}`,
      `Body: ${typography.bodyFont}, ${typography.scale["body-md"]?.size ?? "16px"}, line-height ${typography.scale["body-md"]?.lineHeight ?? 1.5}`,
      `CTA: Bold, ${typography.scale["h4"]?.size ?? "20px"}, high contrast`,
      `Keep font hierarchy: headline → subheadline → body → CTA`,
    ];
  },
};