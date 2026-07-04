/**
 * Calixo Platform — Prompt Engine
 *
 * Loads, resolves, and injects context into prompt templates.
 * Generates the final prompt string that is sent to the AI model.
 */

import { promptTemplates, type PromptTemplate } from "@/lib/prompt-templates";
import type { GenerationRequest, BrandContext, AudienceContext, PlatformConstraints } from "./types";
import { BrandContextService } from "./BrandContextService";
import { AudienceContextService } from "./AudienceContextService";
import { PlatformContextService } from "./PlatformContextService";

export const PromptEngine = {
  /**
   * Load a prompt template by ID.
   */
  loadTemplate(templateId: string): PromptTemplate | undefined {
    return promptTemplates.find((t) => t.id === templateId);
  },

  /**
   * Get all available templates.
   */
  getAllTemplates(): PromptTemplate[] {
    return [...promptTemplates];
  },

  /**
   * Get templates filtered by category.
   */
  getTemplatesByCategory(category: string): PromptTemplate[] {
    return promptTemplates.filter((t) => t.category === category);
  },

  /**
   * Replace [VARIABLES] in a prompt string with provided values.
   */
  resolveVariables(prompt: string, variables: Record<string, string>): string {
    let resolved = prompt;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\[${key.toUpperCase()}\\]`, "gi");
      resolved = resolved.replace(regex, value);
    }
    return resolved;
  },

  /**
   * Build a context injection string from brand, audience, and platform.
   */
  buildContextInjection(
    brand: BrandContext,
    audience: AudienceContext,
    platform: PlatformConstraints
  ): string {
    return `
[CONTEXT INJECTION]
Brand: ${brand.brandName}
Brand Voice: ${brand.voice}
Writing Style: ${brand.writingStyle}
Preferred CTA: ${brand.preferredCTA}
Forbidden Words: ${brand.forbiddenWords.join(", ")}
Preferred Words: ${brand.preferredWords.join(", ")}
Business: ${brand.businessType}
Mission: ${brand.mission}

Target Audience: ${audience.audienceName}
Audience Profile: ${audience.profession}, age ${audience.ageGroup}
Interests: ${audience.interests.join(", ")}
Pain Points: ${audience.painPoints.join(", ")}
Goals: ${audience.goals.join(", ")}
Communication Style: ${audience.communicationStyle}

Platform: ${platform.displayName}
Character Limit: ${platform.characterLimit > 0 ? platform.characterLimit + " characters" : "No strict limit"}
Tone: ${platform.recommendedTone}
CTA Rules: ${platform.ctaRules}
Best Practices: ${platform.bestPractices.slice(0, 3).join("; ")}
[/CONTEXT INJECTION]
`.trim();
  },

  /**
   * Optimize a raw prompt for better AI output.
   */
  optimize(prompt: string): string {
    let optimized = prompt.trim();

    // Ensure prompt ends with clear instruction
    if (!optimized.endsWith(".") && !optimized.endsWith("?") && !optimized.endsWith("!")) {
      optimized += ".";
    }

    // Add quality instruction if not present
    if (!optimized.toLowerCase().includes("tone") && optimized.length < 200) {
      optimized += " Write in a professional, engaging tone.";
    }

    return optimized;
  },

  /**
   * Generate the final prompt from a generation request.
   * This is the main entry point — loads template, resolves variables,
   * injects context, optimizes, and returns the final prompt string.
   */
  buildFinalPrompt(request: GenerationRequest): {
    finalPrompt: string;
    template: PromptTemplate | null;
  } {
    const template = request.templateId ? this.loadTemplate(request.templateId) ?? null : null;
    const basePrompt = template
      ? this.resolveVariables(template.prompt, {
          TOPIC: request.campaign,
          BRAND: request.brand.brandName,
          AUDIENCE: request.audience.audienceName,
          PRODUCT: request.campaign,
          INDUSTRY: request.brand.targetIndustry,
          ROLE: request.audience.profession,
          COMPANY: request.brand.brandName,
          N: "5",
        })
      : request.prompt;

    const platform = PlatformContextService.getConstraints(request.platform);
    const contextBlock = this.buildContextInjection(request.brand, request.audience, platform);

    const combined = `${contextBlock}\n\n[TASK]\n${basePrompt}\n\nAdditional Requirements: ${request.tone} tone, ${request.length} length, reading level: ${request.readingLevel}, creativity: ${request.creativity}${request.seoMode ? ", SEO optimized" : ""}${request.brandVoice ? ", adhere strictly to brand voice" : ""}.`;

    const optimized = this.optimize(combined);

    return { finalPrompt: optimized, template };
  },
};