/**
 * Calixo Platform — Creative Validator
 *
 * Evaluates creative output for platform compliance, brand compliance,
 * accessibility, readability, text density, and visual hierarchy.
 */

import type { CreativeRequest, CreativeResult, CreativeValidation } from "./types";
import { PlatformKnowledgeService } from "./PlatformKnowledgeService";

export const CreativeValidator = {
  /**
   * Validate a creative result against all quality criteria.
   */
  validate(request: CreativeRequest, result: CreativeResult): CreativeValidation {
    const platformCompliance = this.checkPlatformCompliance(request, result);
    const brandCompliance = this.checkBrandCompliance(request);
    const accessibility = this.checkAccessibility(request, result);
    const readability = this.checkReadability(request);
    const textDensity = this.checkTextDensity(request);
    const visualHierarchy = this.checkVisualHierarchy(request, result);

    const scores = [
      platformCompliance.passed ? 100 : 40,
      brandCompliance.passed ? 100 : 50,
      accessibility.score,
      readability.score,
      textDensity.status === "good" ? 90 : textDensity.status === "warning" ? 60 : 30,
      visualHierarchy.passed ? 100 : 50,
    ];

    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return {
      platformCompliance,
      brandCompliance,
      accessibility,
      readability,
      textDensity,
      visualHierarchy,
      overallScore,
    };
  },

  /**
   * Check if the creative complies with platform rules.
   */
  checkPlatformCompliance(request: CreativeRequest, result: CreativeResult) {
    const issues: string[] = [];
    const platform = PlatformKnowledgeService.get(request.platform);

    // Check dimensions
    const dims = result.dimensions;
    if (!dims || dims.width === 0 || dims.height === 0) {
      issues.push("Invalid dimensions");
    }

    // Check character limits
    if (request.message.length > platform.characterLimits.body) {
      issues.push(`Message exceeds platform body limit of ${platform.characterLimits.body} characters (current: ${request.message.length})`);
    }

    if (request.cta.length > platform.characterLimits.cta) {
      issues.push(`CTA exceeds platform limit of ${platform.characterLimits.cta} characters`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  /**
   * Check brand compliance.
   */
  checkBrandCompliance(request: CreativeRequest) {
    const issues: string[] = [];

    if (request.includeLogo && !request.brand.logo) {
      issues.push("Logo inclusion requested but no logo provided");
    }

    if (request.includeBrandColors && request.brand.colors.length === 0) {
      issues.push("Brand colours requested but no brand colours defined");
    }

    if (request.message.length < 5) {
      issues.push("Message is too short for effective brand communication");
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  /**
   * Check accessibility requirements.
   */
  checkAccessibility(request: CreativeRequest, _result: CreativeResult) {
    const issues: string[] = [];
    const platform = PlatformKnowledgeService.get(request.platform);
    let score = 80;

    // Check text density for readability
    if (platform.textDensity === "minimal" && request.message.length > 100) {
      issues.push("Text-heavy design on a visual-first platform — consider reducing text");
      score -= 20;
    }

    // Check contrast
    if (request.colorPalette.length < 2) {
      issues.push("Limited colour palette may affect contrast and accessibility");
      score -= 10;
    }

    return {
      passed: issues.length === 0,
      issues,
      score,
    };
  },

  /**
   * Check readability.
   */
  checkReadability(request: CreativeRequest) {
    const wordCount = request.message.split(/\s+/).filter(Boolean).length;
    let score = 80;
    let level = "Good";

    if (wordCount > 50) {
      level = "Dense";
      score -= 15;
    } else if (wordCount > 30) {
      level = "Moderate";
      score -= 5;
    } else if (wordCount < 3) {
      level = "Too brief";
      score -= 20;
    }

    const averageWordLength = request.message.length / Math.max(wordCount, 1);
    if (averageWordLength > 7) {
      level = "Complex";
      score -= 10;
    }

    return { score: Math.max(0, Math.min(100, score)), level };
  },

  /**
   * Check text density ratio.
   */
  checkTextDensity(request: CreativeRequest) {
    const platform = PlatformKnowledgeService.get(request.platform);
    const densityMap: Record<string, number> = {
      minimal: 0.05, low: 0.15, medium: 0.3, high: 0.5,
    };

    const maxRatio = densityMap[platform.textDensity] ?? 0.3;
    const charCount = request.message.length;
    const estimatedRatio = Math.min(1, charCount / 500); // Rough estimate

    let status: "good" | "warning" | "exceeded" = "good";
    if (estimatedRatio > maxRatio * 1.5) status = "exceeded";
    else if (estimatedRatio > maxRatio) status = "warning";

    return { ratio: parseFloat(estimatedRatio.toFixed(2)), status };
  },

  /**
   * Check visual hierarchy.
   */
  checkVisualHierarchy(request: CreativeRequest, _result: CreativeResult) {
    const issues: string[] = [];

    if (!request.message || request.message.length < 3) {
      issues.push("No clear primary message defined");
    }

    if (!request.cta || request.cta.length < 2) {
      issues.push("No clear call-to-action defined");
    }

    if (request.includeLogo && request.includeBrandColors) {
      // Good — full brand integration
    } else if (!request.includeLogo && !request.includeBrandColors) {
      issues.push("No brand elements included — may lack brand recognition");
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },
};